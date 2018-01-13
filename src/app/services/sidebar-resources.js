/**
 * An abstraction layer for getting data for sidebar of various tabs
 *
 * @module services/sidebar-resources
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { inject as service } from '@ember/service';
import $ from 'jquery';

const I18N_PREFIX = 'services.sidebarResources.';

export default Service.extend({
  providerManager: service(),
  clientTokenManager: service(),
  router: service(),
  globalNotify: service(),
  i18n: service(),

  /**
   * @param {string} type
   * @returns {PromiseArray}
   */
  getCollectionFor(type) {
    switch (type) {
      case 'providers':
        return this.get('providerManager').getProviders();
      case 'tokens':
        return this.get('clientTokenManager').getClientTokens();
      case 'users':
        return Promise.reject({ message: 'User management not implemented yet' });
      default:
        return new Promise((resolve, reject) => reject('No such collection: ' + type));
    }
  },

  /**
   * Returns sidebar buttons definitions
   * @param {string} type
   * @returns {Array<object>}
   */
  getButtonsFor(type) {
    const i18n = this.get('i18n');
    switch (type) {
      case 'tokens':
        return [{
          icon: 'add-filled',
          title: i18n.t(I18N_PREFIX + 'createToken'),
          tip: i18n.t(I18N_PREFIX + 'createToken'),
          class: 'create-token-btn',
          action: () => {
            const {
              i18n,
              globalNotify,
              router,
              clientTokenManager,
            } = this.getProperties(
              'i18n',
              'globalNotify',
              'router',
              'clientTokenManager'
            );
            return clientTokenManager.createRecord().then((token) => {
              globalNotify.success(i18n.t(
                'components.contentTokens.tokenCreateSuccess'
              ));
              router.get('router').transitionTo(
                'onedata.sidebar.content',
                'tokens',
                token.get('id')
              );
              const sidebarContainer = $('.col-sidebar');
              $('.col-sidebar').scrollTop(sidebarContainer[0].scrollHeight -
                sidebarContainer[0].clientHeight);
            }).catch(error => globalNotify.backendError('token creation', error));
          },
        }];
      default:
        return [];
    }
  },
});
