/**
 * A component that shows information about support size using table and chart.
 *
 * @module components/support-size-info
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import _ from 'lodash';
import layout from 'onedata-gui-common/templates/components/support-size-info';

const {
  computed,
  A,
} = Ember;

export default Ember.Component.extend({
  layout,
  classNames: ['support-size-info'],

  /**
   * Data to display.
   * To inject.
   * @type Ember.Array.PieChartSeries
   */
  data: null,

  /**
   * Header text.
   * To inject.
   * @type {string}
   */
  header: '',

  /**
   * Tip for header in `chart` mode.
   * @type {string}
   */
  chartHeaderTip: '',

  /**
   * Tip for header in `table` mode.
   * @type {string}
   */
  tableHeaderTip: '',

  /**
   * Title for supporter name table column.
   * To inject.
   * @type {string}
   */
  supporterNameHeader: '',

  /**
   * Message, that is shown when there is no data
   * @type {string}
   */
  noDataToShowMessage: '',

  /**
   * Component mode. `chart` or `table`
   * @type {string}
   */
  mode: 'chart',

  /**
   * If true, header tip is visible.
   * @type {boolean}
   */
  _tipVisible: computed('mode', 'chartHeaderTip', 'tableHeaderTip', function () {
    let {
      mode,
      chartHeaderTip,
      tableHeaderTip,
    } = this.getProperties('mode', 'chartHeaderTip', 'tableHeaderTip');
    return mode === 'chart' ? !!chartHeaderTip : !!tableHeaderTip;
  }),

  /**
   * Data for a table
   * @type {computed.Ember.Array.SupportSizeEntry}
   */
  supportTableData: computed('data', function () {
    let data = this.get('data');
    return A(data.map((series) => Ember.Object.create({
      supporterName: series.get('label'),
      supportSize: series.get('value'),
    })));
  }),

  /**
   * Total size
   * @type {computed.Number}
   */
  totalSize: computed('data.@each.value', function () {
    let data = this.get('data');
    if (data.length === 0) {
      return 0;
    }
    return _.sum(data.map((series) => series.get('value')));
  }),

  actions: {
    modeChanged(mode) {
      this.set('mode', mode);
    },
  },
});