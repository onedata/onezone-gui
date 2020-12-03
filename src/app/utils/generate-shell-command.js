/**
 * Functions to generate shell commands that are presented to user 
 *
 * @module utils/generate-shell-command
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

function _onezoneUrl(windowLocation = window.location) {
  return windowLocation.origin.toString();
}

function escapeCommandString(string) {
  return (string || '').replace(/'/g, '\\\'');
}

function _curlCommand(url, supportToken, onezoneRegistrationToken, suffix = '') {
  const onezoneUrl = _onezoneUrl().replace(/'/g, '\\\'');
  return `curl ${url} | sh -s onedatify --onezone-url '${onezoneUrl}' --registration-token '${escapeCommandString(onezoneRegistrationToken)}' --token '${escapeCommandString(supportToken)}'${suffix ? ' ' + suffix : ''}`;
}

const GENERATORS = {
  onedatify({ supportToken, onezoneRegistrationToken }) {
    return _curlCommand(
      'https://get.onedata.org/onedatify.sh',
      supportToken,
      onezoneRegistrationToken,
      '--import'
    );
  },
  oneprovider({ supportToken, onezoneRegistrationToken }) {
    return _curlCommand(
      'https://get.onedata.org/onedatify.sh',
      supportToken,
      onezoneRegistrationToken
    );
  },
};

/**
 * Generates string with shell command for user to copy
 * @param {string} type one of: onedatify, oneprovider
 * @param {object} options depends on command, but typically: token: string
 * @returns {string|undefined}
 */
export default function generateShellCommand(type, options = {}) {
  const fun = GENERATORS[type];
  if (fun) {
    return fun(options);
  } else {
    console.warn('Unknown shell command generator type: ' + type);
    return undefined;
  }
}
