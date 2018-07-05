/**
 * Creates a relation between model specified by invitation token
 * and model specified by authHint
 *
 * @module utils/join-relation
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import gri from 'onedata-gui-websocket-client/utils/gri';

/**
 * @param {services/OnedataGraph} onedataGraph 
 * @param {string} entityType Entity type of model specified by token
 * @param {string} token invitation token
 * @param {[string, string]} authHint
 * @return {Promise}
 */
export default function joinRelation(onedataGraph, entityType, token, authHint) {
  return onedataGraph.request({
    gri: gri({
      entityType,
      aspect: 'join',
      scope: 'private',
    }),
    operation: 'create',
    data: {
      token,
    },
    authHint,
  });
}
