import { computed } from '@ember/object';
import LoginFormConainer from 'onedata-gui-common/components/login-box/login-form-container';
import AUTHORIZERS from 'onezone-gui/utils/authorizers';

export default LoginFormConainer.extend({
  classNames: ['login-form-container'],

  /**
   * Authorizer selected in dropdown
   * @type {AuthorizerInfo}
   */
  selectedAuthorizer: null,

  isLoading: false,
  _activeAuthorizer: null,
  dropdownAnimationTimeoutId: -1,
  formAnimationTimeoutId: -1,
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

  initSupportedAuthorizers: function () {
    this.set('isLoading', true);
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
    });

    p.catch(error => {
      const msg = error && error.message || this.get('i18n').t('components.socialBoxList.fetchProvidersFailedUnknown');
      this.set('errorMessage', msg);
    });

    p.finally(() => this.set('isLoading', false));
  }.on('init'),

  authorizersSelectMatcher(authorizer, term) {
    return authorizer.name.toLowerCase().indexOf(term.toLowerCase());
  },

  _animateShow(element, delayed) {
    element
      .addClass((delayed ? 'short-delay ' : '') + 'fadeIn')
      .removeClass('hide fadeOut');
  },

  _animateHide(element) {
    element.addClass('fadeOut').removeClass('short-delay fadeIn');
  },

  actions: {
    authorizerSelected(authorizer) {
      this.set('selectedAuthorizer', authorizer);
      this.send('authenticate', authorizer.type);
    },
    backAction() {
      this.set('showAuthenticationError', false);
      this.send('usernameLoginToggle');
    },
    authenticate() {

    },
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
          setTimeout(() => authorizersSelect.addClass('hide'), 333)
        );
      } else {
        this._animateHide(loginForm);
        this._animateShow(authorizersSelect, true);
        this.set('formAnimationTimeoutId', 
          setTimeout(() => loginForm.addClass('hide'), 333)
        );
      }
    },
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
          setTimeout(() => authorizersDropdown.addClass('hide'), 333)
        );
      }
    },
  },
});
