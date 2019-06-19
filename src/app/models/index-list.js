/**
 * @module models/index-list
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import { hasMany } from 'onedata-gui-websocket-client/utils/relationships';
import listConflictModel from 'onedata-gui-websocket-client/mixins/models/list-conflict-model';
import GraphListModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-list-model';

export default Model.extend(GraphListModelMixin, listConflictModel, {
  list: hasMany('index'),
});
