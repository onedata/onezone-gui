/**
 * Returns id for passed record, that can be used for routing purposes
 * (inside link-to helper, transitionTo function, etc).
 *
 * @module utils/model-routable-id
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get } from '@ember/object';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';

/**
 * @param {object|string} record 
 * @returns {string}
 */
export default function modelRoutableId(record) {
  let entityId = null;
  record = record || {};
  const recordId = typeof record === 'string' ? record : get(record, 'id');
  try {
    const parsedGri = parseGri(recordId);
    // client_token is treated exceptionally because it has 
    // non standard record representation provided by backend
    entityId = parsedGri.aspect === 'client_token' ?
      parsedGri.aspectId : parsedGri.entityId;
  } catch (err) {
    return null;
  }
  return entityId;
}
