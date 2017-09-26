/**
 * Development implementation of `session-store:ondata-websocket`, does not
 * use backend; see `onedata-websocket-utils-mock` for details
 *
 * @module session-stores/mocks/onedata-websocket
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import BaseSessionStore from 'onedata-gui-websocket-client/session-stores/-base';
import OnedataWebsocketUtilsMock from 'onedata-gui-websocket-client/mixins/onedata-websocket-utils-mock';

export default BaseSessionStore.extend(OnedataWebsocketUtilsMock);
