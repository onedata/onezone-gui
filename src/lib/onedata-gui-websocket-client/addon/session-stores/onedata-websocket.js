/**
 * Production implementation of `session-store:onedata-websocket`
 * On each restore, try to use browser session to communicate with server - it
 * will response with session data
 *
 * @module session-stores/onedata-websocket
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import BaseSessionStore from 'onedata-gui-websocket-client/session-stores/-base';
import OnedataWebsocketUtils from 'onedata-gui-websocket-client/mixins/onedata-websocket-utils';

export default BaseSessionStore.extend(OnedataWebsocketUtils);
