/**
 * Index stats model
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import StaticGraphModelMixin from 'onedata-gui-websocket-client/mixins/models/static-graph-model';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';

export default Model.extend(GraphSingleModelMixin, {
  /**
   * @type {Object}
   *
   * Object in format:
   * ```
   * {
   *   space1Id: {
   *     provider1Id: {
   *       currentSeq: number, // (currentSeq / maxSeq) * 100 = progress in %
   *       maxSeq: number,
   *       lastUpdate: number, // last index update timestamp
   *       error: string | null, // last operation error
   *       archival: boolean,
   *     },
   *     provider2Id: {...},
   *     ...
   *   },
   *   space2Id: {...},
   *   ...
   * }
   * ```
   */
  indexStats: attr('object'),
}).reopenClass(StaticGraphModelMixin);
