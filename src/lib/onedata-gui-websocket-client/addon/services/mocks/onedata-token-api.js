/**
 * Development implementation of `service:token-api` without usage of backend
 *
 * @module services/mocks/onedata-token-api
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';

export default Service.extend({
  getInviteToken(inviterType, inviterEntityId, receiverType) {
    return Promise.resolve(`token-${inviterType}-${inviterEntityId}-${receiverType}`);
  },
});
