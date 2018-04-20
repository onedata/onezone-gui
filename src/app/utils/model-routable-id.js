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
  let modelId = typeof model === 'string' ? model : get(model, 'id');
  try {
    if (model) {
      entityId = parseGri(modelId).entityId;
    }
  } catch (err) {
    return null;
  }
  return entityId;
}
