/**
 * Represents a relation between two groups - parent and child.
 *
 * @module utils/groups-hierarchy-visualiser/relation
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed, get } from '@ember/object';
import { and } from '@ember/object/computed';

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
    'parentGroup.childList.{list.[],isReloading}',
    'childGroup.parentList.{list.[],isReloading}',
    function relationToRemoveExists() {
      const {
        parentGroup,
        childGroup,
      } = this.getProperties('parentGroup', 'childGroup');
      const hasParentViewPrivilege = get(parentGroup, 'hasViewPrivilege');
      const hasChildViewPrivilege = get(childGroup, 'hasViewPrivilege');
      const parentId = get(parentGroup, 'id');
      const childId = get(childGroup, 'id');

      // If we cannot get relation information, then we can't assume that
      // relation exists
      if (!hasChildViewPrivilege && !hasParentViewPrivilege) {
        return false;
      }

      // We need to check both children and parents lists if possible, because
      // they can update separatedly and there may be a situation when one list does
      // not satisfy relation while the second one does it (because it
      // is outdated).
      const parentList = childGroup.belongsTo('parentList').value();
      const childList = parentGroup.belongsTo('childList').value();
      const parentIds = parentList ? parentList.hasMany('list').ids() : null;
      const childIds = childList ? childList.hasMany('list').ids() : null;
      if (parentIds && childIds) {
        return parentIds.indexOf(parentId) !== -1 &&
          childIds.indexOf(childId) !== -1;
      } else if (parentIds) {
        return parentIds.indexOf(parentId) !== -1;
      } else if (childIds) {
        return childIds.indexOf(childId) !== -1;
      } else {
        return false;
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  canViewPrivileges: and('exists', 'parentGroup.canViewPrivileges'),
});
