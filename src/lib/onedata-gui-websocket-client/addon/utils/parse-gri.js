/**
 * Destructure GRI string into parts 
 *
 * @module utils/parse-gri
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @function
 * @param {string} griValue
 * @returns {Object} contains strings with GRI parts
 */
export default function (griValue) {
  let m = griValue.match(/(.*)\.(.*)\.([^:]*):?(.*)?/);
  if (!m) {
    throw new Error('util:gri#parseGri: unparsable gri: ' + griValue);
  }
  return {
    entityType: m[1],
    entityId: m[2],
    aspect: m[3],
    scope: m[4],
  };
}
