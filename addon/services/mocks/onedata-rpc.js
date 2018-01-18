/**
 * Development implementation of `service:onedata-rpc`, mocks RPC responses
 *
 * To mock RPC method, add `__handle_<methodName>` method and return a promise
 * that will resolve with response data or reject with error data.
 *
 * @module services/mocks/onedata-rpc
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { Promise } from 'rsvp';

export default Service.extend({
  /**
   * @param {string} methodName
   * @param {string} args
   * @returns {Promise<object, any>} resolves with method return data
   */
  request(methodName, args = {}) {
    const handler = this.get('__handle_' + methodName);
    if (handler) {
      const handlerResponse = handler(args);
      if (handlerResponse instanceof Promise) {
        return handlerResponse;
      } else {
        throw new Error(
          'service:mocks/onedata-rpc: handler return value is not a Promise: ' +
          methodName
        );
      }
    } else {
      return Promise.reject({
        id: 'badMessage',
        details: {
          message: 'service:mocks/onedata-rpc: No handler for RPC method: ' +
            methodName,
        },
      });
    }
  },

  __handle_testRPC(args = {}) {
    return Promise.resolve(args);
  },

  __handle_getLoginEndpoint( /*idp*/ ) {
    return Promise.resolve({
      method: 'get',
      url: window.location.origin + '/dev_login',
    });
  },

  __handle_getProviderRedirectURL( /*providerId*/ ) {
    return Promise.resolve({
      url: 'http://localhost:4201',
    });
  },
});
