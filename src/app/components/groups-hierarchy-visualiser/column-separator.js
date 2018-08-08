/**
 * Draws column separator in groups hierarchy visualise using data available
 * through `separator` property. 
 *
 * @module components/groups-hierarchy-visualiser/column-separator
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  classNames: ['column-separator'],
  attributeBindings: ['style'],

  /**
   * Separator definition
   * @type {Utils/GroupHierarchyVisualiser/ColumnSeparator}
   * @virtual
   */
  separator: undefined,

  /**
   * @type {Ember.ComputedProperty<SafeString>}
   */
  style: computed('separator.lineX', function style() {
    return htmlSafe(`left: ${this.get('separator.lineX')}px;`);
  }),
});
