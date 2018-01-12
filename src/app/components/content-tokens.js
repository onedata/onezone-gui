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

const I18N_PREFIX = 'components.contentTokens.';

export default Component.extend({
  classNames: ['content-tokens'],

  i18n: inject(),
  globalNotify: inject(),
  clientTokenManager: inject(),
  router: inject(),

  actions: {
    copySuccess() {
      const {
        i18n,
        globalNotify,
      } = this.getProperties('i18n', 'globalNotify');

      globalNotify.info(i18n.t(I18N_PREFIX + 'tokenCopySuccess'));
    },
    copyError() {
      const {
        i18n,
        globalNotify,
      } = this.getProperties('i18n', 'globalNotify');

      globalNotify.info(i18n.t(I18N_PREFIX + 'tokenCopyError'));
    },
    removeToken() {
      const {
        i18n,
        globalNotify,
        clientTokenManager,
        selectedToken,
        router,
      } = this.getProperties(
        'i18n',
        'globalNotify',
        'clientTokenManager',
        'selectedToken',
        'router'
      );
      clientTokenManager.deleteRecord(selectedToken.get('id'))
        .then(() => {
          globalNotify.success(i18n.t(I18N_PREFIX + 'tokenDeleteSuccess'));
          router.get('router').transitionTo('onedata.sidebar.index', 'tokens');
        })
        .catch(error => globalNotify.backendError('token deletion', error));
    },
  },
});
