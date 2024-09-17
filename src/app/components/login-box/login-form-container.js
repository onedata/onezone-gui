/**
 * Login container implementation specific for Onezone. In addition to standard
 * login/password form, introduces sign in using auth providers specified
 * by backend.
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2016-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { notEmpty, gt, reads } from '@ember/object/computed';
import { not, or } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import LoginFormContainer from 'onedata-gui-common/components/login-box/login-form-container';
import I18n from 'onedata-gui-common/mixins/i18n';
import $ from 'jquery';
import { htmlSafe } from '@ember/template';

const ANIMATION_TIMEOUT = 333;

const mixins = [
  I18n,
];

export default LoginFormContainer.extend(...mixins, {
  classNames: ['login-form-container'],

  i18n: service(),
  globalNotify: service(),
  authorizerManager: service(),
  onezoneServer: service(),
  onedataConnection: service(),
  router: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.loginBox.loginFormContainer',

  testMode: reads('loginViewModel.testMode'),

  //#region state

  /**
   * Authorizer selected in dropdown
   * @type {AuthorizerInfo}
   */
  selectedAuthorizer: null,

  isUsernameLoginActive: undefined,

  browserDomain: undefined,

  onezoneDomain: undefined,

  //#endregion

  signInNotificationProxy: reads('loginViewModel.signInNotificationProxy'),

  signInNotification: reads('signInNotificationProxy.content'),

  onezoneDomainText: computed('onezoneDomain', function onezoneDomainText() {
    return this.onezoneDomain ?? htmlSafe(`<em>${this.t('unknown')}</em>`);
  }),

  /**
   * If true, component is waiting for data to load.
   * @type {boolean}
   */
  isLoading: or(
    not('supportedAuthorizersProxy.isFulfilled'),
    'signInNotificationProxy.isPending'
  ),

  /**
   * Selected auth provider.
   * @type {AuthorizerInfo}
   */
  _activeAuthorizer: null,

  /**
   * Timeout id used to control auth providers dropdown visibility animation.
   * @type {number}
   */
  _dropdownAnimationTimeoutId: -1,

  /**
   * Timeout id used to control form mode change animation.
   * @type {number}
   */
  _formAnimationTimeoutId: -1,

  /**
   * Animation time (visibility toggle animation).
   * @type {number}
   */
  _animationTimeout: ANIMATION_TIMEOUT,

  /**
   * Array of all suported authorizers
   * @type {PromiseArray<AuthorizerInfo>|null}
   */
  supportedAuthorizersProxy: reads('loginViewModel.availableAuthenticatorsProxy'),

  /**
   * Array of all supported authorizers.
   * @type {Array<AuthorizerInfo|null>}
   */
  supportedAuthorizers: reads('supportedAuthorizersProxy.content'),

  /**
   * If true, there are some auth providers to show.
   * @type {Ember.ComputedProperty<boolean>}
   */
  _hasAuthorizersForSelect: notEmpty('_authorizersForSelect'),

  /**
   * If true, 'show more' button will be visible in auth buttons bar.
   * @type {computed.boolean}
   */
  _showMoreProvidersButton: gt('supportedAuthorizers.length', 7),

  /**
   * Array of auth providers for buttons bar (available space
   * is limited, so max length of that array is 6/7).
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  _authorizersForButtons: computed('supportedAuthorizers.[]', function () {
    const {
      supportedAuthorizers,
      _showMoreProvidersButton,
    } = this.getProperties('supportedAuthorizers', '_showMoreProvidersButton');
    if (supportedAuthorizers) {
      return supportedAuthorizers.slice(0, _showMoreProvidersButton ? 6 : 7);
    } else {
      return [];
    }
  }),

  /**
   * Array of auth providers for powerselect
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  _authorizersForSelect: computed('supportedAuthorizers.[]', function () {
    const supportedAuthorizers = this.get('supportedAuthorizers');
    if (supportedAuthorizers) {
      return supportedAuthorizers.filter(auth => auth.id !== 'basicAuth');
    } else {
      return [];
    }
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  showDomainMismatchWarning: computed(
    'browserDomain',
    'onezoneDomain',
    function showDomainMismatchWarning() {
      return this.browserDomain !== this.onezoneDomain;
    }
  ),

  sessionHasExpired: reads('loginViewModel.sessionHasExpired'),

  init() {
    this._super(...arguments);
    this.setProperties({
      browserDomain: this.loginViewModel.browserDomain,
      onezoneDomain: this.loginViewModel.onezoneDomain,
    });
  },

  /**
   * Powerselect item matcher used by its search engine.
   * @param {AuthorizerInfo} authorizer
   * @param {string} term Query string.
   * @returns {boolean} True, if authorizer matches given term.
   */
  _authorizersSelectMatcher(authorizer, term) {
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

  actions: {
    /**
     * Action called on auth provider select.
     * @param {AuthorizerInfo} authorizer
     * @returns {undefined}
     */
    authorizerSelected(authorizer) {
      this.set('selectedAuthorizer', authorizer);
      this.send('authenticate', authorizer.id);
    },

    /**
     * Back button action in username/password mode. Shows auth providers list.
     * @returns {undefined}
     */
    backAction() {
      if (this.isUsernameLoginActive) {
        this.set('showAuthenticationError', false);
        this.send('usernameLoginToggle');
      }
    },

    /**
     * Performs authentication using given auth provider name.
     * @param {string} authorizerName
     * @returns {void}
     */
    async authenticate(authorizerName) {
      try {
        await this.loginViewModel.authenticate(authorizerName);
      } finally {
        this.set('selectedAuthorizer', null);
      }
    },

    /**
     * Toggles login form mode between username/password and auth providers list.
     * @returns {undefined}
     */
    usernameLoginToggle() {
      const {
        isProvidersDropdownVisible,
        _formAnimationTimeoutId,
        _animationTimeout,
        element,
      } = this.getProperties(
        'isProvidersDropdownVisible',
        '_formAnimationTimeoutId',
        '_animationTimeout',
        'element'
      );
      if (!element) {
        return;
      }
      const $element = $(element);

      const loginForm = $element.find('.basicauth-login-form-container');
      const authorizersSelect = $element.find('.authorizers-select-container');
      clearTimeout(_formAnimationTimeoutId);

      this.toggleProperty('isUsernameLoginActive');
      if (this.get('isUsernameLoginActive')) {
        this._animateHide(authorizersSelect);
        this._animateShow(loginForm, true);
        const usernameInput = element.querySelector('.login-username');
        if (usernameInput) {
          usernameInput.focus();
        }
        // hide dropdown
        if (isProvidersDropdownVisible) {
          this.send('showMoreClick');
        }
        this.set('_formAnimationTimeoutId',
          setTimeout(() => authorizersSelect.addClass('hide'), _animationTimeout)
        );
      } else {
        this._animateHide(loginForm);
        this._animateShow(authorizersSelect, true);
        this.set('_formAnimationTimeoutId',
          setTimeout(() => loginForm.addClass('hide'), _animationTimeout)
        );
      }
    },

    /**
     * Shows dropdown with all auth providers
     * @returns {undefined}
     */
    showMoreClick() {
      const {
        _dropdownAnimationTimeoutId,
        _animationTimeout,
        element,
      } = this.getProperties(
        '_dropdownAnimationTimeoutId',
        '_animationTimeout',
        'element'
      );
      this.toggleProperty('isProvidersDropdownVisible');
      const authorizersDropdown = $(element).find('.authorizers-dropdown');
      clearTimeout(_dropdownAnimationTimeoutId);
      if (this.get('isProvidersDropdownVisible')) {
        this._animateShow(authorizersDropdown);
      } else {
        this._animateHide(authorizersDropdown);
        this.set('_dropdownAnimationTimeoutId',
          setTimeout(() => authorizersDropdown.addClass('hide'), _animationTimeout)
        );
      }
    },
  },
});
