/**
 * A component with information about no available token.
 *
 * @module components/content-tokens-empty
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject } from '@ember/service';

const I18N_PREFIX = 'components.contentTokens.';

export default Component.extend({
  classNames: ['content-tokens-empty'],

  i18n: inject(),
  router: inject(),
  globalNotify: inject(),
  clientTokenManager: inject(),

  actions: {
    createToken() {
      const {
        i18n,
        globalNotify,
        router,
        clientTokenManager,
      } = this.getProperties('i18n', 'globalNotify', 'router', 'clientTokenManager');
      return clientTokenManager.createRecord().then((token) => {
        globalNotify.success(i18n.t(I18N_PREFIX + 'tokenCreateSuccess'));
        router.get('router').transitionTo('onedata.sidebar.content', 'tokens',
          token.get('id'));
      }).catch(error => globalNotify.backendError('token creation', error));
    },
  },
});
