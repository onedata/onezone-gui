/**
 * A message to show user when cannot authorize to hosted Onepanel
 *
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import ErrorCheckViewMixin from 'onedata-gui-common/mixins/error-check-view';

export default Component.extend(I18n, ErrorCheckViewMixin, {
  classNames: ['content-clusters-authentication-error'],

  router: service(),
  guiUtils: service(),

  /**
   * @virtual
   */
  cluster: undefined,

  /**
   * @override
   */
  i18nPrefix: 'components.contentClustersAuthenticationError',

  /**
   * @override
   */
  resourceId: computed('cluster.entityId', function resourceId() {
    return this.get('guiUtils').getRoutableIdFor(this.get('cluster'));
  }),

  /**
   * @override
   */
  checkErrorType: 'clusterAuthentication',

  /**
   * @override
   */
  checkError() {
    const authRedirect = sessionStorage.getItem('authRedirect');
    sessionStorage.removeItem('authRedirect');
    return Boolean(authRedirect);
  },

  /**
   * @override
   */
  redirectToIndex() {
    const {
      router,
      resourceId,
    } = this.getProperties('router', 'resourceId');
    return router.transitionTo(
      'onedata.sidebar.content.aspect',
      'clusters',
      resourceId,
      'index'
    );
  },

  actions: {
    tryAgain() {
      return this.redirectToIndex();
    },
  },
});
