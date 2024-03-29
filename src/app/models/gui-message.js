/**
 * GUI message model.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import StaticGraphModelMixin from 'onedata-gui-websocket-client/mixins/models/static-graph-model';

export default Model.extend(GraphSingleModelMixin, {
  /**
   * @type {boolean}
   */
  enabled: attr('boolean'),

  /**
   * @type {Object}
   */
  body: attr('string'),
}).reopenClass(StaticGraphModelMixin);
