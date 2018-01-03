/**
 * Validates data returned by getLoginEndpoint from backend.
 *
 * @module utils/validate-get-login-endpoint
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 * 
 * @returns {boolean} true if data is valid (can be used)
 */
export default function validateGetLoginEndpoint({ method, url, formData }) {
  return !!((method === 'get' || (method === 'post' && typeof(formData) === 'object')) && url);
}
