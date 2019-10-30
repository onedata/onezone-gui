/**
 * Harvester index model
 * 
 * @module models/index
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import StaticGraphModelMixin from 'onedata-gui-websocket-client/mixins/models/static-graph-model';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import gri from 'onedata-gui-websocket-client/utils/gri';
import _ from 'lodash';

export default Model.extend(GraphSingleModelMixin, {
  /**
   * @type {string}
   */
  name: attr('string'),

  /**
   * @type {Object}
   */
  schema: attr('string'),

  /**
   * @type {string}
   */
  guiPluginName: attr('string'),

  /**
   * @returns {Promise<models.IndexStat>}
   */
  getStats() {
    const statsGri = gri(_.assign({ aspect: 'index_stats', scope: 'private' },
      this.getProperties('entityType', 'entityId', 'aspectId')));
    return this.get('store').findRecord('indexStat', statsGri);
  },
}).reopenClass(StaticGraphModelMixin);
