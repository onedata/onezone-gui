/**
 * Construct a GRI for current user with given entity ID (which we can get from
 * session data)
 *
 * @module utils/user-gri
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import gri from 'onedata-gui-websocket-client/utils/gri';

export default function userGri(userId) {
  return gri('user', userId, 'instance', 'protected');
}
