/**
 * @module models/provider-list
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import { hasMany } from 'onedata-gui-websocket-client/utils/relationships';
import listConflictModel from 'onedata-gui-websocket-client/mixins/models/list-conflict-model';

export default Model.extend(listConflictModel, {
  list: hasMany('provider'),
});
