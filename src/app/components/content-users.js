/**
 * A content page with user account details
 *
 * @module components/content-users
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { computed, set, get, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import handleLoginEndpoint from 'onezone-gui/utils/handle-login-endpoint';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { htmlSafe } from '@ember/template';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import computedT from 'onedata-gui-common/utils/computed-t';
import { collect } from '@ember/object/computed';
import Action from 'onedata-gui-common/utils/action';
import { tag } from 'ember-awesome-macros';

const animationTimeout = 333;

const mixins = [
  I18n,
  GlobalActions,
];

export default Component.extend(...mixins, {
  classNames: 'content-users',

  globalNotify: service(),
  linkedAccountManager: service(),
  authorizerManager: service(),
  onezoneServer: service(),
  userActions: service(),
  userManager: service(),
  guiUtils: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentUsers',

  /**
   * @override
   */
  globalActionsTitle: computedT('globalActionsGroupName'),

  /**
   * @override
   */
  globalActions: collect('deleteAccountAction'),

  /**
   * @type {models/user}
   */
  user: undefined,

  /**
   * @type {Boolean}
   */
  deleteAccountOpened: false,

  /**
   * @type {Boolean}
   */
  deleteConfirmChecked: false,

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
   * @type {boolean}
   */
  isChangingPassword: false,

  /**
   * @type {ComputedProperty<boolean>}
   */
  showPasswordSection: reads('user.basicAuthEnabled'),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  deleteAccountAction: computed(function deleteAccountAction() {
    const component = this;
    return Action.extend({
      ownerSource: component,
      component,
      i18nPrefix: tag `${'component.i18nPrefix'}.deleteAccountAction`,
      className: 'delete-account-action-btn',
      icon: 'x',
      title: computedT('title'),
      disabled: false,
      execute() {
        set(component, 'deleteAccountOpened', true);
      },
    }).create();
  }),

  /**
   * @type {ComputedProperty<string>}
   */
  passwordString: computed('user.hasPassword', function passwordString() {
    const hasPassword = this.get('user.hasPassword');
    return hasPassword ? htmlSafe('&#9679;'.repeat(5)) : undefined;
  }),

  /**
   * @type {ComputedProperty<LinkedAccountList>}
   */
  linkedAccountsList: reads('linkedAccountsProxy.content.list'),

  /**
   * @type {Ember.ComputedProperty<PromiseObject<LinkedAccountList>>}
   */
  linkedAccountsProxy: computed(function linkedAccountsProxy() {
    return PromiseObject.create({
      promise: this.get('linkedAccountManager').getLinkedAccounts(),
    });
  }),

  identityProviders: computed(function identityProviders() {
    return this.get('authorizerManager').getAvailableAuthorizers();
  }),

  /**
   * Array of auth providers for powerselect
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  authorizersForSelect: computed('identityProviders.[]', function () {
    const supportedAuthorizers = this.get('identityProviders');
    if (supportedAuthorizers) {
      return supportedAuthorizers.filter(auth => auth.id !== 'basicAuth');
    } else {
      return [];
    }
  }),

  /**
   * @type {ComputedProperty<Array<Object>>} `[ { account, authorizer } ]`
   */
  accountsInfo: computed(
    'linkedAccountsList.@each.{idp,emails}',
    'identityProviders.@each.{iconPath,id,iconBackgroundColor,displayName}',
    function accountsInfo() {
      const {
        linkedAccountsList,
        identityProviders,
      } = this.getProperties('linkedAccountsList', 'identityProviders');
      if (linkedAccountsList) {
        return linkedAccountsList.map(linkedAccount => ({
          account: linkedAccount,
          authorizer: identityProviders.find(idp =>
            idp.id === get(linkedAccount, 'idp')
          ),
        }));
      }
    }
  ),

  usernameObserver: observer('user.username', function usernameObserver() {
    const username = this.get('user.username');
    if (!username) {
      // If username has been cleared out, password change is impossible.
      this.set('isChangingPassword', false);
    }
  }),

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
    saveFullName(fullName) {
      const user = this.get('user');
      const oldFullName = get(user, 'fullName');
      set(user, 'fullName', fullName || '');
      return this._saveUser().catch((error) => {
        // Restore old user full name
        set(user, 'fullName', oldFullName);
        throw error;
      });
    },
    saveUsername(username) {
      const user = this.get('user');
      const oldUsername = get(user, 'username');
      set(user, 'username', username || '');
      return this._saveUser().catch((error) => {
        // Restore old username
        set(user, 'username', oldUsername);
        throw error;
      });
    },
    startPasswordChange() {
      this.set('isChangingPassword', true);
    },
    stopPasswordChange() {
      this.set('isChangingPassword', false);
    },
    saveNewPassword({ currentPassword, newPassword }) {
      const {
        userActions,
        user,
      } = this.getProperties('userActions', 'user');
      return userActions
        .changeUserPassword(user, currentPassword, newPassword)
        .then(() => {
          safeExec(this, () => {
            this.set('isChangingPassword', false);
          });
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
      return this.get('onezoneServer').getLoginEndpoint(
          authorizer.id,
          true,
          window.location.toString(),
        ).then(data =>
          handleLoginEndpoint(data, () =>
            this._authEndpointError({
              message: this.t('authEndpointConfError'),
            })
          )
        ).catch(error => this._authEndpointError(error))
        .finally(() => safeExec(this, 'set', '_selectedAuthorizer', undefined));
    },
    removeModalHidden() {
      this.set('deleteConfirmChecked', false);
    },
    removeUser() {
      const {
        userManager,
        globalNotify,
        guiUtils,
        user,
      } = this.getProperties('userManager', 'globalNotify', 'guiUtils', 'user');
      return userManager.remove(user)
        .catch(error => {
          globalNotify.backendError(this.t('deleteAccountModal.deletingAccount'));
          throw error;
        })
        .then(() => {
          return guiUtils.logout();
        });
    },
  },
});
