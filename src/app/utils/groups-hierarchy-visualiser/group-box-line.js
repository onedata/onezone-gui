/**
 * Group box line in groups hierarchy component. It is a base class for left and
 * right line and should not be used standalone.
 *
 * @module utils/groups-hierarchy-visualiser/group-box-line
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export default EmberObject.extend({
  /**
   * @type {Utils/GroupHierarchyVisualiser/GroupBox}
   * @virtual
   */
  groupBox: undefined,

  /**
   * If true, line is rendered
   * @type {boolean}
   */
  isVisible: undefined,

  /**
   * X position (relative to group box)
   * @type {number}
   */
  x: undefined,

  /**
   * Y position (relative to group box)
   * @type {number}
   */
  y: undefined,

  /**
   * @type {number}
   */
  length: undefined,

  /**
   * If true, relation actions are available for this line
   * @type {boolean}
   */
  actionsEnabled: undefined,

  /**
   * @type {Utils/MembershipRelation}
   */
  relation: undefined,

  /**
   * @type {Utils/MembershipRelation}
   */
  column: reads('groupBox.column'),

  /**
   * Y position (relative to the column)
   * @type {Ember.ComputedProperty<number>}
   */
  absoluteY: computed('groupBox.y', 'y', function () {
    return this.get('groupBox.y') + this.get('y');
  }),
});
