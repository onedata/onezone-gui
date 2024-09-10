/**
 * Main authentication screen component for Onezone. Renders iframe with custom frontpage
 * template if it is provided or the original Onedata login components.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { bool, equal, reads } from '@ember/object/computed';
import globals from 'onedata-gui-common/utils/globals';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';
import { inject as service } from '@ember/service';
import OnezoneLoginViewModel from 'onezone-gui/utils/onezone-login-view-model';
import sleep from 'onedata-gui-common/utils/sleep';

/**
 * Changes must be synchronized with custom-page-integration.js script.
 */
const FrontpageState = Object.freeze({
  Init: 'Init',
  Buttons: 'Buttons',
  Form: 'Form',
  ButtonAuthenticating: 'ButtonAuthenticating',
  FormAuthenticating: 'FormAuthenticating',
  Error: 'Error',
  FormError: 'FormError',
});

export default Component.extend({
  classNames: ['onezone-login'],
  classNameBindings: ['isCustomFrontpageShown:frontpage-iframe-container'],

  authorizerManager: service(),
  guiMessageManager: service(),
  router: service(),

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

  // FIXME: odporność na różne ścieżki - powinienem dostawać tą scieżkę z backendu
  frontpagePath: 'custom/frontpage/index.html',

  //#region state

  /**
   * @type {Utils.OnezoneLoginViewModel}
   */
  loginViewModel: undefined,

  //#endregion

  testMode: equal('router.currentRouteName', 'test.login'),

  isCustomFrontpageShown: bool('isCustomFrontpageAvailable'),

  isCustomFrontpageAvailableProxy: computed(
    'frontpagePath',
    function isCustomFrontpageAvailableProxy() {
      return promiseObject((async () => {
        // FIXME: debug code
        // return false;

        /** @type {Response} */
        let response;
        try {
          response = await globals.fetch(this.frontpagePath);
        } catch {
          return false;
        }
        return response.ok;
      })());
    }
  ),

  isCustomFrontpageAvailable: bool('isCustomFrontpageAvailableProxy.content'),

  customFrontpageIframeId: computed('elementId', function customFrontpageIframeId() {
    return `${this.elementId}-custom-frontpage-iframe`;
  }),

  availableAuthenticatorsProxy: reads('loginViewModel.availableAuthenticatorsProxy'),

  signInNotificationProxy: reads('loginViewModel.signInNotificationProxy'),

  init() {
    this._super(...arguments);
    this.set('loginViewModel', OnezoneLoginViewModel.create({
      ownerSource: this,
      authenticationErrorReason: this.authenticationErrorReason,
      authenticationErrorState: this.authenticationErrorState,
    }));
  },

  /**
   * @override
   */
  didInsertElement() {
    this._super(...arguments);
    (async () => {
      const isCustomFrontpageAvailable = await this.isCustomFrontpageAvailableProxy;
      await waitForRender();
      if (isCustomFrontpageAvailable) {
        const iframe = this.getCustomFrontpageIframeElement();
        iframe.addEventListener('load', () => this.onIframeLoad(iframe));
      }
    })();
  },

  onIframeLoad(iframe) {
    this.injectFrontpageIntegrationScript(iframe);
  },

  getCustomFrontpageIframeElement() {
    return this.element?.querySelector(`#${this.customFrontpageIframeId}`);
  },

  async getCustomFrontpageModel() {
    const self = this;
    const viewModel = this.loginViewModel;
    const browserDomain = viewModel.browserDomain;
    const onezoneDomain = viewModel.onezoneDomain;
    return {
      data: {
        availableAuthenticators: await this.availableAuthenticatorsProxy,
        loginMessage: await this.signInNotificationProxy,
        isAuthenticationError: Boolean(this.authenticationErrorReason),
        privacyPolicyUrl: viewModel.privacyPolicyUrl,
        termsOfUseUrl: viewModel.termsOfUseUrl,
        version: viewModel.version,
        sessionHasExpired: viewModel.sessionHasExpired,
        isDomainMismatch: viewModel.isDomainMismatch,
      },
      api: {
        /**
         * @param {FrontpageApi} frontpageApi
         */
        registerFrontpageApi(frontpageApi) {
          self.iframeRegisterFrontpageApi(frontpageApi);
        },

        /**
         * @param {string} authenticatorName
         */
        authenticate(authenticatorName) {
          if (authenticatorName === 'basicAuth') {
            self.iframeSetFormState();
          } else {
            self.iframeAuthenticate(authenticatorName);
          }
        },

        /**
         * @param {string} username
         * @param {string} password
         */
        usernameAuthenticate(username, password) {
          self.iframeUsernameAuthenticate(username, password);
        },

        /**
         * @returns {{ message: string, state: string }}
         */
        getAuthenticationError() {
          return self.iframeGetAuthenticationError();
        },
      },
      // FIXME: prawdziwe i18n
      i18n: {
        signIn: 'Sign in',
        withIdentityProvider: 'with your identity provider',
        usingUsername: 'using your username & password',
        username: 'Username',
        password: 'Password',
        back: 'Back',
        signInButton: 'Sign in',
        unknownError: 'Unknown error',
        authenticationError: 'Authentication error',
        authenticationErrorContactInfo: 'If the problem persists, please contact the site administrators and quote the below request state identifier:',
        privacyPolicyLabel: 'Privacy policy',
        termsOfUseLabel: 'Terms of use',
        versionLabel: 'version',
        sessionExpiredText: 'Your session has expired.',
        domainMismatchText: `You have entered this page using a different domain (${browserDomain}) than the actual Onezone server domain (${onezoneDomain}). Some of the content will be unavailable or malfunctioning, e.g. the file upload action. Use the server domain to ensure full functionality.`,
      },
    };
  },

  async iframeAuthenticate(authenticatorName) {
    this.frontpageApi.setState(FrontpageState.ButtonAuthenticating, {
      authenticatorName,
    });
    // FIXME: obsługiwać tutaj asychroniczne zmiany stanu (loader dla bloczku itd.)
    try {
      // FIXME: debug code
      await sleep(5000);
      // throw new Error('test');
      await this.loginViewModel.authenticate(authenticatorName);
    } catch (error) {
      // Currently, the loginViewModel.authenticate method handles endpoint error itself
      // using a modal, so we just go back to buttons view state.
      this.frontpageApi.setState(FrontpageState.Buttons);
    }
  },

  iframeSetFormState() {
    this.frontpageApi.setState(FrontpageState.Form);
  },

  iframeRegisterFrontpageApi(frontpageApi) {
    this.set('frontpageApi', frontpageApi);
  },

  async iframeUsernameAuthenticate(username, password) {
    this.frontpageApi.setState(FrontpageState.FormAuthenticating);
    try {
      await this.loginViewModel.usernameAuthenticate(username, password);
    } catch (error) {
      const { isFatal, message } = this.loginViewModel.parseFormError(error);
      if (isFatal) {
        this.frontpageApi.setState(FrontpageState.Error, {
          message: String(message),
        });
      } else {
        this.frontpageApi.setState(FrontpageState.FormError, {
          // FIXME: i18n
          message: 'Invalid username and/or password.',
        });
      }
    }
  },

  /**
   * @returns {{message: string, state: string}}
   */
  iframeGetAuthenticationError() {
    if (this.authenticationErrorReason) {
      return {
        message: String(this.loginViewModel.authenticationErrorText),
        refId: this.authenticationErrorState,
        isContactInfo: this.loginViewModel.showErrorContactInfo,
      };
    } else {
      return null;
    }
  },

  // FIXME: być może nie tutaj będzie najlepiej mieć await
  async injectFrontpageIntegrationScript(iframe) {
    iframe.contentWindow.customFrontpageModel = await this.getCustomFrontpageModel();
    const iframeDocument = iframe.contentWindow.document;
    // append integration script
    const script = iframeDocument.createElement('script');
    // FIXME: odporność na różne ścieżki customowe
    script.src = '../../assets/scripts/custom-frontpage-integration.js';
    const style = iframeDocument.createElement('link');
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = '../../assets/styles/custom-frontpage.css';

    iframeDocument.body.appendChild(script);
    iframeDocument.head.appendChild(style);
  },
});
