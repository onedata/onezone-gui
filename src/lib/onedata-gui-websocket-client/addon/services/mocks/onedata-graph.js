/**
 * Mock of Onedata Websocket WebSocket API - Graph level service
 *
 * @module services/mocks/onedata-graph
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Evented from '@ember/object/evented';
import { Promise } from 'rsvp';
import Service from '@ember/service';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';

const messageNotSupported = Object.freeze({
  success: false,
  error: { id: 'notSupported' },
  data: {},
});

const responseDelay = 100;

export default Service.extend(Evented, {
  /**
   * @param {string} gri
   * @param {string} operation one of: get, update, delete
   * @param {object} data
   * @param {[String,String]} authHint [HintType, Id of subject]
   * @param {string} [subscribe=false]
   * @returns {Promise<object, object>} resolves with Onedata Graph resource
   *   (typically record data)
   */
  request({
    gri,
    operation,
    data,
    authHint,
    // TODO: change to true if backend will be done
    subscribe = false,
  }) {
    console.debug(
      `Mock Graph request:
    - gri: ${gri},
    - operation: ${operation},
    - authHint: ${JSON.stringify(authHint || null)},
    - data: ${JSON.stringify(data || null)},
    - subscribe: ${subscribe}`
    );

    const response = this.response({
      gri,
      operation,
      data,
      authHint,
      subscribe,
    });

    if (response.success) {
      return new Promise(resolve => {
        setTimeout(() => resolve(response), responseDelay);
      });
    } else {
      return Promise.reject(response);
    }
  },

  response({
    gri,
    operation,
    data,
    authHint,
  }) {
    const {
      entityType,
      entityId,
      aspect,
    } = parseGri(gri);
    const handler = this.get(`handlers.${entityType}.${aspect}`);
    if (handler) {
      return handler(operation, entityId, data, authHint);
    } else {
      return messageNotSupported;
    }
  },

  handlers: Object.freeze({
    space: {
      invite_provider_token(operation, /* spaceId, data, authHint*/ ) {
        if (operation === 'create') {
          return {
            success: true,
            data: randomToken(),
          };
        } else {
          return messageNotSupported;
        }
      },
    },
  }),
});

const exampleToken =
  'MDAxNWxvY2F00aW9uIG9uZXpvbmUKMDAzYmlkZW500aWZpZXIgM2E00NGx2bUM00cW5VcHAtSGx3X2NIZFhGT2ZJWXAwdG5Td1V5UEJ2LWtEMAowMDI4Y2lkIHRva2VuVHlwZSA9IHNwYWNlX3N1cHBvcnRfdG9rZW4KMDAyZnNpZ25hdHVyZSA6OiqbyenXe005Y4hXgbOYHgatNArPXTBCq01c4igkMrfAo';

/**
 * @returns {string}
 */
function randomToken() {
  const randInt = Math.floor(Math.random() * 10000);
  return exampleToken + randInt;
}
