/**
 * Unpack string with error from backend rejected request
 *
 * @module utils/get-error-description
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { htmlSafe } from '@ember/string';
import Ember from 'ember';

const i18nPrefix = 'errors.backendErrors.';

/**
 * Gets error details from error object that is returned on websocket backend
 * reject.
 *
 * @export
 * @param {object} error
 * @param {object} i18n
 * @return {Ember.String.htmlSafe}
 */
export default function getErrorDescription(error, i18n) {
  const errorId = error.id;
  let message;

  if (typeof error === 'object' && error.id) {
    message = i18n.t(i18nPrefix + errorId, error.details);
  } else {
    try {
      message = JSON.stringify(error);
    } catch (e) {
      if (!(e instanceof TypeError)) {
        throw error;
      }
    }
  }

  return htmlSafe(Ember.Handlebars.Utils.escapeExpression(message));
}
