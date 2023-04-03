/**
 * @author Michał Borzęcki
 * @copyright (C) 2019-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import { hasMany } from 'onedata-gui-websocket-client/utils/relationships';
import StaticGraphModelMixin from 'onedata-gui-websocket-client/mixins/models/static-graph-model';
import GraphListModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-list-model';

export default Model.extend(GraphListModelMixin, {
  list: hasMany('linkedAccount'),
}).reopenClass(StaticGraphModelMixin);
