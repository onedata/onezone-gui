/**
 * Login container implementation specific for Onezone. In addition to standard
 * login/password form, introduces sign in using auth providers specified
 * by backend.
 * @module components/login-box/login-form-container
 * @author Michal Borzecki, Jakub Liput
 * @copyright (C) 2016-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { notEmpty, gt, equal } from '@ember/object/computed';
import { not, or } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import LoginFormContainer from 'onedata-gui-common/components/login-box/login-form-container';
import handleLoginEndpoint from 'onezone-gui/utils/handle-login-endpoint';
import _ from 'lodash';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import DOMPurify from 'npm:dompurify';
import { htmlSafe } from '@ember/template';

const ANIMATION_TIMEOUT = 333;

export default LoginFormContainer.extend(
  I18n,
  createDataProxyMixin('signInNotification'), {
    classNames: ['login-form-container'],

    i18n: service(),
    globalNotify: service(),
    authorizerManager: service(),
    onezoneServer: service(),
    onedataConnection: service(),
    guiMessageManager: service(),
    router: service(),

    /**
     * @override
     */
    i18nPrefix: 'components.loginBox.loginFormContainer',

    /**
     * @type {boolean}
     */
    testMode: equal('router.currentRouteName', 'test.login'),

    /**
     * Authorizer selected in dropdown
     * @type {AuthorizerInfo}
     */
    selectedAuthorizer: null,

    /**
     * If true, component is waiting for data to load.
     * @type {boolean}
     */
    isLoading: or(
      not('supportedAuthorizers.isFulfilled'),
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
     * @type {PromiseArray<AuthorizerInfo>}
     */
    supportedAuthorizers: computed('testMode', function supportedAuthorizers() {
      return this.get('authorizerManager')
        .getAvailableAuthorizers(this.get('testMode'));
    }),

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
     * @override
     */
    fetchSignInNotification() {
      return this.get('guiMessageManager')
      .getMessage('signin_notification')
        .then(message => {
          const sanitizedMessage =
            DOMPurify.sanitize(message, { ALLOWED_TAGS: ['#text'] });
          return sanitizedMessage ? htmlSafe(sanitizedMessage) : undefined;
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

    /**
     * Notifies about authentication error using auth provider.
     * @param {object} error
     * @returns {undefined}
     */
    _authEndpointError(error) {
      this.get('globalNotify').backendError('authentication', {
        message: this.t('authEndpointError') +
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
        this.send('authenticate', authorizer.id);
      },

      /**
       * Back button action in username/password mode. Shows auth providers list.
       * @returns {undefined}
       */
      backAction() {
        if (this.get('isUsernameLoginActive')) {
          this.set('showAuthenticationError', false);
          this.send('usernameLoginToggle');
        }
      },

      /**
       * Performs authentication using given auth provider name.
       * @param {string} authorizerName
       * @returns {undefined}
       */
      authenticate(authorizerName) {
        const {
          supportedAuthorizers,
          authenticationSuccess,
          onezoneServer,
          testMode,
        } = this.getProperties(
          'supportedAuthorizers',
          'authenticationSuccess',
          'onezoneServer',
          'testMode',
        );

        const authorizer = _.find(supportedAuthorizers, { type: authorizerName });
        this.set('_activeAuthorizer', authorizer);
        const loginEndpointPromise = testMode ?
          onezoneServer.getTestLoginEndpoint(authorizerName) :
          onezoneServer.getLoginEndpoint(authorizerName);
        return loginEndpointPromise
          .then(data => {
            handleLoginEndpoint(data, () => {
              this._authEndpointError({
                message: this.t('authEndpointConfError'),
              });
              authenticationSuccess();
            });
          })
          .catch(error => {
            this._authEndpointError(error);
          }).then(() => {
            this.setProperties({
              _activeAuthorizer: null,
              selectedAuthorizer: null,
            });
          });
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
        } = this.getProperties(
          'isProvidersDropdownVisible',
          '_formAnimationTimeoutId',
          '_animationTimeout'
        );
        const loginForm = this.$('.basicauth-login-form-container');
        const authorizersSelect = this.$('.authorizers-select-container');
        clearTimeout(_formAnimationTimeoutId);

        this.toggleProperty('isUsernameLoginActive');
        if (this.get('isUsernameLoginActive')) {
          this._animateHide(authorizersSelect);
          this._animateShow(loginForm, true);
          this.$('.login-username').focus();
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
        } = this.getProperties('_dropdownAnimationTimeoutId', '_animationTimeout');
        this.toggleProperty('isProvidersDropdownVisible');
        const authorizersDropdown = this.$('.authorizers-dropdown');
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
  }
);
