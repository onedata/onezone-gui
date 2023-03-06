/**
 * Harvester index model
 *
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

export const includeMetadataCorrectValues = [
  'xattrs',
  'json',
  'rdf',
];

export const includeFileDetailsCorrectValues = [
  'fileName',
  'fileType',
  'spaceId',
  'datasetInfo',
  'archiveInfo',
  'metadataExistenceFlags',
];

export default Model.extend(GraphSingleModelMixin, {
  /**
   * @type {String}
   */
  name: attr('string'),

  /**
   * @type {Object}
   */
  schema: attr('string'),

  /**
   * @type {String}
   */
  guiPluginName: attr('string'),

  /**
   * Example: `['xattrs', 'json', 'rdf']`
   * @type {Array<String>}
   */
  includeMetadata: attr('array'),

  /**
   * Example: `[
   *   'fileName',
   *   'fileType',
   *   'spaceId',
   *   'datasetInfo',
   *   'archiveInfo',
   *   'metadataExistenceFlags'
   * ]`
   * @type {Array<String>}
   */
  includeFileDetails: attr('array'),

  /**
   * @type {boolean}
   */
  includeRejectionReason: attr('boolean'),

  /**
   * @type {boolean}
   */
  retryOnRejection: attr('boolean'),

  /**
   * @returns {Promise<Models.IndexStat>}
   */
  getStats() {
    const statsGri = gri(_.assign({ aspect: 'index_stats', scope: 'private' },
      this.getProperties('entityType', 'entityId', 'aspectId')));
    return this.get('store').findRecord('indexStat', statsGri);
  },
}).reopenClass(StaticGraphModelMixin);
