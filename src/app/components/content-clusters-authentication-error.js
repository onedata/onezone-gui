/**
 * A message to show user when cannot authorize to hosted Onepanel
 *
 * @module components/content-clusters-authentication-error
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  classNames: ['content-clusters-authentication-error'],

  router: service(),

  /**
   * @virtual
   */
  cluster: undefined,

  /**
   * @override
   */
  i18nPrefix: 'components.contentClustersAuthenticationError',

  actions: {
    tryAgain() {
      return this.get('router').transitionTo(
        'onedata.sidebar.content.aspect',
        'clusters',
        this.get('cluster.entityId'),
        'index'
      );
    },
  },
});
