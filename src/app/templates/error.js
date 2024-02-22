/**
 * The Onezone is the top-level application for Onedata iframes stack. If it is embedded
 * as an iframe on the other site, it is blocking non-public routes, so we present
 * special error template to user if the error is about routing.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ApplicationError from 'onedata-gui-common/templates/application-error';
import IframedOnedataError from 'onedata-gui-common/templates/iframed-onedata-error';
import globals from 'onedata-gui-common/utils/globals';

const isInIframe = globals.window.parent !== globals.window;

export default isInIframe ? IframedOnedataError : ApplicationError;
