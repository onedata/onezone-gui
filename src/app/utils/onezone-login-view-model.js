// FIXME: jsdoc

import LoginViewModel from 'onedata-gui-common/utils/login-view-model';
import { computed } from '@ember/object';
import { reads, equal } from '@ember/object/computed';
import handleLoginEndpoint from 'onezone-gui/utils/handle-login-endpoint';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { inject as service } from '@ember/service';
import DOMPurify from 'dompurify';
import { sessionExpiredCookie } from 'onedata-gui-common/components/websocket-reconnection-modal';
import globals from 'onedata-gui-common/utils/globals';
import { htmlSafe } from '@ember/template';

/**
 * @typedef {'badBasicCredentials'|'basicAuthNotSupported'|'basicAuthDisabled'|'userBlocked'} BasicAuthErrorId
 */

/**
 * @typedef {Object} BasicAuthErrorInfo
 * @property {boolean} isFatal
 * @property {SafeString} message
 * @property {BasicAuthErrorId} reason
 */

export default LoginViewModel.extend({
  i18n: service(),
  onezoneServer: service(),
  guiMessageManager: service(),
  authorizerManager: service(),
  session: service(),
  globalNotify: service(),
  guiUtils: service(),
  cookies: service(),
  onedataConnection: service(),
  router: service(),

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

  //#region state

  activeAuthenticator: null,

  //#endregion

  /**
   * Array of all supported authenticators
   * @type {ComputedProperty<PromiseArray<Authenticator>>}
   */
  availableAuthenticatorsProxy: computed(
    'testMode',
    function availableAuthenticatorsProxy() {
      return this.authorizerManager.getAvailableAuthorizers(this.testMode);
    }
  ),

  /**
   * @type {ComputedProperty<PromiseObject<string>>}
   */
  signInNotificationProxy: computed(function signInNotificationProxy() {
    const promise = (async () => {
      const message = await this.guiMessageManager.getMessage('signin_notification');
      const sanitizedMessage =
        DOMPurify.sanitize(message, { ALLOWED_TAGS: ['#text'] }).toString();
      return sanitizedMessage?.replaceAll('\n', '<br>') || undefined;
    })();
    return promiseObject(promise);
  }),

  /**
   * Note: using this computed property will CLEAR the cookie!
   * @type {ComputedProperty<boolean>}
   */
  sessionHasExpired: computed(function sessionHasExpired() {
    return this.consumeSessionExpiredCookie();
  }),

  /**
   * @type {ComputedProperty<string>}
   */
  browserDomain: computed(function browserDomain() {
    return globals.location.hostname;
  }),

  /**
   * @type {boolean}
   */
  testMode: equal('router.currentRouteName', 'test.login'),

  // FIXME: raczej nie zwracać tutaj HTML, tylko opakować w HTML na dalszym etapie
  // FIXME: sprawdzić na custom frontpage, czy poprawnie obsługuje unknown
  /**
   * @type {ComputedProperty<string>}
   */
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
   * @type {ComputedProperty<SoftwareVersionDetails>}
   */
  softwareVersionDetails: reads('guiUtils.softwareVersionDetails'),

  /**
   * @type {ComputedProperty<string>}
   */
  version: reads('softwareVersionDetails.serviceVersion'),

  /**
   * Notifies about error when initializing authentication using auth provider.
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
   * @param {string} authenticatorName
   * @returns {Promise}
   */
  async authenticate(authenticatorName) {
    const availableAuthenticators = await this.availableAuthenticatorsProxy;
    debugger;
    const authenticator = availableAuthenticators.find(authenticator =>
      authenticator.type == authenticatorName
    );
    this.set('activeAuthenticator', authenticator);
    try {
      const loginEndpointPromise = this.testMode ?
        this.onezoneServer.getTestLoginEndpoint(authenticatorName) :
        this.onezoneServer.getLoginEndpoint(authenticatorName);
      const data = await loginEndpointPromise;
      // FIXME: co to jest i dlaczego to jest osobna funkcja? może by przenieść do modelu
      handleLoginEndpoint(data, () => {
        this.notifyAuthEndpointError({
          // FIXME: impl, test
          message: this.t('authEndpointConfError'),
        });
        // FIXME: impl, dlaczego tutaj jest success a wyżej error?
        this.onAuthenticationSuccess?.();
      });
    } catch (error) {
      // FIXME: impl
      this.notifyAuthEndpointError(error);
      throw error;
    } finally {
      this.set('activeAuthenticator', null);
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
   * @private
   * @returns {string}
   */
  readSessionExpiredCookie() {
    return this.cookies.read(sessionExpiredCookie);
  },

  /**
   * @private
   * @returns {string}
   */
  consumeSessionExpiredCookie() {
    try {
      return this.readSessionExpiredCookie();
    } finally {
      this.cookies.clear(sessionExpiredCookie, { path: '/' });
    }
  },
});
