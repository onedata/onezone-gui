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

export const aspect = 'space_membership_requests';

export function generateGri(userId) {
  return gri({
    entityType: userEntityType,
    entityId: userId,
    aspect,
    scope: 'private',
  });
}

/**
 * @typedef {Object} UserSpaceMembershipRequestsMap
 * @property {SpaceMembershipRequestsMap} pending
 * @property {SpaceMembershipRequestsMap} rejected
 */

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
 * Values are
 */

export default Model.extend(GraphSingleModelMixin, {
  /**
   * @type {ComputedProperty<UserSpaceMembershipRequestsMap>}
   */
  requestPerSpace: attr('object'),
}).reopenClass(StaticGraphModelMixin);
