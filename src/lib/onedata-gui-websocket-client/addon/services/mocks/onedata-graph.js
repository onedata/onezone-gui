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
      return Promise.resolve(response);
    } else {
      return Promise.reject(response);
    }
  },

  response() {
    return {
      success: false,
      error: { id: 'notSupported' },
      data: {},
    };
  },

  // FIXME: implement mocked graph responses
  // response({
  //   gri,
  //   operation,
  //   data,
  //   authHint,
  //   subscribe = false,
  // }) {
  //   const persistence = this.get('persistence');
  //   const griData = parseGri(gri);
  //   const {
  //     success,
  //     responseData,
  //   } = _.find(persistence, griData);
  //   (success ? Promise.resolve : Promise.reject)(responseData);
  // },
});
