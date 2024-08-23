// FIXME: jsdoc

import LoginViewModel from 'onedata-gui-common/utils/login-view-model';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import handleLoginEndpoint from 'onezone-gui/utils/handle-login-endpoint';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { inject as service } from '@ember/service';
import DOMPurify from 'dompurify';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import AuthenticationErrorMessage from 'onedata-gui-common/mixins/authentication-error-message';
import { underscore } from '@ember/string';
import { sessionExpiredCookie } from 'onedata-gui-common/components/websocket-reconnection-modal';
import globals from 'onedata-gui-common/utils/globals';
import { htmlSafe } from '@ember/template';
import sleep from 'onedata-gui-common/utils/sleep';

const mixins = [
  OwnerInjector,
  AuthenticationErrorMessage,
];

const fatalBasicAuthErrors = Object.freeze([
  'basicAuthNotSupported',
  'basicAuthDisabled',
  'userBlocked',
]);

export default LoginViewModel.extend(...mixins, {
  i18n: service(),
  onezoneServer: service(),
  guiMessageManager: service(),
  authorizerManager: service(),
  session: service(),
  globalNotify: service(),
  guiUtils: service(),
  cookies: service(),
  onedataConnection: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.onezoneLoginViewModel',

  /**
   * @virtual
   * @type {AuthenticationErrorReason}
   */
  authenticationErrorReason: undefined,

  /**
   * @virtual
   * @type {AuthenticationErrorState}
   */
  authenticationErrorState: undefined,

  /**
   * @virtual
   * @type {() => void}
   */
  onAuthenticationSuccess: undefined,

  /**
   * @virtual
   * @type {(error) => void}
   */
  onAuthEndpointError: undefined,

  // FIXME:
  testMode: false,

  //#region state

  activeAuthorizer: null,

  //#endregion

  /**
   * Array of all suported authorizers
   * @type {PromiseArray<AuthorizerInfo>}
   */
  availableAuthorizersProxy: computed('testMode', function availableAuthorizersProxy() {
    return promiseObject(this.authorizerManager.getAvailableAuthorizers(this.testMode));
  }),

  signInNotificationProxy: computed(function signInNotificationProxy() {
    return this.guiMessageManager
      .getMessage('signin_notification')
      .then(message => {
        const sanitizedMessage =
          DOMPurify.sanitize(message, { ALLOWED_TAGS: ['#text'] }).toString();
        return sanitizedMessage?.replaceAll('\n', '<br>') || undefined;
      });
  }),

  sessionHasExpired: computed(function sessionHasExpired() {
    return this.consumeSessionExpiredCookie();
  }),

  browserDomain: computed(function browserDomain() {
    return globals.location.hostname;
  }),

  // FIXME: raczej nie zwracać tutaj HTML, tylko opakować w HTML na dalszym etapie
  onezoneDomain: computed('onedataConnection.zoneDomain', function onezoneDomain() {
    return this.onedataConnection.zoneDomain ?? htmlSafe(`<em>${this.t('unknown')}</em>`);
  }),

  isDomainMismatch: computed(
    'browserDomain',
    'onezoneDomain',
    function isDomainMismatch() {
      return this.browserDomain !== this.onezoneDomain;
    }
  ),

  privacyPolicyUrl: reads('guiMessageManager.privacyPolicyUrl'),

  termsOfUseUrl: reads('guiMessageManager.termsOfUseUrl'),

  /**
   * @type {ComputedProperty<object>}
   */
  softwareVersionDetails: reads('guiUtils.softwareVersionDetails'),

  version: reads('softwareVersionDetails.serviceVersion'),

  /**
   * Notifies about authentication error using auth provider.
   * @param {object} error
   * @returns {undefined}
   */
  notifyAuthEndpointError(error) {
    this.globalNotify.backendError('authentication', {
      message: this.t('authEndpointError') +
        (error.message ? ' - ' + error.message : '.'),
    });
  },

  /**
   * Performs authentication using given auth provider name.
   * @param {string} authorizerName
   * @returns {Promise}
   */
  async authenticate(authorizerName) {
    const availableAuthorizers = await this.availableAuthorizersProxy;
    const authorizer = availableAuthorizers.find(authorizer =>
      authorizer.type == authorizerName
    );
    this.set('activeAuthorizer', authorizer);
    const loginEndpointPromise = this.testMode ?
      this.onezoneServer.getTestLoginEndpoint(authorizerName) :
      this.onezoneServer.getLoginEndpoint(authorizerName);
    try {
      const data = await loginEndpointPromise;
      handleLoginEndpoint(data, () => {
        this.notifyAuthEndpointError({
          // FIXME: impl, test
          message: this.t('authEndpointConfError'),
        });
        // FIXME: impl
        this.onAuthenticationSuccess?.();
      });
    } catch (error) {
      // FIXME: impl
      this.notifyAuthEndpointError?.(error);
      throw error;
    } finally {
      this.setProperties({
        activeAuthorizer: null,
        // FIXME: impl
        selectedAuthorizer: null,
      });
    }
  },

  async usernameAuthenticate(username, password) {
    // FIXME: debug code
    // await sleep(5000);
    // throw {
    //   details: {
    //     authError: {
    //       id: 'badBasicCredentials',
    //     },
    //   },
    // };
    await this.session.authenticate('authenticator:application', {
      username,
      password,
    });
  },

  /**
   * @param {Object} error
   * @returns {{ isFatal: boolean, message: SafeString, reason: string }}
   */
  parseFormError(error) {
    let reason;
    let isFatal = false;
    const errorId = error && get(error, 'details.authError.id');
    if (fatalBasicAuthErrors.includes(errorId)) {
      reason = underscore(errorId);
      isFatal = true;
    } else if (errorId === 'badBasicCredentials') {
      reason = underscore(errorId);
    } else {
      reason = 'unknown';
      isFatal = true;
    }
    return {
      isFatal,
      message: this.errorReasonToText(reason),
      reason,
    };
  },

  readSessionExpiredCookie() {
    return this.cookies.read(sessionExpiredCookie);
  },

  consumeSessionExpiredCookie() {
    try {
      return this.readSessionExpiredCookie();
    } finally {
      this.cookies.clear(sessionExpiredCookie, { path: '/' });
    }
  },
});
