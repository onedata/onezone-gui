/**
 * Extends generic OnedataWebsocketErrorHandler with reconnector GUI support.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OnedataWebsocketErrorHandler from 'onedata-gui-websocket-client/services/onedata-websocket-error-handler';
import ReconnectingWebsocketErrorHandlerMixin from 'onedata-gui-common/mixins/reconnecting-websocket-error-handler';

export default OnedataWebsocketErrorHandler.extend(
  ReconnectingWebsocketErrorHandlerMixin,
);
