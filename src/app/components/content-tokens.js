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
import { computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';

export default Component.extend(I18n, GlobalActions, {
  classNames: ['content-tokens'],

  i18n: inject(),
  globalNotify: inject(),
  clientTokenManager: inject(),
  router: inject(),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  globalActionsTitle: computed(function () {
    return this.t('header');
  }),

  /**
   * @type {Ember.ComputedProperty<Array<AspectAction>>}
   */
  globalActions: computed(function () {
    return [{
      action: () => this.send('removeToken'),
      title: this.t('deleteToken'),
      class: 'delete-token',
      buttonStyle: 'danger',
      icon: 'remove',
    }];
  }),

  /**
   * @override
   */
  i18nPrefix: 'components.contentTokens',

  actions: {
    copySuccess() {
      this.get('globalNotify').info(this.t('tokenCopySuccess'));
    },
    copyError() {
      this.get('globalNotify').info(this.t('tokenCopyError'));
    },
    removeToken() {
      const {
        globalNotify,
        clientTokenManager,
        selectedToken,
        router,
      } = this.getProperties(
        'globalNotify',
        'clientTokenManager',
        'selectedToken',
        'router'
      );
      clientTokenManager.deleteRecord(selectedToken.get('id'))
        .then(() => {
          globalNotify.success(this.t('tokenDeleteSuccess'));
          router.transitionTo('onedata.sidebar.index', 'tokens');
        })
        .catch(error => globalNotify.backendError(this.t('tokenDeletion'), error));
    },
  },
});
