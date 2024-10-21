/**
 * Calculates properties related to group hierarchy visualiser column.
 * Main responsibilities:
 *  * observes model and updates group boxes array,
 *  * inferes column context using prevColumn and nextColumn,
 *  * reacts to line hover change and changes related line hover,
 *  * creates separator,
 *  * calculates position values for lines and group boxes, that are the same
 *    across whole column,
 *  * calculates column X position using prevColumn X position
 *
 * Column ID:
 *  Each column has an integer columnId, which is unique across the whole
 *  application. ID for new column is equal to lastGeneratedId+1. It means, that
 *  columnId generates an order, which tells us that one column has been created
 *  later than another.
 *
 * Column types:
 *  To read more about column types, see documentation for
 *  components/groups-hierarchy-visualiser.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, {
  computed,
  observer,
  get,
  set,
  getProperties,
  defineProperty,
} from '@ember/object';
import { reads, sort, filterBy, bool } from '@ember/object/computed';
import { A } from '@ember/array';
import { resolve } from 'rsvp';
import GroupBox from 'onezone-gui/utils/groups-hierarchy-visualiser/group-box';
import ColumnSeparator from 'onezone-gui/utils/groups-hierarchy-visualiser/column-separator';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { next } from '@ember/runloop';

let nextColumnId = 0;

function getNextColumnId() {
  return nextColumnId++;
}

export default EmberObject.extend({
  /**
   * One of: children, parents, startPoint, empty
   * @type {string}
   * @virtual
   */
  relationType: 'empty',

  /**
   * Parent group for children column or child group for parents column
   * @type {Group|null}
   * @virtual
   */
  relatedGroup: undefined,

  /**
   * @type {Utils/GroupHierarchyVisualiser/Workspace}
   * @virtual
   */
  workspace: undefined,

  /**
   * Column x position (relative to the whole graph)
   * @type {number}
   * @virtual
   */
  x: 0,

  /**
   * Column scroll position
   * @type {number}
   * @virtual
   */
  scrollTop: 0,

  /**
   * @type {Utils/GroupHierarchyVisualiser/Column|null}
   * @virtual
   */
  prevColumn: undefined,

  /**
   * @type {Utils/GroupHierarchyVisualiser/Column|null}
   * @virtual
   */
  nextColumn: undefined,

  /**
   * Array of group boxes (unsorted)
   * @type {Ember.A<Utils/GroupHierarchyVisualiser/GroupBox>}
   */
  groupBoxes: undefined,

  /**
   * @type {Set<Utils.GroupHierarchyVisualiser.GroupBox>}
   */
  createdGroupBoxes: undefined,

  /**
   * Column width
   * @type {Ember.ComputedProperty<number>}
   */
  width: reads('workspace.columnWidth'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isRelatedGroupDeleted: reads('relatedGroup.isDeleted'),

  /**
   * Group box, that has an expanded parents relation (connected left column)
   * @type {Ember.ComputedProperty<Utils/GroupHierarchyVisualiser/GroupBox|null>}
   */
  parentsRelationGroupBox: computed(
    'columnId',
    'prevColumn.{relationType,relatedGroup,columnId}',
    'relationType',
    'groupBoxes.[]',
    function parentsRelationGroupBox() {
      return this.findRelationGroupBox(this.get('prevColumn'), 'parents');
    }
  ),

  /**
   * Group box, that has an expanded children relation (connected right column)
   * @type {Ember.ComputedProperty<Utils/GroupHierarchyVisualiser/GroupBox|null>}
   */
  childrenRelationGroupBox: computed(
    'columnId',
    'nextColumn.{relationType,relatedGroup,columnId}',
    'relationType',
    'groupBoxes.[]',
    function childrenRelationGroupBox() {
      return this.findRelationGroupBox(this.get('nextColumn'), 'children');
    }
  ),

  /**
   * Indicates whether column should render children lines
   * (group box left line) or not
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasChildrenLines: bool('prevColumn.childrenRelationGroupBox'),

  /**
   * Indicates whether column should render parents lines
   * (group box right line) or not
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasParentsLines: bool('nextColumn.parentsRelationGroupBox'),

  /**
   * Array of groups
   * @type {PromiseArray<Group>}
   */
  model: computed({
    get() {
      return createEmptyColumnModel();
    },
    set(key, value) {
      return value ? value : createEmptyColumnModel();
    },
  }),

  /**
   * Group boxes sort order. Filter sort is more important than name sort
   * @type {Array<string>}
   */
  groupBoxesSortOrder: Object.freeze(['isFilteredOut', 'groupName']),

  /**
   * Array of sorted group boxes
   * @type {Ember.ComputedProperty<Ember.A<Utils/GroupHierarchyVisualiser/GroupBox>>}
   */
  sortedGroupBoxes: sort('groupBoxes', 'groupBoxesSortOrder'),

  /**
   * Array of group boxes, that have a left line
   * @type {Ember.ComputedProperty<Ember.A<Utils/GroupHierarchyVisualiser/GroupBox>>}
   */
  groupBoxesWithLeftLines: computed(
    'sortedGroupBoxes.@each.isLeftLineVisible',
    'parentsRelationGroupBox.isLeftLineVisible',
    function groupBoxesWithLeftLines() {
      return A(this.get('sortedGroupBoxes').filterBy('isLeftLineVisible', true));
    }),

  /**
   * Array of group boxes, that have a right line
   * @type {Ember.ComputedProperty<Ember.A<Utils/GroupHierarchyVisualiser/GroupBox>>}
   */
  groupBoxesWithRightLines: computed(
    'sortedGroupBoxes.@each.isRightLineVisible',
    'childrenRelationGroupBox.isRightLineVisible',
    function groupBoxesWithRightLines() {
      return A(this.get('sortedGroupBoxes').filterBy('isRightLineVisible', true));
    }),

  /**
   * X position of group box (relative to column)
   * @type {Ember.ComputedProperty<number>}
   */
  groupBoxX: computed('width', 'workspace.groupBoxWidth', function groupBoxX() {
    return (this.get('width') - this.get('workspace.groupBoxWidth')) / 2;
  }),

  /**
   * Y position of group box line without actions (relative to group box)
   * @type {Ember.ComputedProperty<number>}
   */
  groupBoxLineWithoutActionsY: computed(
    'workspace.{lineWidth,groupBoxHeight}',
    function groupBoxLineWithoutActionsY() {
      const {
        lineWidth,
        groupBoxHeight,
      } = getProperties(this.get('workspace'), 'lineWidth', 'groupBoxHeight');
      return (groupBoxHeight * 2) / 3 - lineWidth / 2;
    }
  ),

  /**
   * Y position of group box line with actions (relative to group box)
   * @type {Ember.ComputedProperty<number>}
   */
  groupBoxLineWithActionsY: computed(
    'workspace.{lineWidth,groupBoxHeight}',
    function groupBoxLineWithActionsY() {
      const {
        lineWidth,
        groupBoxHeight,
      } = getProperties(this.get('workspace'), 'lineWidth', 'groupBoxHeight');
      return groupBoxHeight / 3 - lineWidth / 2;
    }
  ),

  /**
   * X position of group box left line (relative to group box)
   * @type {Ember.ComputedProperty<number>}
   */
  groupBoxLeftLineX: computed('groupBoxX', function groupBoxLeftLineX() {
    return -this.get('groupBoxX');
  }),

  /**
   * Y position of group box left line (relative to group box)
   * @type {Ember.ComputedProperty<number>}
   */
  groupBoxLeftLineY: computed(
    'hasChildrenLines',
    'groupBoxLineWithoutActionsY',
    'groupBoxLineWithActionsY',
    function groupBoxLeftLineY() {
      return this.get('hasChildrenLines') ?
        this.get('groupBoxLineWithActionsY') :
        this.get('groupBoxLineWithoutActionsY');
    }
  ),

  /**
   * Length of group box left line
   * @type {Ember.ComputedProperty<number>}
   */
  groupBoxLeftLineLength: reads('groupBoxX'),

  /**
   * X position of group box right line (relative to group box)
   * @type {Ember.ComputedProperty<number>}
   */
  groupBoxRightLineX: reads('workspace.groupBoxWidth'),

  /**
   * Y position of group box right line (relative to group box)
   * @type {Ember.ComputedProperty<number>}
   */
  groupBoxRightLineY: computed(
    'hasParentsLines',
    'groupBoxLineWithoutActionsY',
    'groupBoxLineWithActionsY',
    function groupBoxRightLineY() {
      return this.get('hasParentsLines') ?
        this.get('groupBoxLineWithActionsY') :
        this.get('groupBoxLineWithoutActionsY');
    }
  ),

  /**
   * Length of group box right line
   * @type {Ember.ComputedProperty<number>}
   */
  groupBoxRightLineLength: computed(
    'width',
    'groupBoxX',
    'workspace.groupBoxWidth',
    function groupBoxRightLineLength() {
      const {
        width,
        groupBoxX,
      } = this.getProperties('width', 'groupBoxX');
      return width - groupBoxX - this.get('workspace.groupBoxWidth');
    }
  ),

  /**
   * Column separator (separates this and the next column)
   * @type {Ember.ComputedProperty<Utils/GroupHierarchyVisualiser/ColumnSeparator>}
   */
  separator: computed(function separator() {
    return ColumnSeparator.create({
      column: this,
    });
  }),

  /**
   * Group boxes with left lines hovered
   * @type {Ember.ComputedProperty<Array<Utils/GroupHierarchyVisualiser/GroupBox>>}
   */
  hoveredLeftLineGroupBoxes: filterBy(
    'groupBoxesWithLeftLines',
    'isLeftLineHovered',
    true
  ),

  /**
   * Group boxes with right lines hovered
   * @type {Ember.ComputedProperty<Array<Utils/GroupHierarchyVisualiser/GroupBox>>}
   */
  hoveredRightLineGroupBoxes: filterBy(
    'groupBoxesWithRightLines',
    'isRightLineHovered',
    true
  ),

  /**
   * Group boxes with left lines hovered manually (by user, not by script)
   * @type {Ember.ComputedProperty<Array<Utils/GroupHierarchyVisualiser/GroupBox>>}
   */
  manuallyHoveredLeftLineGroupBoxes: filterBy(
    'groupBoxesWithLeftLines',
    'isLeftLineManuallyHovered',
    true
  ),

  /**
   * Group boxes with right lines hovered manually (by user, not by script)
   * @type {Ember.ComputedProperty<Array<Utils/GroupHierarchyVisualiser/GroupBox>>}
   */
  manuallyHoveredRightLineGroupBoxes: filterBy(
    'groupBoxesWithRightLines',
    'isRightLineManuallyHovered',
    true
  ),

  modelObserver: observer(
    'model.content.list.content.[]',
    function modelObserver() {
      next(() => safeExec(this, 'recalculateGroupBoxes'));
    }
  ),

  /**
   * Sets hover state for right line, when opposite side left line has been
   * hovered manually
   */
  manuallyHoveredLeftLineGroupBoxesObserver: observer(
    'childrenRelationGroupBox',
    'groupBoxesWithRightLines.[]',
    'nextColumn.manuallyHoveredLeftLineGroupBoxes.[]',
    function manuallyHoveredLeftLineGroupBoxesObserver() {
      const {
        groupBoxesWithRightLines,
        childrenRelationGroupBox,
        nextColumn,
      } = this.getProperties(
        'groupBoxesWithRightLines',
        'childrenRelationGroupBox',
        'nextColumn'
      );
      // Existence of childrenRelationGroupBox usually means that nextColumn
      // also exists, but when some dynamic columns changes occur, there are
      // situations when these properties are not fully recalculated
      // (childrenRelationGroupBox !== null but nextColumn === null)
      if (nextColumn && childrenRelationGroupBox) {
        // Reset hover state
        groupBoxesWithRightLines
          .forEach(groupBox => set(groupBox, 'rightLine.hovered', false));
        if (get(nextColumn, 'manuallyHoveredLeftLineGroupBoxes.length') !== 0) {
          set(childrenRelationGroupBox, 'rightLine.hovered', true);
        }
      }
    }
  ),

  /**
   * Sets hover state for left line, when opposite side right line has been
   * hovered manually
   */
  manuallyHoveredRightLineGroupBoxesObserver: observer(
    'parentsRelationGroupBox',
    'groupBoxesWithLeftLines.[]',
    'prevColumn.manuallyHoveredRightLineGroupBoxes.[]',
    function manuallyHoveredLeftLineGroupBoxesObserver() {
      const {
        groupBoxesWithLeftLines,
        parentsRelationGroupBox,
        prevColumn,
      } = this.getProperties(
        'groupBoxesWithLeftLines',
        'parentsRelationGroupBox',
        'prevColumn'
      );
      // Existence of parentsRelationGroupBox usually means that prevColumn
      // also exists, but when some dynamic columns changes occur, there are
      // situations when these properties are not fully recalculated
      // (parentsRelationGroupBox !== null but prevColumn === null)
      if (prevColumn && parentsRelationGroupBox) {
        // Reset hover state
        groupBoxesWithLeftLines
          .forEach(groupBox => set(groupBox, 'leftLine.hovered', false));
        if (get(prevColumn, 'manuallyHoveredRightLineGroupBoxes.length') !== 0) {
          set(parentsRelationGroupBox, 'leftLine.hovered', true);
        }
      }
    }
  ),

  searchStringObserver: observer(
    'workspace.searchString',
    function searchStringObserver() {
      this.set('scrollTop', 0);
    }
  ),

  prevColumnObserver: observer('prevColumn', function prevColumnObserver() {
    if (this.get('prevColumn')) {
      let injectedValue = null;
      defineProperty(this, 'x', computed('prevColumn.x', 'width', {
        get() {
          if (injectedValue !== null) {
            return injectedValue;
          }
          const width = this.get('width');
          const prevX = this.get('prevColumn.x');
          return prevX === undefined ? 0 : prevX + width;
        },
        set(key, value) {
          return injectedValue = value;
        },
      }));
      // Without this `get` new value of `x` is not calculated. We need to
      // trigger first calculation manually.
      this.get('x');
    }
  }),

  init() {
    this._super(...arguments);
    this.setProperties({
      createdGroupBoxes: new Set(),
      columnId: getNextColumnId(),
    });
    if (!this.groupBoxes) {
      this.set('groupBoxes', A());
    }
    this.modelObserver();
    this.prevColumnObserver();
  },

  /**
   * @override
   */
  willDestroy() {
    try {
      this.createdGroupBoxes.forEach((box) => box.destroy());
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * Updates array of group boxes according to groups in model. It reuses
   * already created group boxes if possible.
   * @returns {undefined}
   */
  recalculateGroupBoxes() {
    const incomingGroups = this.get('model.content.list.content') || A();
    const existingGroupBoxes = this.get('groupBoxes')
      .filter(groupBox => incomingGroups.indexOf(get(groupBox, 'group') !== -1));
    const existingGroups = existingGroupBoxes.map(groupBox =>
      get(groupBox, 'group')
    );
    this.set('groupBoxes', A(incomingGroups.map(group => {
      const existingIndex = existingGroups.indexOf(group);
      return existingIndex !== -1 ?
        existingGroupBoxes[existingIndex] : this.createGroupBox(group);
    })));
  },

  /**
   * Creates new group box
   * @param {Group} group
   * @returns {Utils/GroupHierarchyVisualiser/GroupBox}
   */
  createGroupBox(group) {
    const newGroupBox = GroupBox.create({
      group,
      column: this,
    });
    this.createdGroupBoxes.add(newGroupBox);
    return newGroupBox;
  },

  /**
   * Finds group box that can be a trigger for siblingColumn
   * (siblingColumn.relatedGroup and groupBox.group are the same and relation fits)
   * @param {Utils/GroupHierarchyVisualiser/Column} siblingColumn
   * @param {string} expectedRelationType One of `parents`, `children`
   * @returns {Utils/GroupHierarchyVisualiser/GroupBox|null}
   */
  findRelationGroupBox(siblingColumn, expectedRelationType) {
    const {
      columnId,
      relationType,
      groupBoxes,
    } = this.getProperties(
      'columnId',
      'relationType',
      'groupBoxes'
    );
    if (!siblingColumn || relationType === 'empty') {
      return null;
    }
    const {
      relationType: siblingRelationType,
      columnId: siblingColumnId,
      relatedGroup: siblingRelatedGroup,
    } = getProperties(
      siblingColumn,
      'relationType',
      'columnId',
      'relatedGroup'
    );
    // siblingColumnId > columnId means that sibling has been created after
    // this column. It is a way to solve conflict when two columns can be
    // a relation source for each other. Older column cannot be a related
    // column for a younger one.
    if (
      siblingRelationType === expectedRelationType &&
      siblingColumnId > columnId
    ) {
      return groupBoxes.filterBy('group', siblingRelatedGroup)[0] || null;
    } else {
      return null;
    }
  },
});

export function createEmptyColumnModel() {
  return PromiseObject.create({
    promise: resolve(EmberObject.create({
      list: PromiseArray.create({ promise: resolve(A()) }),
    })),
  });
}
