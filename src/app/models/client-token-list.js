/**
 * @module models/client-token-list
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import { hasMany } from 'onedata-gui-websocket-client/utils/relationships';
import GraphListModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-list-model';
import listConflictModel from 'onedata-gui-websocket-client/mixins/models/list-conflict-model';

export default Model.extend(GraphListModelMixin, listConflictModel, {
  list: hasMany('clientToken'),
});
