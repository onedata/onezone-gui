/**
 * Workspace implementation for groups hierarchy visualiser. It contains values,
 * that are related to environment only.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed } from '@ember/object';

export default EmberObject.extend({
  /**
   * Width of the visualiser component
   * @type {number}
   * @virtual
   */
  width: undefined,

  /**
   * Height of the visualiser component
   * @type {number}
   * @virtual
   */
  height: undefined,

  /**
   * String used to filter groups
   * @type {string}
   * @virtual
   */
  searchString: '',

  /**
   * Minimum column width
   * @type {number}
   */
  minColumnWidth: 350,

  /**
   * Width of the group box
   * @type {number}
   */
  groupBoxWidth: 230,

  /**
   * Height of the group box
   * @type {number}
   */
  groupBoxHeight: 45,

  /**
   * Size of the space between relative groups boxes
   * @type {number}
   */
  groupBoxGap: 10,

  /**
   * Width of lines, which connect boxes
   * @type {number}
   */
  lineWidth: 2,

  /**
   * Animations time in ms
   * @type {number}
   */
  animationTime: 300,

  /**
   * Minimum column width for the special case of one-column layout
   * (usually a mobile view)
   * @type {Ember.ComputedProperty<number>}
   */
  minColumnWidthForOneColumnLayout: computed(
    'groupBoxWidth',
    'minColumnWidth',
    function minColumnWidthForOneColumnLayout() {
      const {
        groupBoxWidth,
        minColumnWidth,
      } = this.getProperties(
        'groupBoxWidth',
        'minColumnWidth'
      );
      return Math.min(groupBoxWidth + 40, minColumnWidth);
    }
  ),

  /**
   * Number of columns
   * @type {Ember.ComputedProperty<number>}
   */
  columnsNumber: computed(
    'width',
    'minColumnWidth',
    'minColumnWidthForOneColumnLayout',
    function columnsNumber() {
      const {
        width,
        minColumnWidth,
        minColumnWidthForOneColumnLayout,
      } = this.getProperties(
        'width',
        'minColumnWidth',
        'minColumnWidthForOneColumnLayout'
      );
      if (width) {
        const columns = Math.floor(width / minColumnWidth);
        if (columns) {
          return columns;
        } else {
          return width > minColumnWidthForOneColumnLayout ? 1 : 0;
        }
      } else {
        return 0;
      }
    }
  ),

  /**
   * Width of a column
   * @type {Ember.ComputedProperty<number>}
   */
  columnWidth: computed('width', 'columnsNumber', function columnWidth() {
    const {
      width,
      columnsNumber,
    } = this.getProperties('width', 'columnsNumber');
    return ((width || 0) + 1) / (columnsNumber || 1);
  }),

  /**
   * Vertical padding of the workspace
   * @type {Ember.ComputedProperty<number>}
   */
  verticalPadding: computed('groupBoxGap', function verticalPadding() {
    return this.get('groupBoxGap') * 3;
  }),
});
