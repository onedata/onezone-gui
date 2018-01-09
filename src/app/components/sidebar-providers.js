/**
 * A sidebar for providers (extension of ``two-level-sidebar``)
 *
 * @module components/sidebar-providers
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { default as EmberObject, computed, get } from '@ember/object';

import TwoLevelSidebar from 'onedata-gui-common/components/two-level-sidebar';
import layout from 'onedata-gui-common/templates/components/two-level-sidebar';

export default TwoLevelSidebar.extend({
  layout,

  classNames: ['sidebar-providers'],

  /**
   * @override
   */
  model: null,

  /**
   * @override
   */
  firstLevelItemIcon: 'provider',

  /**
   * @override
   */
  firstLevelItemComponent: 'sidebar-providers/provider-item',

  /**
   * @override
   */
  triggerEventOnPrimaryItemSelection: true,

  /**
   * @override
   */
  sidebarType: 'providers',

  /**
   * An array with spaces for the active provider
   * @type {Ember.ComputedProperty<DS.PromiseManyArray<Space>>}
   */
  secondLevelItemsProxy: computed(
    'model.collection.[]', 'primaryItemId',
    function () {
      let {
        model,
        primaryItemId,
      } = this.getProperties('model', 'primaryItemId');
      let provider = null;
      if (model.resourceType === 'providers') {
        provider = get(model, 'collection')
          .filter(item => item.get('id') === primaryItemId)[0] || null;
      }
      return provider ? provider.get('spaceList.list') :
        EmberObject.create({ isFulFilled: false });
    }
  ),

  /**
   * @override
   */
  secondLevelItems: computed(
    'secondLevelItemsProxy.{isFulfilled,content}',
    function () {
      let {
        primaryItemId,
        secondLevelItemsProxy,
      } = this.getProperties('primaryItemId', 'secondLevelItemsProxy');
      let {
        isFulfilled,
        content,
      } = secondLevelItemsProxy.getProperties('isFulfilled', 'content');
      if (isFulfilled) {
        return content.map(item => ({
          id: item.get('id'),
          label: item.get('name'),
          icon: 'space',
          withoutRoute: true,
          component: 'sidebar-providers/space-item',
          spaceSize: item.get('supportSizes')[primaryItemId],
        }));
      } else {
        return [];
      }
    }
  ).readOnly(),
});
