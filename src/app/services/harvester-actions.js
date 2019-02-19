/**
 * A service which provides harvester manipulation functions ready to use for GUI 
 *
 * @module services/harvester-actions
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { collect } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Service.extend(I18n, {
  router: service(),
  i18n: service(),
  harvesterManager: service(),
  globalNotify: service(),
  guiUtils: service(),

  /**
   * @override
   */
  i18nPrefix: 'services.harvesterActions',

  /**
   * @type {Ember.ComputedProperty<Array<SidebarButtonDefinition>>}
   */
  buttons: collect('btnCreate'),

  /**
   * @type {Ember.ComputedProperty<SidebarButtonDefinition>}
   */
  btnCreate: computed(function btnCreate() {
    const router = this.get('router');
    return {
      icon: 'add-filled',
      title: this.t('btnCreate.title'),
      tip: this.t('btnCreate.hint'),
      class: 'create-harvester-btn',
      action: () => router.transitionTo('onedata.sidebar.content', 'harvesters', 'new'),
    };
  }),
});
