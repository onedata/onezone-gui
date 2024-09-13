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
import { bool, reads } from '@ember/object/computed';
import globals from 'onedata-gui-common/utils/globals';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';
import { inject as service } from '@ember/service';
import OnezoneLoginViewModel from 'onezone-gui/utils/onezone-login-view-model';
import { htmlSafe } from '@ember/template';
import { v4 as uuid } from 'ember-uuid';

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

  i18n: service(),

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

  // FIXME: wymuszać odświeżenie poprzez parametry
  frontpagePath: 'custom/frontpage/index.html',

  //#region state

  /**
   * @type {Utils.OnezoneLoginViewModel}
   */
  loginViewModel: undefined,

  //#endregion

  isCustomFrontpageShown: bool('isCustomFrontpageAvailable'),

  isCustomFrontpageAvailableProxy: computed(
    'frontpagePath',
    function isCustomFrontpageAvailableProxy() {
      return promiseObject((async () => {
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
    const t = this.i18n.t.bind(this.i18n);
    const viewModel = this.loginViewModel;
    const browserDomain = viewModel.browserDomain;
    const onezoneDomain = viewModel.onezoneDomain;
    const onezoneDomainText = onezoneDomain ??
      htmlSafe(`<em>${t('components.loginBox.loginFormContainer.unknown')}</em>`);
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
      i18n: {
        signIn: t('components.loginBox.signIn'),
        withIdentityProvider: t('components.loginBox.loginFormContainer.dropdownSubtitle'),
        usingUsername: t('components.loginBox.loginFormContainer.formSubtitle'),
        username: t('components.basicauthLoginForm.username'),
        password: t('components.basicauthLoginForm.password'),
        back: t('components.basicauthLoginForm.back'),
        signInButton: t('components.loginBox.signIn'),
        unknownError: t('mixins.authenticationErrorMessage.codes.unknown'),
        authenticationError: t('components.loginBox.errorTitle'),
        authenticationErrorContactInfo: t('mixins.authenticationErrorMessage.contactInfo'),
        privacyPolicyLabel: t('components.loginLayout.privacyPolicy'),
        termsOfUseLabel: t('components.loginLayout.termsOfUse'),
        versionLabel: t('components.loginLayout.version'),
        sessionExpiredText: t('components.loginBox.loginFormContainer.sessionExpired'),
        domainMismatchText: t(
          'components.loginBox.loginFormContainer.domainMismatchWarning', {
            browserDomain,
            onezoneDomain: onezoneDomainText,
          }),
      },
    };
  },

  async iframeAuthenticate(authenticatorName) {
    this.frontpageApi.setState(FrontpageState.ButtonAuthenticating, {
      authenticatorName,
    });
    try {
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
          message: this.i18n.t('components.basicauthLoginForm.invalidCredentials'),
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

  async injectFrontpageIntegrationScript(iframe) {
    iframe.contentWindow.customFrontpageModel = await this.getCustomFrontpageModel();
    const iframeDocument = iframe.contentWindow.document;
    // Append integration script.
    const script = iframeDocument.createElement('script');
    // Always fetch fresh copy of script, because integration script is currently built
    // without fingerprint.
    const random = uuid();
    script.src = `../../assets/scripts/custom-frontpage-integration.js?nocache=${random}`;
    const style = iframeDocument.createElement('link');
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = '../../assets/styles/custom-frontpage.css';

    iframeDocument.body.appendChild(script);
    iframeDocument.head.appendChild(style);
  },
});
