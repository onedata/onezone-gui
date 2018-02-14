/**
 * Functions to generate shell commands that are presented to user 
 *
 * @module utils/generate-shell-command
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

function _onezoneUrl(windowLocation = window.location) {
  let protocol = windowLocation.protocol;
  let prefix = `${protocol}//${windowLocation.host}`;
  let port = windowLocation.port;
  let suffix = (port &&
    !(protocol === 'http' && port === 80) &&
    !(protocol === 'https' && port === 443)
  ) ? `:${port}` : '';
  return `${prefix}${suffix}`;
}

function _curlCommand(url, token, suffix = '') {
  if (!url || !token) {
    return undefined;
  }
  token = token.replace(/'/g, '\\\'');
  let onezoneUrl = _onezoneUrl().replace(/'/g, '\\\'');
  return `curl ${url} | sh -s '${onezoneUrl}' '${token}' ${suffix}`;
}

const GENERATORS = {
  onedatify({ token }) {
    return _curlCommand('https://get.onedata.org/onedatify.sh', token);
  },
  oneprovider({ token }) {
    return _curlCommand('https://get.onedata.org/onedatify.sh', token, 'noimport');
  },
};

/**
 * Generates string with shell command for user to copy
 * @param {string} type one of: onedatify, oneprovider
 * @param {object} options depends on command, but typically: token: string
 * @returns {string|undefined}
 */
export default function generateShellCommand(type, options = {}) {
  let fun = GENERATORS[type];
  if (fun) {
    return fun(options);
  } else {
    console.warn('Unknown shell command generator type: ' + type);
    return undefined;
  }
}
