/**
 * Unpack string with error from backend rejected request
 *
 * @module utils/get-error-description
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { htmlSafe, isHTMLSafe } from '@ember/string';
import Ember from 'ember';

const i18nPrefix = 'errors.backendErrors.';

/**
 * Gets error details from error object that is returned on websocket backend
 * reject.
 *
 * @export
 * @param {object} error
 * @param {object} i18n
 * @return {object}
 */
export default function getErrorDescription(error, i18n) {
  const errorId = error.id;
  let message;
  let errorJson;

  if (typeof error === 'object' && error.id) {
    message = i18n.t(i18nPrefix + errorId, error.details);
    if (message.toString().startsWith('<missing-')) {
      message = undefined;
    }
    try {
      errorJson = JSON.stringify(error);
    } catch (e) {
      errorJson = undefined;
    }
  } else if (isHTMLSafe(error)) {
    message = error;
  } else {
    try {
      errorJson = JSON.stringify(error);
    } catch (e) {
      if (!(e instanceof TypeError)) {
        throw error;
      }
    }
  }
  message = message ?
    htmlSafe(Ember.Handlebars.Utils.escapeExpression(message)) : undefined;
  errorJson = errorJson ?
    htmlSafe(`<code>${Ember.Handlebars.Utils.escapeExpression(errorJson)}</code>`) :
    undefined;
  return {
    message,
    errorJsonString: errorJson,
  };
}
