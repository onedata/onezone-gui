/**
 * A content page with user account details
 *
 * @module components/content-users
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { reject } from 'rsvp';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import authorizers from 'onezone-gui/utils/authorizers';
import handleLoginEndpoint from 'onezone-gui/utils/handle-login-endpoint';
import _ from 'lodash';

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
   * @type {boolean}
   */
  _loadingLinkedAccounts: true,

  /**
   * @type {undefined|object}
   */
  _loadingLinkedAccountsError: undefined,

  /**
   * @type {undefined|DS.RecordArray<models/LinkedAccount}
   */
  _linkedAccounts: undefined,

  /**
   * @type {undefined|AuthorizerInfo}
   */
  _selectedAuthorizer: undefined,

  /**
   * Object with mapping authorizerType -> authorizerDefinition
   * @type {Ember.ComputedProperty<object>}
   */
  _accountsAuthorizers: computed('_linkedAccounts.@each.type', function () {
    const _linkedAccounts = this.get('_linkedAccounts');
    const accountsAuthorizers = {};
    if (_linkedAccounts) {
      _linkedAccounts.mapBy('type').forEach(type =>
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
    ).finally(() => safeExec(this, 'set', '_loadingLinkedAccounts', false));
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
    this.get('globalNotify').backendError(this.tt('authentication'), {
      message: this.tt('authEndpointError') +
        (error.message ? ' - ' + error.message : '.'),
    });
  },

  actions: {
    saveName(name) {
      const user = this.get('user');
      if (!name || !name.length) {
        return reject();
      }
      user.set('name', name);
      return this._saveUser();
    },
    saveLogin(login) {
      const user = this.get('user');
      user.set('login', login && login.length ? login : null);
      return this._saveUser();
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
              message: this.tt('authEndpointConfError'),
            })
          )
        ).catch(error => this._authEndpointError(error))
        .finally(() => safeExec(this, 'set', '_selectedAuthorizer', undefined));
    },
  },
});
