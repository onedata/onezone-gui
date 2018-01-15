/**
 * Converts thenable object returned by `$.ajax` into RSVP.Promise
 *
 * @module utils/xhr-to-promise
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 * 
 * @param {jq promise object} jqPromise eg. returned from `$.ajax`
 * @returns {Promise}
 */

export default function xhrToPromise(jqPromise) {
  return Promise.resolve(jqPromise);
}
