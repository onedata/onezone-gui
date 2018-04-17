/**
 * A content page with user account details
 *
 * @module components/content-users
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { not } from '@ember/object/computed';
import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { reject } from 'rsvp';
import { inject } from '@ember/service';
import { computed, set, get } from '@ember/object';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import authorizers from 'onezone-gui/utils/authorizers';
import handleLoginEndpoint from 'onezone-gui/utils/handle-login-endpoint';
import _ from 'lodash';

const animationTimeout = 333;

export default Component.extend(I18n, {
  classNames: 'content-users',

  globalNotify: inject(),
  linkedAccountManager: inject(),
  authorizerManager: inject(),
  onezoneServer: inject(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentUsers',

  /**
   * @type {models/user}
   */
  user: undefined,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  _loadingLinkedAccounts: not('_linkedAccounts.isLoaded'),

  /**
   * @type {undefined|object}
   */
  _loadingLinkedAccountsError: undefined,

  /**
   * @type {undefined|DS.RecordArray<models/LinkedAccount>}
   */
  _linkedAccounts: undefined,

  /**
   * @type {undefined|AuthorizerInfo}
   */
  _selectedAuthorizer: undefined,

  /**
   * Timeout id used to control add-account form mode change animation.
   * @type {number}
   */
  _formAnimationTimeoutId: -1,

  /**
   * Animation time (visibility toggle animation).
   * @type {number}
   */
  _animationTimeout: animationTimeout,

  /**
   * If true, dropdown with auth providers is visible in add-account section
   * @type {boolean}
   */
  _isProvidersDropdownVisible: false,

  /**
   * Object with mapping authorizerType -> authorizerInfo
   * @type {Ember.ComputedProperty<object>}
   */
  _accountsAuthorizers: computed('_linkedAccounts.isLoaded', function () {
    const _linkedAccounts = this.get('_linkedAccounts');
    const accountsAuthorizers = {};
    if (_linkedAccounts && _linkedAccounts.get('isLoaded')) {
      _linkedAccounts.mapBy('idp').forEach(type =>
        accountsAuthorizers[type] = _.find(authorizers, { type }) || {}
      );
    }
    return accountsAuthorizers;
  }),

  /**
   * @type {Array<AuthorizerInfo>}
   */
  _availableAuthorizers: computed(function () {
    return this.get('authorizerManager').getAvailableAuthorizers()
      .filter(authorizer => authorizer.type !== 'basicAuth');
  }),

  init() {
    this._super(...arguments);
    this.get('linkedAccountManager').getLinkedAccounts().then(linkedAccounts =>
      safeExec(this, 'set', '_linkedAccounts', linkedAccounts)
    ).catch(error =>
      safeExec(this, 'set', '_loadingLinkedAccountsError', error)
    );
  },

  /**
   * Shows global info about save error.
   * @param {object} error 
   * @returns {undefined}
   */
  _saveErrorHandler(error) {
    const globalNotify = this.get('globalNotify');
    globalNotify.backendError(this.t('userDataPersistence'), error);
  },

  /**
   * Saves user
   * @returns {Promise}
   */
  _saveUser() {
    const user = this.get('user');
    return user.save().catch(error => {
      this._saveErrorHandler(error);
      throw error;
    });
  },

  /**
   * Notifies about auth endpoint error.
   * @param {object} error
   * @returns {undefined}
   */
  _authEndpointError(error) {
    this.get('globalNotify').backendError(this.t('authentication'), {
      message: this.t('authEndpointError') +
        (error.message ? ' - ' + error.message : '.'),
    });
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
    saveName(name) {
      const user = this.get('user');
      if (!name || !name.length) {
        return reject();
      }
      const oldName = get(user, 'name');
      set(user, 'name', name);
      return this._saveUser().catch((error) => {
        // Restore old user name
        set(user, 'name', oldName);
        throw error;
      });
    },
    saveLogin(login) {
      const user = this.get('user');
      const oldLogin = get(user, 'login');
      set(user, 'login', login && login.length ? login : null);
      return this._saveUser().catch((error) => {
        // Restore old user login
        set(user, 'login', oldLogin);
        throw error;
      });
    },
    toggleAuthorizersDropdown() {
      const {
        _formAnimationTimeoutId,
        _animationTimeout,
      } = this.getProperties(
        '_formAnimationTimeoutId',
        '_animationTimeout'
      );
      const dropdownDesc = this.$('.show-dropdown-description');
      const authDropdown = this.$('.authorizers-dropdown');
      clearTimeout(_formAnimationTimeoutId);

      this.toggleProperty('_isProvidersDropdownVisible');
      if (this.get('_isProvidersDropdownVisible')) {
        this._animateHide(dropdownDesc);
        this._animateShow(authDropdown, true);
        this.$('.login-username').focus();
        this.set('_formAnimationTimeoutId',
          setTimeout(() => dropdownDesc.addClass('hide'), _animationTimeout)
        );
      } else {
        this._animateHide(authDropdown);
        this._animateShow(dropdownDesc, true);
        this.set('_formAnimationTimeoutId',
          setTimeout(() => authDropdown.addClass('hide'), _animationTimeout)
        );
      }
    },
    authorizerSelected(authorizer) {
      this.set('_selectedAuthorizer', authorizer);
      return this.get('onezoneServer').getLoginEndpoint({
          idp: authorizer.type,
          linkAccount: true,
          redirectUrl: window.location.toString(),
        }).then(data =>
          handleLoginEndpoint(data, () =>
            this._authEndpointError({
              message: this.t('authEndpointConfError'),
            })
          )
        ).catch(error => this._authEndpointError(error))
        .finally(() => safeExec(this, 'set', '_selectedAuthorizer', undefined));
    },
  },
});
