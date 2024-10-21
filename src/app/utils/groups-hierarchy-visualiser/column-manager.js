/**
 * Manages columns in groups hierarchy visualiser. Main responsibilities:
 *   * injects Workspace into column,
 *   * sets prevColumn and nextColumn fields for each Column,
 *   * reacts to columnsNumber change and adds/removes columns to fulfill that
 *     number requirement,
 *   * exposes methods to manipulate columns from the outside: insertColumnBefore,
 *     insertColumnAfter, replaceColumn.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, {
  get,
  set,
  computed,
  observer,
} from '@ember/object';
import { A } from '@ember/array';
import { next, later, debounce } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import Column from 'onezone-gui/utils/groups-hierarchy-visualiser/column';

export default EmberObject.extend({
  /**
   * @type {Utils/GroupHierarchyVisualiser/Workspace}
   * @virtual
   */
  workspace: undefined,

  /**
   * @type {Set<Utils.GroupsHierarchyVisualiser.Column>}
   */
  createdColumnsSet: undefined,

  /**
   * @type {Ember.A<Utils/GroupHierarchyVisualiser/Column>}
   */
  columns: computed(function columns() {
    return A();
  }),

  /**
   * Connects columns to create linked-list structure
   */
  columnsObserver: observer('columns.[]', 'workspace', function columnsObserver() {
    const {
      columns,
      workspace,
    } = this.getProperties('columns', 'workspace');
    columns.forEach(column => {
      if (get(column, 'workspace') !== workspace) {
        set(column, 'workspace', workspace);
      }
    });
    let prevColumn;
    let column = null;
    let nextColumn = columns.objectAt(0);
    for (let i = 0, l = get(columns, 'length'); i < l; i++) {
      prevColumn = column;
      column = nextColumn;
      nextColumn = columns.objectAt(i + 1);
      if (get(column, 'prevColumn') !== prevColumn) {
        set(column, 'prevColumn', prevColumn);
      }
      if (get(column, 'nextColumn') !== nextColumn) {
        set(column, 'nextColumn', nextColumn);
      }
    }
  }),

  /**
   * Adds/removes columns to satisfy columnsNumber restriction
   */
  columnsNumberObserver: observer(
    'workspace.columnsNumber',
    function columnsNumberObserver() {
      this.addMissingColumns();
      // Remove columns, that are outside screen
      debounce(
        this,
        'removeColumnsAfterResize',
        this.get('workspace.animationTime')
      );
    }
  ),

  init() {
    this._super(...arguments);
    this.set('createdColumnsSet', new Set());
    this.columnsObserver();
    this.addMissingColumns();
  },

  willDestroy() {
    try {
      this.createdColumnsSet.forEach((col) => col.destroy());
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * Inserts column before startColumn
   * @param {Utils/GroupHierarchyVisualiser/Column} column
   * @param {Utils/GroupHierarchyVisualiser/Column} startColumn
   * @returns {undefined}
   */
  insertColumnBefore(column, startColumn) {
    if (!column) {
      return;
    }
    const prevColumn = get(startColumn, 'prevColumn');
    if (prevColumn) {
      this.replaceColumn(prevColumn, column);
    } else {
      this.get('columns').unshiftObject(column);
      set(column, 'x', -this.get('workspace.columnWidth'));
      next(() => safeExec(this, 'moveColumns', 1));
      later(
        () => safeExec(this, 'removeUnnecessaryColumns'),
        this.get('workspace.animationTime')
      );
    }
  },

  /**
   * Inserts column after startColumn
   * @param {Utils/GroupHierarchyVisualiser/Column} column
   * @param {Utils/GroupHierarchyVisualiser/Column} startColumn
   * @returns {undefined}
   */
  insertColumnAfter(column, startColumn) {
    if (!column) {
      return;
    }
    const nextColumn = get(startColumn, 'nextColumn');
    if (nextColumn) {
      this.replaceColumn(nextColumn, column);
    } else {
      this.get('columns').pushObject(column);
      next(() => safeExec(this, 'moveColumns', -1));
      later(
        () => safeExec(this, 'removeUnnecessaryColumns', 'left'),
        this.get('workspace.animationTime')
      );
    }
  },

  /**
   * Replaces oldColumn with newColumn
   * @param {Utils/GroupHierarchyVisualiser/Column} oldColumn
   * @param {Utils/GroupHierarchyVisualiser/Column} newColumn
   * @returns {undefined}
   */
  replaceColumn(oldColumn, newColumn) {
    const columns = this.get('columns');
    const oldColumnIndex = columns.indexOf(oldColumn);
    this.replaceColumnObject(oldColumnIndex, newColumn);

    // Depending on relationType, clear all left/right columns starting from
    // oldColumnIndex
    let relationType = get(newColumn, 'relationType');
    if (relationType === 'empty') {
      relationType = get(oldColumn, 'relationType');
    }
    switch (relationType) {
      case 'parents':
        for (let i = oldColumnIndex - 1; i >= 0; i--) {
          this.replaceColumnObject(i, Column.create());
        }
        break;
      case 'children':
        for (let i = oldColumnIndex + 1, l = get(columns, 'length'); i < l; i++) {
          this.replaceColumnObject(i, Column.create());
        }
        break;
    }
  },

  /**
   * Moves all columns by `byNColumns` columns
   * @param {number} byNColumns
   * @returns {undefined}
   */
  moveColumns(byNColumns) {
    const column = this.get('columns').objectAt(0);
    if (column) {
      set(column, 'x', get(column, 'x') + byNColumns * get(column, 'width'));
    }
  },

  /**
   * Removes columns, that exceed allowed number of columns
   * @param {boolean} mode possible values:
   *   * `right` - removes columns right-to-left,
   *   * `left` - removes columns left-to-right,
   *   * `emptyFirst` - removes left empty columns and then columns right-to-left
   * @returns {undefined}
   */
  removeUnnecessaryColumns(mode = 'right') {
    const columns = this.get('columns');
    while (get(columns, 'length') > this.get('workspace.columnsNumber')) {
      switch (mode) {
        case 'right':
          columns.popObject();
          break;
        case 'left':
          columns.shiftObject();
          break;
        case 'emptyFirst':
          if (get(columns.objectAt(0), 'groupBoxes.length') === 0) {
            columns.shiftObject();
          } else {
            columns.popObject();
          }
          break;
      }
    }
  },

  /**
   * Removes columns, that are outside screen after window resize
   * @returns {undefined}
   */
  removeColumnsAfterResize() {
    this.removeUnnecessaryColumns('emptyFirst');
  },

  /**
   * Adds columns to satisfy allowed number of columns
   * @returns {undefined}
   */
  addMissingColumns() {
    const columns = this.get('columns');
    const availableColNum = get(columns, 'length');
    for (let i = availableColNum; i < this.get('workspace.columnsNumber'); i++) {
      const column = Column.create({
        workspace: this.get('workspace'),
        relationType: 'empty',
      });
      this.createdColumnsSet.add(column);
      columns.pushObject(column);
    }
  },

  /**
   * @private
   */
  replaceColumnObject(index, newColumn) {
    const columns = this.columns;
    this.createdColumnsSet.add(newColumn);
    this.createdColumnsSet.delete(columns[index]);
    columns[index].destroy();
    columns.replace(index, 1, [newColumn]);
  },
});
