/**
 * Adds length property to the list model. Thanks to that, we can know how many
 * entities are in the list without really fetching them.
 * 
 * WARNING: length of the list is not recalculated when store deletes data 
 * from the list e.g. after destroyRecord (because hasMany('list').ids() 
 * is not observable). Because of that after model deletion length calculation
 * should be started manually by calling `notifyPropertyChange('isReloading')`
 * on the list model.
 *
 * @module mixins/models/graph-list-model
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';

export default Mixin.create({
  /**
   * @type {Ember.ComputedProperty<number>}
   */
  length: computed('isLoading', 'isReloading', function length() {
    return this.hasMany('list').ids().length;
  }),

  didLoad() {
    this.notifyPropertyChange('isLoading');
  },
});
