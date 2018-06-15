/**
 * Construct a GRI (Graph Resource ID for Onedata API) string from needed elements
 *
 * @module utils/gri
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 *
 * @function gri
 * @param {string} entityType
 * @param {string} [entityId]
 * @param {string} aspect
 * @param {string} aspectId
 * @param {string} [scope] one of: private, protected, public
 * @returns {string}
 */
export default function gri() {
  let entityType, entityId, aspect, aspectId, scope;
  if (typeof arguments[0] === 'object') {
    const options = arguments[0];
    entityType = options.entityType;
    entityId = options.entityId;
    aspect = options.aspect;
    aspectId = options.aspectId;
    scope = options.scope;
  } else {
    console.warn('util:gri: you are using an old signature of gri function');
    entityType = arguments[0];
    entityId = arguments[1];
    aspect = arguments[2];
    // aspectId is not supported in old signature
    scope = arguments[3];
  }
  return `${entityType}.${entityId || 'null'}.${aspect}${aspectId ? ',' + aspectId : ''}:${scope ? scope : 'private'}`;
}
