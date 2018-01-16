/**
 * A component with information about no available space.
 *
 * @module components/content-spaces-empty
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['content-spaces-empty'],

  globalNotify: inject(),
  spaceManager: inject(),

  i18nPrefix: 'components.contentSpacesEmpty',

  actions: {
    // createToken() {
    //   const {
    //     i18n,
    //     globalNotify,
    //     router,
    //     clientTokenManager,
    //   } = this.getProperties('i18n', 'globalNotify', 'router', 'clientTokenManager');
    //   return clientTokenManager.createRecord().then((token) => {
    //     globalNotify.success(i18n.t(I18N_PREFIX + 'tokenCreateSuccess'));
    //     router.get('router').transitionTo('onedata.sidebar.content', 'tokens',
    //       token.get('id'));
    //   }).catch(error => globalNotify.backendError('token creation', error));
    // },
  },
});
