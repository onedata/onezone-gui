/**
 * @module models/space
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';
import { computed } from '@ember/object';
import _ from 'lodash';

import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import InvitingModelMixin from 'onedata-gui-websocket-client/mixins/models/inviting-model';

export default Model.extend(GraphSingleModelMixin, InvitingModelMixin, {
  name: attr('string'),
  canViewPrivileges: attr('boolean', { defaultValue: false }),

  /**
   * Maps: provider name => capacity in bytes provided for this space
   * @type {Object}
   */
  supportSizes: attr('object'),

  providerList: belongsTo('providerList'),

  // members of this space
  groupList: belongsTo('groupList'),
  userList: belongsTo('sharedUserList'),

  //#region utils

  totalSize: computed('supportSizes', function getTotalSize() {
    return _.sum(_.values(this.get('supportSizes')));
  }),

  //#endregion
});
