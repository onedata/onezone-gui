/**
 * View Model to use in components displaying login screen elements, specifically
 * in Onezone.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import LoginViewModel from 'onedata-gui-common/utils/login-view-model';
import { computed } from '@ember/object';
import { reads, equal } from '@ember/object/computed';
import handleLoginEndpoint from 'onezone-gui/utils/handle-login-endpoint';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { inject as service } from '@ember/service';
import DOMPurify from 'dompurify';
import globals from 'onedata-gui-common/utils/globals';
import { htmlSafe } from '@ember/template';
import { sessionExpiredCookie } from 'onedata-gui-common/components/websocket-reconnection-modal';

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
   * @type {ComputedProperty<PromiseObject<SafeString>>}
   */
  signInNotificationProxy: computed(function signInNotificationProxy() {
    const promise = (async () => {
      const message = await this.guiMessageManager.getMessage('signin_notification');
      if (!message) {
        return undefined;
      }
      const sanitizedMessage =
        DOMPurify.sanitize(message, { ALLOWED_TAGS: ['#text'] }).toString();
      return htmlSafe(sanitizedMessage.replaceAll('\n', '<br>'));
    })();
    return promiseObject(promise);
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

  /**
   * @type {ComputedProperty<string>}
   */
  onezoneDomain: reads('onedataConnection.zoneDomain'),

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

  init() {
    this._super(...arguments);
    this.set('sessionHasExpired', this.consumeSessionExpiredCookie());
  },

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
    const authenticator = availableAuthenticators.find(authenticator =>
      authenticator.type == authenticatorName
    );
    this.set('activeAuthenticator', authenticator);
    try {
      const loginEndpointPromise = this.testMode ?
        this.onezoneServer.getTestLoginEndpoint(authenticatorName) :
        this.onezoneServer.getLoginEndpoint(authenticatorName);
      const data = await loginEndpointPromise;
      handleLoginEndpoint(data, () => {
        const error = {
          message: this.t('authEndpointConfError'),
        };
        this.notifyAuthEndpointError(error);
        throw error;
      });
    } catch (error) {
      this.notifyAuthEndpointError(error);
      throw error;
    } finally {
      this.set('activeAuthenticator', null);
    }
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
