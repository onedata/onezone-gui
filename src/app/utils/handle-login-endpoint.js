/**
 * Using authorizer data, redirect to login endpoint
 *
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import browserPost from 'onedata-gui-common/utils/browser-post';
import validateGetLoginEndpoint from 'onezone-gui/utils/validate-get-login-endpoint';

/**
 * @param {object} data the same as resolved by onezoneServer.getLoginEndpoint
 * @param {string} data.method
 * @param {string} data.url
 * @param {object} [data.formData]
 * @param {function} onError function invoked on endpoint data validation error
 * @returns {undefined}
 */
export default function handleLoginEndpoint(data, onError) {
  if (!validateGetLoginEndpoint(data)) {
    if (onError) {
      onError();
    }
  } else {
    const { method, url, formData } = data;
    if (method === 'get') {
      window.location = url;
    } else if (method === 'post') {
      browserPost(url, formData);
    }
  }
}
