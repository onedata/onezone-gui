/**
 * @module models/space
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import _ from 'lodash';

import GraphModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-model';
import InvitingModelMixin from 'onedata-gui-websocket-client/mixins/models/inviting-model';
import gri from 'onedata-gui-websocket-client/utils/gri';

export default Model.extend(GraphModelMixin, InvitingModelMixin, {
  onedataGraph: inject(),

  name: attr('string'),

  /**
   * Maps: provider name => capacity in bytes provided for this space
   * @type {Object}
   */
  supportSizes: attr('object'),

  providerList: belongsTo('providerList'),

  groupList: belongsTo('groupList'),

  // members of this space
  sharedUserList: belongsTo('sharedUserList'),
  sharedGroupList: belongsTo('sharedGroupList'),

  //#region utils

  totalSize: computed('supportSizes', function getTotalSize() {
    return _.sum(_.values(this.get('supportSizes')));
  }),

  //#endregion

  //#region graph operations

  /**
   * @param {string} target one of: user, group, provider
   * @return {Promise} GRI request
   */
  getInvitationToken(target) {
    const entityId = this.get('entityId');
    return this.get('onedataGraph').request({
      gri: gri({
        entityType: 'space',
        entityId,
        aspect: `invite_${target}_token`,
      }),
      operation: 'create',
    });
  },

  //#endregion
});
