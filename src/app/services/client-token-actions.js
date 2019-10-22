/**
 * A service which provides client-tokens manipulation functions ready to use for gui
 *
 * @module services/client-token-actions
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { default as Service, inject as service } from '@ember/service';
import { computed, get } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import $ from 'jquery';

export default Service.extend(I18n, {
  clientTokenManager: service(),
  router: service(),
  guiUtils: service(),
  globalNotify: service(),
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'services.clientTokenActions',

  /**
   * Array of action buttons definitions used by sidebar
   * @type {Ember.ComputedProperty<Array<object>>}
   */
  actionButtons: computed(function () {
    return [{
      icon: 'add-filled',
      title: this.t('createToken'),
      tip: this.t('createToken'),
      class: 'create-token-btn',
      action: () => this.createToken(),
    }];
  }),

  /**
   * Creates token
   * @returns {Promise} A promise, which resolves to new token if it has
   * been created successfully.
   */
  createToken() {
    const {
      globalNotify,
      router,
      clientTokenManager,
      guiUtils,
    } = this.getProperties(
      'globalNotify',
      'router',
      'clientTokenManager',
      'guiUtils'
    );
    return clientTokenManager.createRecord().then((token) => {
      globalNotify.success(this.t('tokenCreateSuccess'));
      router.transitionTo(
        'onedata.sidebar.content',
        'tokens',
        guiUtils.getRoutableIdFor(token)
      );
      // TODO: instead that, always scroll to sidebar position on changing
      // sidebar chosen item
      $('.col-sidebar').scrollTop(0);
    }).catch(error => {
      globalNotify.backendError(this.t('tokenCreation'), error);
      throw error;
    });
  },

  /**
   * @param {Models.ClientToken} token
   * @returns {Promise}
   */
  deleteToken(token) {
    const {
      globalNotify,
      clientTokenManager,
    } = this.getProperties('globalNotify', 'clientTokenManager');

    return clientTokenManager.deleteToken(get(token, 'entityId'))
      .then(result => {
        globalNotify.success(this.t('tokenRemoveSuccess'));
        return result;
      })
      .catch(error => {
        globalNotify.backendError(this.t('removingToken'), error);
        throw error;
      });
  },
});
