/**
 * Model with group permissions list for group.
 * @module models/group-user-list
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import { hasMany } from 'onedata-gui-websocket-client/utils/relationships';

export default Model.extend({
  permissions: hasMany('group-user-permission', { async: true }),
});
