/**
 * Calculates positions of column separator elements. ColumnSeparator is logically
 * inside Column and separates that column from the Column.nextColumn.
 * 
 * Column separator consists of 4 lines:
 *  - top line,
 *  - bottom line,
 *  - central line (only if there is a relation between group boxes in separated
 *    columns),
 *  - hovered line (only if there is a central line and relation between group
 *    boxes is hovered)
 * 
 * Real separator is created using only top and bottom lines. If there is no
 * relation, top and bottom lines are rendered in top/bottom half of the screen
 * and touches in the center. If there is a central line, which is a vertical part
 * of relation line, then top and bottom lines are shorter and covers only those
 * parts of the area, that are not covered by central line. When central line is
 * long enough, top and bottom lines can be even invisible (hidden outside the
 * visible area).
 * 
 * When relation is hovered, hovered line is rendered. It covers up to 100% of
 * central line to connect two group box lines that are in hovered relation.
 * 
 * Separator is column-scroll independent. It is renderer outside column, so is
 * not affected by scroll position. Because of that, separator can be much
 * shorter than the maximum height of separated columns. If H is the available area
 * height, then separator is 3H long (can be 1H, but longer lines are better in 
 * dealing with dynamic window resize), column content can have possibly infinite
 * height.
 *
 * @module utils/groups-hierarchy-visualiser/column-separator
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed, get, getProperties } from '@ember/object';
import { reads, and } from '@ember/object/computed';

export default EmberObject.extend({
  /**
   * @type {Utils/GroupHierarchyVisualiser/Column}
   * @virtual
   */
  column: undefined,

  /**
   * @type {Ember.ComputedProperty<Utils/GroupHierarchyVisualiser/Column>}
   */
  nextColumn: reads('column.nextColumn'),

  /**
   * @type {Ember.ComputedProperty<Utils/GroupHierarchyVisualiser/Workspace>}
   */
  workspace: reads('column.workspace'),

  /**
   * If true, separator has a central line - vertical line that connects
   * group box lines
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasCentralLine: and(
    'column.groupBoxesWithRightLines.length',
    'nextColumn.groupBoxesWithLeftLines.length'
  ),

  /**
   * X position (relative to this column)
   * @type {Ember.ComputedProperty<number>}
   */
  lineX: computed('column.x', 'workspace.columnWidth', function lineX() {
    return this.get('column.x') + this.get('workspace.columnWidth');
  }),

  /**
   * Minimum Y position of all right group box lines of the left (this) column
   * @type {Ember.ComputedProperty<number>}
   */
  groupBoxesRightLinesMinY: computed(
    'hasCentralLine',
    'workspace.lineWidth',
    'column.{groupBoxesWithRightLines.firstObject.rightLine.absoluteY,scrollTop}',
    function groupBoxesRightLinesMinY() {
      const {
        column,
        hasCentralLine,
      } = this.getProperties('column', 'hasCentralLine');
      if (hasCentralLine) {
        return get(column, 'groupBoxesWithRightLines.firstObject.rightLine.absoluteY') -
          get(column, 'scrollTop') + this.get('workspace.lineWidth');
      }
    }
  ),

  /**
   * Maximum Y position of all right group box lines of the left (this) column
   * @type {Ember.ComputedProperty<number>}
   */
  groupBoxesRightLinesMaxY: computed(
    'hasCentralLine',
    'workspace.lineWidth',
    'column.{groupBoxesWithRightLines.lastObject.rightLine.absoluteY,scrollTop}',
    function groupBoxesRightLinesMaxY() {
      const {
        column,
        hasCentralLine,
      } = this.getProperties('column', 'hasCentralLine');
      if (hasCentralLine) {
        return get(column, 'groupBoxesWithRightLines.lastObject.rightLine.absoluteY') -
          get(column, 'scrollTop') + 2 * this.get('workspace.lineWidth');
      }
    }
  ),

  /**
   * Minimum Y position of all left group box lines of the right (next) column
   * @type {Ember.ComputedProperty<number>}
   */
  groupBoxesLeftLinesMinY: computed(
    'hasCentralLine',
    'workspace.lineWidth',
    'nextColumn.{groupBoxesWithLeftLines.firstObject.leftLine.absoluteY,scrollTop}',
    function groupBoxesLeftLinesMinY() {
      const {
        nextColumn,
        hasCentralLine,
      } = this.getProperties('nextColumn', 'hasCentralLine');
      if (hasCentralLine) {
        return get(
          nextColumn,
          'groupBoxesWithLeftLines.firstObject.leftLine.absoluteY'
        ) - get(nextColumn, 'scrollTop') + this.get('workspace.lineWidth');
      }
    }
  ),

  /**
   * Maximum Y position of all left group box lines of the right (next) column
   * @type {Ember.ComputedProperty<number>}
   */
  groupBoxesLeftLinesMaxY: computed(
    'hasCentralLine',
    'workspace.lineWidth',
    'nextColumn.{groupBoxesWithLeftLines.lastObject.leftLine.absoluteY,scrollTop}',
    function groupBoxesLeftLinesMaxY() {
      const {
        nextColumn,
        hasCentralLine,
      } = this.getProperties('nextColumn', 'hasCentralLine');
      if (hasCentralLine) {
        return get(
          nextColumn,
          'groupBoxesWithLeftLines.lastObject.leftLine.absoluteY'
        ) - get(nextColumn, 'scrollTop') + 2 * this.get('workspace.lineWidth');
      }
    }
  ),

  /**
   * Minimum Y position of all group box lines connected to the separator
   * @type {Ember.ComputedProperty<number>}
   */
  lineMinY: computed(
    'groupBoxesLeftLinesMinY',
    'groupBoxesRightLinesMinY',
    function lineMaxY() {
      const {
        groupBoxesLeftLinesMinY,
        groupBoxesRightLinesMinY,
      } = this.getProperties('groupBoxesLeftLinesMinY', 'groupBoxesRightLinesMinY');
      return Math.min(groupBoxesLeftLinesMinY, groupBoxesRightLinesMinY);
    }
  ),

  /**
   * Maximum Y position of all group box lines connected to the separator
   * @type {Ember.ComputedProperty<number>}
   */
  lineMaxY: computed(
    'groupBoxesLeftLinesMaxY',
    'groupBoxesRightLinesMaxY',
    function lineMaxY() {
      const {
        groupBoxesLeftLinesMaxY,
        groupBoxesRightLinesMaxY,
      } = this.getProperties('groupBoxesLeftLinesMaxY', 'groupBoxesRightLinesMaxY');
      return Math.max(groupBoxesLeftLinesMaxY, groupBoxesRightLinesMaxY);
    }
  ),

  /**
   * Top line Y position
   * @type {Ember.ComputedProperty<number>}
   */
  topLineY: computed('workspace.height', function topLineY() {
    return -this.get('workspace.height');
  }),

  /**
   * Top line height
   * @type {Ember.ComputedProperty<number>}
   */
  topLineHeight: computed(
    'hasCentralLine',
    'workspace.{height,groupBoxGap}',
    'lineMinY',
    function topLineHeight() {
      const {
        hasCentralLine,
        workspace,
        lineMinY,
      } = this.getProperties('hasCentralLine', 'workspace', 'lineMinY');
      const {
        height,
        groupBoxGap,
      } = getProperties(workspace, 'height', 'groupBoxGap');
      return hasCentralLine ?
        Math.max(lineMinY - groupBoxGap, 0) + height :
        height * 1.5;
    }
  ),

  /**
   * Central line Y position
   * @type {Ember.ComputedProperty<number>}
   */
  centralLineY: computed('hasCentralLine', 'lineMinY', function centralLineY() {
    return this.get('hasCentralLine') ? this.get('lineMinY') : 0;
  }),

  /**
   * Central line height
   * @type {Ember.ComputedProperty<number>}
   */
  centralLineHeight: computed(
    'hasCentralLine',
    'lineMinY',
    'lineMaxY',
    function centralLineHeight() {
      const {
        hasCentralLine,
        lineMinY,
        lineMaxY,
      } = this.getProperties(
        'hasCentralLine',
        'lineMinY',
        'lineMaxY',
      );
      return hasCentralLine ? lineMaxY - lineMinY : 0;
    }
  ),

  /**
   * Bottom line Y position
   * @type {Ember.ComputedProperty<number>}
   */
  bottomLineY: computed(
    'hasCentralLine',
    'workspace.{height,groupBoxGap}',
    'lineMaxY',
    function bottomLineY() {
      const {
        hasCentralLine,
        workspace,
        lineMaxY,
      } = this.getProperties('hasCentralLine', 'workspace', 'lineMaxY');
      const {
        height,
        groupBoxGap,
      } = getProperties(workspace, 'height', 'groupBoxGap');
      return hasCentralLine ? lineMaxY + groupBoxGap : height / 2;
    }
  ),

  /**
   * Bottom line height
   * @type {Ember.ComputedProperty<number>}
   */
  bottomLineHeight: computed(
    'hasCentralLine',
    'workspace.{height,groupBoxGap}',
    'lineMaxY',
    function bottomLineY() {
      const {
        hasCentralLine,
        workspace,
        lineMaxY,
      } = this.getProperties('hasCentralLine', 'workspace', 'lineMaxY');
      const {
        height,
        groupBoxGap,
      } = getProperties(workspace, 'height', 'groupBoxGap');
      return hasCentralLine ? lineMaxY + groupBoxGap + height : height * 1.5;
    }
  ),

  /**
   * Hovered line specification. Is available only when separator has a central
   * line and there is a relation that is hovered. It connects two hovered
   * group boxes lines.
   * @type {Ember.ComputedProperty<{lineY: number, lineHeight: number}>}
   */
  hoveredLine: computed(
    'hasCentralLine',
    'workspace.lineWidth',
    'nextColumn.{scrollTop,hoveredLeftLineGroupBoxes.firstObject.leftLine.absoluteY,hoveredLeftLineGroupBoxes.lastObject.leftLine.absoluteY}',
    'column.{scrollTop,hoveredRightLineGroupBoxes.firstObject.rightLine.absoluteY,hoveredRightLineGroupBoxes.lastObject.rightLine.absoluteY}',
    function hoveredLine() {
      const {
        hasCentralLine,
        nextColumn,
        column,
        workspace,
      } = this.getProperties(
        'hasCentralLine',
        'nextColumn',
        'column',
        'workspace'
      );
      const {
        hoveredLeftLineGroupBoxes,
        scrollTop: rightScrollTop,
      } = getProperties(nextColumn, 'hoveredLeftLineGroupBoxes', 'scrollTop');
      const {
        hoveredRightLineGroupBoxes,
        scrollTop: leftScrollTop,
      } = getProperties(column, 'hoveredRightLineGroupBoxes', 'scrollTop');
      const lineWidth = get(workspace, 'lineWidth');

      if (
        hasCentralLine &&
        get(hoveredLeftLineGroupBoxes, 'length') &&
        get(hoveredRightLineGroupBoxes, 'length')
      ) {
        const groupBoxesLeftLinesMinY =
          get(hoveredLeftLineGroupBoxes, 'firstObject.leftLine.absoluteY') -
          rightScrollTop;
        const groupBoxesLeftLinesMaxY =
          get(hoveredLeftLineGroupBoxes, 'lastObject.leftLine.absoluteY') -
          rightScrollTop;
        const groupBoxesRightLinesMinY =
          get(hoveredRightLineGroupBoxes, 'firstObject.rightLine.absoluteY') -
          leftScrollTop;
        const groupBoxesRightLinesMaxY =
          get(hoveredRightLineGroupBoxes, 'lastObject.rightLine.absoluteY') -
          leftScrollTop;
        const minY = Math.min(groupBoxesLeftLinesMinY, groupBoxesRightLinesMinY);
        const maxY = Math.max(groupBoxesLeftLinesMaxY, groupBoxesRightLinesMaxY);

        return {
          lineY: minY + lineWidth,
          lineHeight: maxY - minY + lineWidth,
        };
      }
    }
  ),
});
