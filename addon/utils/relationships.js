/**
 * Default settings of `DS.belongsTo` and `DS.hasMany` for onedata-websocket models
 *
 * @module utils/relationships
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { belongsTo as origBelongsTo, hasMany as origHasMany } from 'ember-data/relationships';

export function belongsTo(modelName) {
  return origBelongsTo(modelName, { async: true, inverse: null });
}

export function hasMany(modelName) {
  return origHasMany(modelName, { async: true, inverse: null });
}
