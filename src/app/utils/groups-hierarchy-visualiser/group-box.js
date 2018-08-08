/**
 * Group box implementation for groups hierarchy visualiser.
 * 
 * Filtration status of group box is defined in GroupBox instead of Column
 * to make GroupBox more standalone.
 * 
 * Y position of the group box is calculated without knowledge about Y positions
 * of earlier group boxes in column. Index in column and fixed group box height
 * is used instead. It is a quicker way, because we do not need to wait for render
 * to specify the position of the box.
 *
 * @module utils/groups-hierarchy-visualiser/group-box
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed } from '@ember/object';
import { reads, and } from '@ember/object/computed';
import GroupBoxLeftLine from 'onezone-gui/utils/groups-hierarchy-visualiser/group-box-left-line';
import GroupBoxRightLine from 'onezone-gui/utils/groups-hierarchy-visualiser/group-box-right-line';

export default EmberObject.extend({
  /**
   * @type {Group}
   * @virtual
   */
  group: undefined,

  /**
   * @type {Utils/GroupHierarchyVisualiser/Column}
   * @virtual
   */
  column: undefined,

  /**
   * @type {Ember.ComputedProperty<Utils/GroupHierarchyVisualiser/Workspace>}
   */
  workspace: reads('column.workspace'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  groupName: reads('group.name'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  groupId: reads('group.id'),

  /**
   * @type {Ember.ComputedProperty<number>}
   */
  width: reads('workspace.groupBoxWidth'),

  /**
   * @type {Ember.ComputedProperty<number>}
   */
  height: reads('workspace.groupBoxHeight'),

  /**
   * @type {Ember.ComputedProperty<number>}
   */
  gapBetweenBoxes: reads('workspace.groupBoxGap'),

  /**
   * @type {Ember.ComputedProperty<number>}
   */
  indexInColumn: computed('column.sortedGroupBoxes.[]', function indexInColumn() {
    return this.get('column.sortedGroupBoxes').indexOf(this);
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isFilteredOut: computed(
    'workspace.searchString',
    'group.name',
    function isFilteredOut() {
      const searchString = this.get('workspace.searchString').toLowerCase();
      const groupName = this.get('group.name');
      return !groupName || groupName.toLowerCase().indexOf(searchString) === -1;
    }
  ),

  /**
   * X position (relative to column)
   * @type {Ember.ComputedProperty<number>}
   */
  x: reads('column.groupBoxX'),

  /**
   * Y position (relative to column)
   * @type {Ember.ComputedProperty<number>}
   */
  y: computed(
    'indexInColumn',
    'gapBetweenBoxes',
    'height',
    'workspace.verticalPadding',
    function y() {
      const {
        indexInColumn,
        gapBetweenBoxes,
        height,
      } = this.getProperties(
        'indexInColumn',
        'gapBetweenBoxes',
        'height',
      );
      const verticalPadding = this.get('workspace.verticalPadding');
      return verticalPadding + indexInColumn * (height + gapBetweenBoxes);
    }
  ),

  /**
   * Bottom margin for the last group box in column
   * @type {Ember.ComputedProperty<number>}
   */
  marginBottom: computed(
    'indexInColumn',
    'column.sortedGroupBoxes.length',
    'workspace.verticalPadding',
    function marginBottom() {
      const boxesNumber = this.get('column.sortedGroupBoxes.length');
      return this.get('indexInColumn') + 1 === boxesNumber ?
        this.get('workspace.verticalPadding') : 0;
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Utils/GroupHierarchyVisualiser/GroupBoxLeftLine>}
   */
  leftLine: computed(function leftLine() {
    return GroupBoxLeftLine.create({
      groupBox: this,
    });
  }),

  /**
   * @type {Ember.ComputedProperty<Utils/GroupHierarchyVisualiser/GroupBoxRightLine>}
   */
  rightLine: computed(function rightLine() {
    return GroupBoxRightLine.create({
      groupBox: this,
    });
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isLeftLineVisible: reads('leftLine.isVisible'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isLeftLineHovered: reads('leftLine.hovered'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isLeftLineManuallyHovered: and('leftLine.hovered', 'leftLine.actionsEnabled'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isRightLineVisible: reads('rightLine.isVisible'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isRightLineHovered: reads('rightLine.hovered'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isRightLineManuallyHovered: and('rightLine.hovered', 'rightLine.actionsEnabled'),
});
