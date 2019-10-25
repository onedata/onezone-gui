/**
 * A content page for single selected token
 *
 * @module components/content-tokens
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed, get } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
// import { next } from '@ember/runloop';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { resolve } from 'rsvp';

export default Component.extend(I18n, GlobalActions, createDataProxyMixin('tokenTarget'), {
  classNames: ['content-tokens'],

  i18n: inject(),
  globalNotify: inject(),
  // clientTokenManager: inject(),
  // navigationState: inject(),
  // router: inject(),

  // /**
  //  * @type {Ember.ComputedProperty<string>}
  //  */
  // globalActionsTitle: computed(function () {
  //   return this.t('header');
  // }),

  // /**
  //  * @type {Ember.ComputedProperty<Array<AspectAction>>}
  //  */
  // globalActions: computed(function () {
  //   return [{
  //     action: () => this.send('removeToken'),
  //     title: this.t('deleteToken'),
  //     class: 'delete-token',
  //     buttonStyle: 'danger',
  //     icon: 'remove',
  //   }];
  // }),

  /**
   * @override
   */
  i18nPrefix: 'components.contentTokens',

  datetimeFormat: 'YYYY/MM/DD H:mm',

  tokenTargetIcon: computed('tokenTarget', function () {
    const tokenTarget = this.get('tokenTarget');

    if (tokenTarget) {
      if (get(tokenTarget, 'error')) {
        const errorId = get(tokenTarget, 'error.id');
        if (errorId) {
          switch (errorId) {
            case 'notFound':
              return 'sth';
            case 'forbidden':
              return 'sth';
            default:
              return null;
          }
        } else {
          return null;
        }
      } else {
        const modelName = tokenTarget.constructor.modelName;
        switch (modelName) {
          case 'group':
          case 'space':
          case 'user':
          case 'cluster':
            return modelName;
          case 'harvester':
            return 'light-bulb';
        }
      }
    } else {
      return null;
    }
  }),

  fetchTokenTarget() {
    const proxy = this.get('token.tokenTargetProxy') || resolve(null);
    return proxy.catch(error => {
      const errorId = error && error.id;
      return {
        hasHandledError: ['forbidden', 'notFound'].includes(errorId),
        error,
      };
    });
  },
  

  // /**
  //  * @virtual
  //  * @type {ClientToken}
  //  */
  // selectedToken: undefined,

  // /**
  //  * If actual token disappeared from the sidebar, redirects to token main page
  //  * @returns {Promise}
  //  */
  // redirectOnGroupDeletion() {
  //   const {
  //     navigationState,
  //     router,
  //   } = this.getProperties('navigationState', 'router');
  //   const groupId = get(navigationState, 'activeResource.id');
  //   return navigationState
  //     .resourceCollectionContainsId(groupId)
  //     .then(contains => {
  //       if (!contains) {
  //         next(() => router.transitionTo('onedata.sidebar', 'groups'));
  //       }
  //     });
  // },

  actions: {
    copySuccess() {
      this.get('globalNotify').info(this.t('tokenCopySuccess'));
    },
    copyError() {
      this.get('globalNotify').info(this.t('tokenCopyError'));
    },
    // removeToken() {
    //   const {
    //     clientTokenActions,
    //     selectedToken,
    //   } = this.getProperties(
    //     'clientTokenManager',
    //     'selectedToken'
    //   );
    //   return clientTokenActions.deleteToken(selectedToken)
    //     .then(() => this.redirectOnTokenDeletion());
    // },
  },
});
