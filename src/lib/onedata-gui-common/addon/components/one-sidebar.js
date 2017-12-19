/**
 * A general layout of sidebar and container for sidebar content
 *
 * @module components/one-sidebar
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/one-sidebar';

const {
  computed,
  computed: {
    readOnly
  },
  inject: {
    service
  }
} = Ember;

export default Ember.Component.extend({
  layout,
  classNames: ['one-sidebar'],
  classNameBindings: [
    'isLoadingItem:loading-item'
  ],

  sidebar: service(),

  resourcesModel: null,

  currentItemId: readOnly('sidebar.currentItemId'),

  buttons: readOnly('resourcesModel.buttons'),

  /**
   * If true, level-0 item should present a loading state
   * @type {boolean}
   */
  isLoadingItem: computed.reads('sidebar.isLoadingItem'),

  title: computed('resourcesModel.resourceType', function () {
    let resourcesType = this.get('resourcesModel.resourceType');
    return resourcesType;
  }),
});
