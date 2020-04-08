/**
 * Converts data from token-editor in edition mode to object with change diff.
 *
 * @module utils/token-editor-utils/editor-data-to-diff-object
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { getProperties, get } from '@ember/object';

export default function editorDataToDiffObject(editorData, token) {
  const {
    name: newName,
    revoked: newRevoked,
  } = getProperties(get(editorData || {}, 'basic') || {}, 'name', 'revoked');
  const {
    name: oldName,
    revoked: oldRevoked,
  } = getProperties(token || {}, 'name', 'revoked');

  const diffObject = {};

  if ((!oldName || (oldName !== newName)) && newName) {
    diffObject.name = newName;
  }

  if (
    (oldRevoked === undefined || oldRevoked !== newRevoked) &&
    newRevoked !== undefined
  ) {
    diffObject.revoked = newRevoked;
  }

  return diffObject;
}
