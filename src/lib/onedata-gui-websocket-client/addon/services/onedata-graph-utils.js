/**
 * Additional util functions related to onedata-graph
 *
 * @module services/onedata-graph-utils
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import gri from 'onedata-gui-websocket-client/utils/gri';

export default Service.extend({
  onedataGraph: service(),

  /**
   * Creates a relation between model specified by invitation token
   * and model specified by authHint
   * @param {string} entityType Entity type of model specified by token
   * @param {string} token invitation token
   * @param {[string, string]} authHint
   * @return {Promise}
   */
  joinRelation(entityType, token, authHint) {
    return this.get('onedataGraph').request({
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
  },

  /**
   * Deletes a relation between two models
   * @param {string} entityType
   * @param {string} entityId
   * @param {string} aspect
   * @param {string} aspectId
   * @return {Promise}
   */
  leaveRelation(entityType, entityId, aspect, aspectId) {
    return this.get('onedataGraph').request({
      gri: gri({
        entityType,
        entityId,
        aspect,
        aspectId,
        scope: 'private',
      }),
      operation: 'delete',
    });
  },
});
