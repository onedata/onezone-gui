/**
 * A set of privileges
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import StaticGraphModelMixin from 'onedata-gui-websocket-client/mixins/models/static-graph-model';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';

export default Model.extend(GraphSingleModelMixin, {
  /**
   * It is an array of privileges (as strings).
   * WARNING: It is intended to be an immutable data structure! To persist
   * modifications it must be replaced by a new array.
   */
  privileges: attr('array'),
}).reopenClass(StaticGraphModelMixin);
