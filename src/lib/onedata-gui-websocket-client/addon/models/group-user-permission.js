/**
 * A set of single group permissions for a single user
 * 
 * @module models/group-user-permission
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2016-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import permissionModelFactory from 'onedata-gui-websocket-client/utils/permission-model-factory';
import FLAG_NAMES from 'onedata-gui-websocket-client/utils/group-permissions-flags';

export default Model.extend(
  permissionModelFactory(FLAG_NAMES, 'group', 'systemUser')
);
