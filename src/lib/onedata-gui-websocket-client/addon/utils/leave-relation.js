/**
 * Deletes a relation between two models
 *
 * @module utils/leave-relation
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import gri from 'onedata-gui-websocket-client/utils/gri';

/**
 * 
 * @param {services/OnedataGraph} onedataGraph 
 * @param {string} entityType
 * @param {string} entityId
 * @param {string} aspect
 * @param {string} aspectId
 * @return {Promise}
 */
export default function leaveRelation(
  onedataGraph, entityType, entityId, aspect, aspectId
) {
  return onedataGraph.request({
    gri: gri({
      entityType,
      entityId,
      aspect,
      aspectId,
      scope: 'private',
    }),
    operation: 'delete',
  });
}
