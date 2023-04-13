/**
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import StaticGraphModelMixin from 'onedata-gui-websocket-client/mixins/models/static-graph-model';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { entityType as userEntityType } from 'onezone-gui/models/user';
import { assert } from '@ember/debug';

export const aspect = 'space_membership_requests';

export function generateGri(userId) {
  assert('spaceMembershipRequestsInfo GRI needs a userId to be generated', userId);
  return gri({
    entityType: userEntityType,
    entityId: userId,
    aspect,
    scope: 'auto',
  });
}

/**
 * @typedef {Object} SpaceMembershipRequestInfo
 * @property {string} requestId
 * @property {string} contactEmail
 * @property {number} lastActivity Timestamp in seconds of last activity in membership
 *   request handling. Can be time when requester sent the request or time when space
 *   maintainer rejected the request.
 */

/**
 * @typedef {Object<string, SpaceMembershipRequestInfo>} SpaceMembershipRequestsMap
 * Keys are space entity IDs.
 * Values are information about request made for the space.
 */

export default Model.extend(GraphSingleModelMixin, {
  /**
   * @type {ComputedProperty<SpaceMembershipRequestsMap>}
   */
  pending: attr('object'),

  /**
   * @type {ComputedProperty<SpaceMembershipRequestsMap>}
   */
  rejected: attr('object'),
}).reopenClass(StaticGraphModelMixin);
