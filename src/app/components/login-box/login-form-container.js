import { computed } from '@ember/object';
import LoginFormConainer from 'onedata-gui-common/components/login-box/login-form-container';
import AUTHORIZERS from 'onezone-gui/utils/authorizers';
import Ember from 'ember';
// import handleLoginEndpoint from 'onezone-gui/utils/handle-login-endpoint';
import { inject } from '@ember/service';
import _ from 'lodash';

const I18N_PREFIX = 'components.loginBox.loginFormContainer.';
const ANIMATION_TIMEOUT = 333;

export default LoginFormConainer.extend({
  classNames: ['login-form-container'],

  i18n: inject(),
  globalNotify: inject(),

  /**
   * Authorizer selected in dropdown
   * @type {AuthorizerInfo}
   */
  selectedAuthorizer: null,

  /**
   * If true, component is waiting for data to load.
   * @type {boolean}
   */
  isLoading: false,

  /**
   * Selected auth provider.
   * @type {AuthorizerInfo}
   */
  _activeAuthorizer: null,

  /**
   * Timeout id used to control auth providers dropdown visibility animation.
   * @type {number}
   */
  dropdownAnimationTimeoutId: -1,

  /**
   * Timeout id used to control form mode change animation.
   * @type {number}
   */
  formAnimationTimeoutId: -1,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasAuthorizersForSelect: computed.notEmpty('authorizersForSelect'),

  /**
   * @type {computed.boolean}
   */
  showMoreProvidersButton: computed.gt('supportedAuthorizers.length', 7),

  /**
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  authorizersForButtons: computed('supportedAuthorizers.[]', function () {
    const {
      supportedAuthorizers,
      showMoreProvidersButton,
    } = this.getProperties('supportedAuthorizers', 'showMoreProvidersButton');
    if (supportedAuthorizers) {
      return supportedAuthorizers.slice(0, showMoreProvidersButton ? 6 : 7);
    } else {
      return [];
    }
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  authorizersForSelect: computed('supportedAuthorizers.[]', function () {
    let supportedAuthorizers = this.get('supportedAuthorizers');
    if (supportedAuthorizers) {
      return supportedAuthorizers.filter(auth => auth.type !== 'basicAuth');
    } else {
      return [];
    }
  }),

  init() {
    this._super(...arguments);
    this.initSupportedAuthorizers();
  },

  /**
   * Loads auth providers from backend.
   * @returns {undefined}
   */
  initSupportedAuthorizers() {
    this.set('isLoading', true);
    // TODO load authorizers
    // const p = this.get('onezoneServer').getSupportedAuthorizers();
    const p = Promise.resolve({authorizers: AUTHORIZERS.map(a => a.type)});
    p.then((data) => {
      let predefinedAuthorizersList = AUTHORIZERS.map(auth => auth.type);
      let authorizers = [];
      predefinedAuthorizersList.forEach((auth, index) => {
        if (data.authorizers.indexOf(auth) > -1) {
          authorizers.push(AUTHORIZERS[index]);
        }
      });
      data.authorizers.forEach((auth) => {
        if (predefinedAuthorizersList.indexOf(auth) === -1) {
          // default configuration for unknown authorizer
          authorizers.push({
            type: auth,
            name: auth.capitalize(),
            iconType: 'oneicon',
            iconName: 'key',
          });
        }
      });
      this.set('supportedAuthorizers', authorizers);
    }).catch(error => {
      const msg = error && error.message ||
        this.get('i18n').t(I18N_PREFIX + 'fetchProvidersFailedUnknown');
      this.set('errorMessage', msg);
    }).finally(() => this.set('isLoading', false));
  },

  /**
   * Powerselect item matcher used by its search engine.
   * @param {AuthorizerInfo} authorizer 
   * @param {string} term Query string.
   * @returns {boolean} True, if authorizer matches given term.
   */
  authorizersSelectMatcher(authorizer, term) {
    return authorizer.name.toLowerCase().indexOf(term.toLowerCase());
  },

  /**
   * Launches element show animation.
   * @param {jQuery} element
   * @param {boolean} delayed if true, animation will be delayed
   * @returns {undefined}
   */
  _animateShow(element, delayed) {
    element
      .addClass((delayed ? 'short-delay ' : '') + 'fadeIn')
      .removeClass('hide fadeOut');
  },

  /**
   * Launches element hide animation.
   * @param {jQuery} element
   * @returns {undefined}
   */
  _animateHide(element) {
    element.addClass('fadeOut').removeClass('short-delay fadeIn');
  },

  /**
   * Notifies about authentication error using auth provider.
   * @param {object} error
   * @returns {undefined}
   */
  authEndpointError(error) {
    this.get('globalNotify').backendError('authentication', {
      message: this.get('i18n').t(I18N_PREFIX + 'authEndpointError') +
        (error.message ? ' - ' + error.message : '.'),
    });
  },

  actions: {
    /**
     * Action called on auth provider select.
     * @param {AuthorizerInfo} authorizer
     * @return {undefined}
     */
    authorizerSelected(authorizer) {
      this.set('selectedAuthorizer', authorizer);
      this.send('authenticate', authorizer.type);
    },

    /**
     * Back button action in username/password mode. Shows auth providers list.
     * @returns {undefined}
     */
    backAction() {
      this.set('showAuthenticationError', false);
      this.send('usernameLoginToggle');
    },

    /**
     * Performs authentication using given auth provider name.
     * @param {string} providerName
     * @returns {undefined}
     */
    authenticate(providerName) {
      let provider = _.find(this.get('supportedAuthorizers'), { type: providerName });
      this.set('_activeAuthorizer', provider);
      // TODO implement authentication
      // const p = this.get('onezoneServer').getLoginEndpoint(providerName);
      // p.then(
      //   (data) => {
      //     handleLoginEndpoint(data, () => {
      //       this.authEndpointError({
      //         message: this.get('i18n').t(I18N_PREFIX + 'authEndpointConfError'),
      //       });
      //     });
      //   },
      //   (error) => {
      //     this.authEndpointError(error);
      //   }
      // ).then(() => {
      //   this.setProperties({
      //     _activeAuthorizer: null,
      //     selectedAuthorizer: null,
      //   });
      // });
      // return p;
      // Temporary implementation
      this.setProperties({
        _activeAuthorizer: null,
        selectedAuthorizer: null,
      });
      return new Ember.RSVP.Promise((resolve) => resolve());
    },

    /**
     * Toggles login form mode between username/password and auth providers list.
     * @returns {undefined}
     */
    usernameLoginToggle() {
      let {
        isProvidersDropdownVisible,
        formAnimationTimeoutId,
      } = this.getProperties(
        'isProvidersDropdownVisible',
        'formAnimationTimeoutId'
      );
      let loginForm = this.$('.basicauth-login-form-container');
      let authorizersSelect = this.$('.authorizers-select-container');
      clearTimeout(formAnimationTimeoutId);

      this.toggleProperty('isUsernameLoginActive');
      if (this.get('isUsernameLoginActive')) {
        this._animateHide(authorizersSelect);
        this._animateShow(loginForm, true);
        this.$('.login-username').focus();
        // hide dropdown
        if (isProvidersDropdownVisible) {
          this.send('showMoreClick');
        }
        this.set('formAnimationTimeoutId', 
          setTimeout(() => authorizersSelect.addClass('hide'), ANIMATION_TIMEOUT)
        );
      } else {
        this._animateHide(loginForm);
        this._animateShow(authorizersSelect, true);
        this.set('formAnimationTimeoutId', 
          setTimeout(() => loginForm.addClass('hide'), ANIMATION_TIMEOUT)
        );
      }
    },

    /**
     * Shows dropdown with all auth providers
     * @returns {undefined}
     */
    showMoreClick() {
      let dropdownAnimationTimeoutId = this.get('dropdownAnimationTimeoutId');
      this.toggleProperty('isProvidersDropdownVisible');
      let authorizersDropdown = this.$('.authorizers-dropdown-container');
      clearTimeout(dropdownAnimationTimeoutId);
      if (this.get('isProvidersDropdownVisible')) {
        this._animateShow(authorizersDropdown);
      } else {
        this._animateHide(authorizersDropdown);
        this.set('dropdownAnimationTimeoutId', 
          setTimeout(() => authorizersDropdown.addClass('hide'), ANIMATION_TIMEOUT)
        );
      }
    },
  },
});
