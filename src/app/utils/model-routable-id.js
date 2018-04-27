/**
 * Returns id for passed model, that can be used for routing purposes
 * (inside link-to helper, transitionTo function, etc).
 *
 * @module utils/model-routable-id
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get } from '@ember/object';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';

/**
 * @param {object|string} model 
 * @returns {string}
 */
export default function modelRoutableId(model) {
  let entityId = null;
  model = model || {};
  const modelId = typeof model === 'string' ? model : get(model, 'id');
  try {
    const parsedGri = parseGri(modelId);
    // client_token is treated exceptionally because it has 
    // non standard model representation provided by backend
    entityId = parsedGri.aspect === 'client_token' ?
      parsedGri.aspectId : parsedGri.entityId;
  } catch (err) {
    return null;
  }
  return entityId;
}
