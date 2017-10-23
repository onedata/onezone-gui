/**
 * A first-level item component for providers sidebar
 *
 * @module components/sidebar-providers/provider-item
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import Component from '@ember/component';
import { A } from '@ember/array';

export default Component.extend({
  tagName: '',

  /**
   * Provider item
   * @type {Provider}
   */
  item: undefined,

  /**
   * Icon class based on item status
   * @type {Ember.ComputedProperty<string>}
   */
  iconClass: computed('item.status', function () {
    switch (this.get('item.status')) {
      case 'online':
        return 'text-success';
      case 'offline':
        return 'text-danger';
      default:
        return 'animated infinite hinge pulse-red-mint';
    }
  }),

  _spacesProxy: computed.readOnly('item.spaceList.list'),

  /**
   * Total provider support size
   * @type {Ember.ComputedProperty<Ember.Array<Space>>}
   */
  _spaces: computed('_spacesProxy.{isFulfilled,content}', function () {
    const {
      isFulfilled,
      content,
    } = this.get('_spacesProxy').getProperties('isFulfilled', 'content');
    return isFulfilled ? content : A();
  }),

  /**
   * Total provider support size
   * @type {Ember.ComputedProperty<number>}
   */
  _totalSupportSize: computed('_spaces.[]', function () {
    const {
      _spaces,
      item,
    } = this.getProperties('_spaces', 'item');
    return _spaces.reduce(
      (sum, space) => sum + space.get(`supportSizes.${item.get('id')}`), 0
    );
  }),
});
