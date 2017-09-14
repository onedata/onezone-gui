/**
 * Construct a GRI (Graph Resource ID for Onedata API) string from needed elements
 *
 * @module utils/gri
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @function gri
 * @param {string} entityType
 * @param {string} [entityId]
 * @param {string} aspect
 * @param {string} [scope] one of: private, protected, public
 * @returns {string}
 */
export default function gri(entityType, entityId, aspect, scope) {
  return `${entityType}.${entityId || 'null'}.${aspect}${scope ? ':' + scope : ''}`;
}
