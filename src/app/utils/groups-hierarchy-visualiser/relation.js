/**
 * Represents a relation between two groups - parent and child.
 *
 * @module utils/groups-hierarchy-visualiser/relation
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed, get } from '@ember/object';

export default EmberObject.extend({
  /**
   * @type {Group}
   */
  parentGroup: undefined,

  /**
   * @type {Group}
   */
  childGroup: undefined,

  /**
   * If true, relation really exists
   * @type {Ember.ComputedProperty<boolean>}
   */
  exists: computed(
    'parentGroup.childList.list.[]',
    'childGroup.parentList.list.[]',
    function relationToRemoveExists() {
      const {
        parentGroup,
        childGroup,
      } = this.getProperties('parentGroup', 'childGroup');
      // We need to check both children and parents lists, because they can
      // update separatedly and there may be a situation when one list does
      // not satisfy relation while the second one does it (because it
      // is outdated).
      const childList = parentGroup.belongsTo('childList').value();
      const parentList = childGroup.belongsTo('parentList').value();
      if (parentList && childList) {
        const parentIds = parentList.hasMany('list').ids();
        const childIds = childList.hasMany('list').ids();
        return parentIds.indexOf(get(parentGroup, 'id')) !== -1 &&
          childIds.indexOf(get(childGroup, 'id')) !== -1;
      } else {
        return false;
      }
    }
  ),
});
