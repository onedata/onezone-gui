/**
 * A service which provides spaces manipulation functions ready to use for GUI 
 *
 * @module services/space-actions
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Service.extend(I18n, {
  router: service(),
  i18n: service(),

  i18nPrefix: 'services.clusterActions',

  /**
   * @type {Ember.Computed<Array<SidebarButtonDefinition>>}
   */
  buttons: computed('btnAdd', function buttons() {
    return [this.get('btnAdd')];
  }),

  btnAdd: computed('router', function btnAdd() {
    const router = this.get('router');
    return {
      icon: 'add-filled',
      title: this.t('btnAdd.title'),
      tip: this.t('btnAdd.hint'),
      class: 'add-cluster-btn',
      action: () =>
        router.transitionTo('onedata.sidebar.content', 'clusters', 'add'),
    };
  }),
});
