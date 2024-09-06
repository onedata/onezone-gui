// FIXME: debug code
console.log('custom-frontpage-integration!');

// FIXME: doc

// FIXME: ten plik nie jest kopiowany podczas przebudowywania (watcher)

// FIXME: translacja z ecmascript? - test poniżej
class Xd {
  #aa = 1;

  fun() {
    return this.#aa;
  }
}

/**
 * @typedef {Object} Authorizer
 * @property {'basicAuth'|string} id
 * @property {string} iconPath
 * @property {string} iconBackgroundColor
 * @property {string} displayName
 */

/**
 * @typedef {Object} FrontpageModel
 * @property {Object} api
 * @property {(username: string, password: string) => void} api.usernameAuthenticate
 * @property {(frontpageApi: FrontpageApi) => void} api.registerFrontpageApi
 * @property {(authorizerName: string) => void} api.authenticate
 * @property {Object} data
 * @property {Array<Authorizer>} data.availableAuthorizers
 * @property {string} data.loginMessage
 * @property {boolean} data.isAuthenticationError
 * @property {Object} i18n
 */

/**
 * @typedef {'Init'|'Buttons'|'Form'|'ButtonAuthorizing'|'FormAuthorizing'|'Error'|'FormError','Final'} FrontpageStateValue
 */

/**
 * Changes must be synchronized with the definition in Ember application.
 */
const FrontpageState = Object.freeze({
  Init: 'Init',
  Buttons: 'Buttons',
  Form: 'Form',
  ButtonAuthorizing: 'ButtonAuthorizing',
  FormAuthorizing: 'FormAuthorizing',
  Error: 'Error',
  FormError: 'FormError',
  Final: 'Final',
});

const State = FrontpageState;

/**
 * Maps: state -> possible next states
 */
const StateTransitions = Object.freeze({
  [State.Init]: [State.Form, State.Buttons, State.Error],
  [State.Buttons]: [State.Form, State.ButtonAuthorizing],
  [State.Form]: [State.FormAuthorizing, State.Buttons],
  [State.ButtonAuthorizing]: [State.Buttons, State.Final],
  [State.FormAuthorizing]: [State.Error, State.FormError, State.Form, State.Final],
  [State.FormError]: [State.Form, State.Buttons],
  [State.Error]: [State.Init],
});

class FrontpageApi {
  constructor() {
    /**
     * @type {FrontpageStateValue}
     */
    this.state = undefined;

    /**
     * Optional data to use when entering the new state.
     * @type {any}
     */
    this.stateMetadata = null;

    /**
     * If true, ignore authentication errors stored in cookies on init
     * @type {boolean}
     */
    this.isAuthenticationErrorDismissed = false;
  }

  get isOnlyBasicAuth() {
    const authorizers = this.model?.data?.availableAuthorizers;
    return authorizers?.length === 1 && authorizers[0].id === 'basicAuth';
  }

  get isAuthenticationError() {
    return !this.isAuthenticationErrorDismissed && this.model.data.isAuthenticationError;
  }

  /**
   * @type {FrontpageModel}
   */
  get model() {
    return window.customFrontpageModel;
  }

  /**
   * @type {HTMLElement}
   */
  get buttonsContainer() {
    return document.getElementById('login-buttons-container');
  }

  /**
   * @type {HTMLElement}
   */
  get messageContainer() {
    return document.getElementById('login-message-container');
  }

  /**
   * @type {HTMLElement}
   */
  get formContainer() {
    return document.getElementById('login-form-container');
  }

  /**
   * @type {HTMLFormElement}
   */
  get loginForm() {
    return document.getElementById('login-form');
  }

  /**
   * @type {HTMLElement}
   */
  get errorContainer() {
    return document.getElementById('login-error-container');
  }

  /**
   * @type {HTMLInputElement}
   */
  get usernameInput() {
    return document.getElementById('username-input');
  }

  /**
   * @type {HTMLInputElement}
   */
  get passwordInput() {
    return document.getElementById('password-input');
  }

  /**
   * @type {HTMLButtonElement}
   */
  get formBackButton() {
    return document.getElementById('login-form-back-btn');
  }

  /**
   * @type {HTMLButtonElement}
   */
  get errorBackButton() {
    return document.getElementById('error-back-btn');
  }

  /**
   * @type {HTMLButtonElement}
   */
  get formSignInButton() {
    return document.getElementById('login-form-sign-in-btn');
  }

  get formContainer() {
    return document.getElementById('login-form-container');
  }

  /**
   * @type {HTMLDivElement}
   */
  get formErrorContainer() {
    return document.getElementById('login-form-error-container');
  }

  /**
   * @type {HTMLHeadingElement}
   */
  get signInHeader() {
    return document.getElementById('sign-in-header');
  }

  /**
   * @type {HTMLHeadingElement}
   */
  get signInSubheader() {
    return document.getElementById('sign-in-subheader');
  }

  /**
   * @type {HTMLDivElement}
   */
  get footer() {
    return document.getElementById('footer');
  }

  mountFrontpage() {
    this.model.api.registerFrontpageApi(this);
    this.initializeElements();
  }

  initializeElements() {
    this.initLoginButtons();
    this.initLoginMessage();
    this.initLoginForm();
    this.initFooter();
  }

  /**
   * @returns {void}
   */
  initSignInHeader() {
    this.signInHeader.textContent = this.model.i18n.signIn;
  }

  /**
   * @returns {void}
   */
  initLoginButtons() {
    const elements = [];
    for (const authorizer of this.model?.data?.availableAuthorizers) {
      const loginIconBox = document.createElement('a');
      loginIconBox.style.backgroundColor = authorizer.iconBackgroundColor ?? '#ffffff';
      loginIconBox.classList.add('login-icon-box', 'auth-icon', authorizer.id);
      loginIconBox.addEventListener('click', () => {
        if (this.state === State.Buttons) {
          this.model.api.authenticate(authorizer.id);
        }
      });
      const authIconImage = document.createElement('div')
      authIconImage.style.backgroundImage = `url(${authorizer.iconPath})`;
      authIconImage.classList.add('auth-icon-image');
      const loginIconSpinner = document.createElement('div');
      loginIconSpinner.classList.add('login-icon-spinner', 'hidden');
      loginIconBox.appendChild(authIconImage);
      loginIconBox.appendChild(loginIconSpinner);
      elements.push(loginIconBox);
    }
    const container = this.buttonsContainer;
    container.classList.toggle('hidden', true);
    container.innerHTML = '';
    for (const element of elements) {
      container.appendChild(element);
    }
  }

  /**
   * @returns {void}
   */
  initLoginMessage() {
    const container = this.messageContainer;
    const loginMessage = this.model.data.loginMessage || '';
    let innerHtml = '';
    if (this.model.data.sessionHasExpired) {
      const sessionExpiredText = this.model.i18n.sessionExpiredText;
      innerHtml += `
      <div class="login-notification login-notification-session-expired login-notification-warning">
        ${sessionExpiredText}
      </div>
`;
    }
    if (this.model.data.isDomainMismatch) {
      const domainMismatchText = this.model.i18n.domainMismatchText;
      innerHtml += `
      <div class="login-notification login-notification-domain-mismatch login-notification-warning">
        ${domainMismatchText}
      </div>
`;
    }
    if (loginMessage) {
      innerHtml += `
      <div class="login-notification login-notification-admin-message">
        ${loginMessage}
      </div>
`;
    }
    container.innerHTML = innerHtml;
  }

  /**
   * @returns {void}
   */
  initLoginForm() {
    this.formContainer.classList.toggle('hidden', true);
    this.formContainer.innerHTML = `
    <form id="login-form" class="login-form">
      <div id="login-form-inputs" class="login-form-inputs">
        <input id="username-input" class="username-input">
        <input id="password-input" type="password" class="password-input">
      </div>
      <div id="login-form-error-container" class="login-form-error-container"></div>
      <div id="login-form-buttons" class="login-form-buttons">
        <button id="login-form-back-btn" type="button" class="login-form-button back-btn"></button>
        <button id="login-form-sign-in-btn" type="submit" class="login-form-button sign-in-btn"></button>
      </div>
    </form>
`;

    this.usernameInput.placeholder = this.model.i18n.username;
    this.passwordInput.placeholder = this.model.i18n.password;
    this.formBackButton.innerHTML = '&lt; ' + this.model.i18n.back;
    this.formSignInButton.innerHTML = `
    <div class="button-spinner"></div>
    <span>${this.model.i18n.signInButton}</span>
`;
    this.loginForm.addEventListener('submit', (event) => {
      if (this.state === State.FormError) {
        this.setState(State.Form);
      }
      this.submitForm();
      event.preventDefault();
      return false;
    });
    if (this.isOnlyBasicAuth) {
      this.formBackButton?.remove();
    } else {
      this.formBackButton.addEventListener('click', (event) => {
        event.preventDefault();
        this.usernameInput.value = '';
        this.passwordInput.value = '';
        this.setState(State.Buttons);
        return false;
      });
    }
  }

  /**
   * @returns {void}
   */
  initFooter() {
    const privacyPolicyLabel = this.model.i18n.privacyPolicyLabel;
    const termsOfUseLabel = this.model.i18n.termsOfUseLabel;
    const versionLabel = this.model.i18n.versionLabel;
    const privacyPolicyUrl = this.model.data.privacyPolicyUrl;
    const termsOfUseUrl = this.model.data.termsOfUseUrl;
    const version = this.model.data.version;
    this.footer.classList.add('login-footer');
    let innerHtml = ''
    if (privacyPolicyUrl) {
      innerHtml += `
    <a href="${privacyPolicyUrl}" target="_top" class="footer-link">${privacyPolicyLabel}</a>
    <span class="footer-separator">|</span>
`;
    }
    if (termsOfUseUrl) {
      innerHtml += `
      <a href="${termsOfUseUrl}" target="_top" class="footer-link">${termsOfUseLabel}</a>
      <span class="footer-separator">|</span>
`;
    }
    innerHtml += `
    <span class="footer-version">${versionLabel} ${version}</span>
`;
    this.footer.innerHTML = innerHtml;
  }

  /**
   * @returns {void}
   */
  initErrorContainer(message, refId, isContactInfo = false) {
    this.signInHeader.textContent = this.model.i18n.authenticationError;
    let subheaderText = `
    <span class="authentication-error-message">${message}</span>
`;
    if (isContactInfo) {
      const contactInfo = this.model.i18n.authenticationErrorContactInfo;
      subheaderText += `
      <span class="authentication-error-contact-info">${contactInfo}</span>
      <code class="authentication-error-state">${refId}</code>
`;
    }
    this.signInSubheader.innerHTML = subheaderText;

    this.errorContainer.classList.toggle('hidden', true);
    this.errorContainer.innerHTML = '';
    this.errorContainer.innerHTML = `
    <button id="error-back-btn" class="back-btn"></button>
`;
    this.errorBackButton.innerHTML = '&lt; ' + this.model.i18n.back;
    this.errorBackButton.addEventListener('click', (event) => {
      this.isAuthenticationErrorDismissed = true;
      this.setState(State.Init);
    });
  }

  setInitialState() {
    this.state = State.Init;
    this.stateMetadata = null;
    if (this.isAuthenticationError) {
      const { message, refId, isContactInfo } = this.model.api.getAuthenticationError();
      this.setState(State.Error, { message, refId, isContactInfo });
    } else {
      this.initSignInHeader();
      if (this.isOnlyBasicAuth) {
        this.setState(State.Form);
      } else {
        this.setState(State.Buttons);
      }
    }
  }

  setState(state, metadata) {
    if (!Object.values(State).includes(state)) {
      // FIXME: do not throw in production
      throw new Error(`invalid state ${state}`);
    }
    if (
      !StateTransitions[this.state]?.includes(state) &&
      // check first time setting Init state (from undefined)
      !(!this.state && state === State.Init)
    ) {
      // FIXME: do not throw in production
      throw new Error(`invalid state transition ${this.state} -> ${state}`);
    }
    const methodName = `handle${state}State`;
    this[methodName](metadata);
    // Setting initial state ends with setting another state. Otherwise set the current
    // state.
    if (state !== State.Init) {
      this.state = state;
      this.stateMetadata = metadata ?? null;
    }
  }

  // --- Handlers for entering new state ---

  handleInitState() {
    this.setInitialState();
  }

  handleButtonsState() {
    this.signInSubheader.textContent = this.model.i18n.withIdentityProvider;
    this.toggleViews({
      buttonsContainer: true,
      messageContainer: true,
      formContainer: false,
      errorContainer: false,
    });
    this.setAllAuthIconsSpinners(false);
  }

  handleFormState() {
    this.signInSubheader.textContent = this.model.i18n.usingUsername;
    this.toggleViews({
      buttonsContainer: false,
      messageContainer: true,
      formContainer: true,
      errorContainer: false,
      formErrorContainer: false,
    });
    this.usernameInput.classList.toggle('has-error', false);
    this.passwordInput.classList.toggle('has-error', false);
    this.usernameInput.disabled = false;
    this.passwordInput.disabled = false;
    this.formSignInButton.disabled = false;
    this.formSignInButton.classList.toggle('loading', false);
    if (this.formBackButton) {
      this.formBackButton.disabled = false;
    }
    this.uninstallClearFormErrorListener();
    if (![this.usernameInput, this.passwordInput].includes(document.activeElement)) {
      this.usernameInput.focus();
    }
  }

  handleButtonAuthorizingState(metadata) {
    this.setAuthIconSpinner(metadata.authorizerName, true);
  }

  handleFormAuthorizingState() {
    this.usernameInput.disabled = true;
    this.passwordInput.disabled = true;
    this.formSignInButton.disabled = true;
    this.formSignInButton.classList.toggle('loading', true);
    if (this.formBackButton) {
      this.formBackButton.disabled = true;
    }
  }

  handleErrorState(metadata) {
    // FIXME: sprawdzić wsparcie opt. chain
    this.initErrorContainer(
      metadata?.message,
      metadata?.refId,
      metadata?.isContactInfo
    );
    this.toggleViews({
      buttonsContainer: false,
      messageContainer: true,
      formContainer: false,
      errorContainer: true,
    });
  }

  handleFormErrorState(metadata) {
    this.toggleViews({
      formErrorContainer: true,
    });
    this.usernameInput.classList.toggle('has-error', true);
    this.passwordInput.classList.toggle('has-error', true);
    this.usernameInput.disabled = false;
    this.passwordInput.disabled = false;
    this.formSignInButton.disabled = false;
    this.formSignInButton.classList.toggle('loading', false);
    if (this.formBackButton) {
      this.formBackButton.disabled = false;
    }
    this.formErrorContainer.textContent = metadata.message ||
      this.model.i18n.unknownError;
    this.installClearFormErrorListener();
  }

  installClearFormErrorListener() {
    if (this.clearFormErrorListener) {
      this.uninstallClearFormErrorListener();
    }
    const clearFormErrorListener = () => {
      this.setState(State.Form);
      this.uninstallClearFormErrorListener();
    };
    this.usernameInput.addEventListener('input', clearFormErrorListener);
    this.passwordInput.addEventListener('input', clearFormErrorListener);
    this.clearFormErrorListener = clearFormErrorListener;
  }

  uninstallClearFormErrorListener() {
    try {
      this.usernameInput.removeEventListener('input', this.clearFormErrorListener);
      this.passwordInput.removeEventListener('input', this.clearFormErrorListener);
    } finally {
      this.clearFormErrorListener = null;
    }
  }

  toggleView(viewName, isVisible) {
    /** @type {HTMLElement} */
    const element = this[viewName];
    if (!element) {
      return;
    }
    element.classList.toggle('hidden', !isVisible);
  }

  toggleViews(options) {
    for (const viewName in options) {
      this.toggleView(viewName, options[viewName]);
    }
  }

  submitForm() {
    this.model.api.usernameAuthenticate(
      this.usernameInput.value,
      this.passwordInput.value
    );
  }

  setAuthIconSpinner(authorizerId, isLoading) {
    const button = this.buttonsContainer.querySelector(`.login-icon-box.${authorizerId}`);
    if (!button) {
      return;
    }
    const authIconImage = button.querySelector('.auth-icon-image');
    const spinner = button.querySelector('.login-icon-spinner');
    authIconImage.classList.toggle('hidden', isLoading);
    spinner.classList.toggle('hidden', !isLoading);
  }

  setAllAuthIconsSpinners(isLoading) {
    for (const { id } of this.model.data.availableAuthorizers) {
      this.setAuthIconSpinner(id, isLoading);
    }
  }
}

// FIXME: uzupełnić mock
function createModelMock() {
  /** @type {FrontpageApi} */
  let localFrontpageApi;
  const imagesOrigin = 'https://dev-onezone.default.svc.cluster.local';
  return {
    data: {
      availableAuthorizers: [{
          id: 'basicAuth',
          iconPath: `${imagesOrigin}/ozw/onezone/assets/images/auth-providers/basicauth.svg`,
          iconBackgroundColor: '#4BD187',
          displayName: 'username & password',
        },
        {
          id: 'egi',
          iconPath: `${imagesOrigin}/ozw/onezone/assets/images/auth-providers/egi.svg`,
          iconBackgroundColor: '#FFFFFF',
          displayName: 'EGI',
        },
        {
          id: 'google',
          iconPath: `${imagesOrigin}/ozw/onezone/assets/images/auth-providers/google.svg`,
          iconBackgroundColor: '#FFFFFF',
          displayName: 'Google',
        },
      ],
      loginMessage: 'Ea veniam adipisicing qui deserunt cillum fugiat qui dolore laboris. Duis aute dolore minim amet irure cillum ut veniam sunt minim. Reprehenderit laboris eu exercitation ipsum eiusmod quis amet enim aliquip fugiat incididunt. Minim qui eu ullamco id ut. Commodo adipisicing mollit velit cillum esse aliquip culpa.',
    },
    api: {
      registerFrontpageApi(frontpageApi) {
        localFrontpageApi = frontpageApi;
      },
      authenticate(authenticatorName) {
        if (authenticatorName === 'basicAuth') {
          localFrontpageApi.setState(State.Form);
        }
      },
      usernameAuthenticate() {},
    },
    i18n: {
      signIn: 'Sign in',
      withIdentityProvider: 'with your identity provider',
      usingUsername: 'using your username & password',
      username: 'Username',
      password: 'Password',
      back: 'Back',
      signInButton: 'Sign in',
    }
  };
}

(function main() {
  if (window.frontpageDevelopment) {
    window.customFrontpageModel = createModelMock();
  }
  const frontpageApi = new FrontpageApi();
  frontpageApi.mountFrontpage();
  frontpageApi.setState(State.Init);
  // FIXME: debug
  window.frontpageApi = frontpageApi;
})();
