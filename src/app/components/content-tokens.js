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
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['content-tokens'],

  i18n: inject(),
  globalNotify: inject(),
  clientTokenManager: inject(),
  router: inject(),

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
          router.get('router').transitionTo('onedata.sidebar.index', 'tokens');
        })
        .catch(error => globalNotify.backendError(this.t('tokenDeletion'), error));
    },
  },
});
