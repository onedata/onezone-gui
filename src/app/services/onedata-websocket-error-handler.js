/**
 * Handles WebSocket errors with graphical components (which use global state).
 *
 * @author Jakub Liput
 * @copyright (C) 2019-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OnedataWebsocketErrorHandler from 'onedata-gui-websocket-client/services/onedata-websocket-error-handler';
import {
  GOING_AWAY,
} from 'onedata-gui-websocket-client/utils/websocket-close-event-codes';
import { inject as service } from '@ember/service';

export const ReconnectorState = Object.freeze({
  closed: 0,
  init: 1,
  connecting: 2,
  waiting: 3,
  timeout: 4,
  error: 5,
});

export default OnedataWebsocketErrorHandler.extend({
  session: service(),

  /**
   * Global state accessible by reconnector.
   * Set in init.
   * @type {number}
   */
  reconnectorState: undefined,

  /**
   * Global variable accessible by reconnection modal: CloseEvent of WebSocket.
   * Set in init.
   * @type {CloseEvent}
   */
  currentCloseEvent: undefined,

  /**
   * Global variable accessible by reconnection modal: was WebSocket opened
   * before close?
   * Set in init.
   * @type {boolean}
   */
  currentOpeningCompleted: undefined,

  init() {
    this._super(...arguments);
    this.resetState();
  },

  /**
   * @override
   * @param {CloseEvent} closeEvent
   * @param {boolean} openingCompleted
   */
  abnormalClose(closeEvent, openingCompleted) {
    console.warn(
      `service:onedata-websocket-error-handler#abnormalClose: Onezone WS close not invoked by user, code: ${closeEvent.code}, WS was ${openingCompleted ? 'opened' : 'NOT opened'}`
    );
    if (closeEvent && closeEvent.code === GOING_AWAY) {
      console.debug(
        'service:onedata-websocket-error-handler#abnormalClose: GOING_AWAY code, ignoring'
      );
    } else {
      const reconnectorState = this.get('reconnectorState');
      if (reconnectorState === ReconnectorState.closed) {
        this.set('reconnectorState', ReconnectorState.init);
      }
      this.setProperties({
        currentCloseEvent: closeEvent,
        currentOpeningCompleted: openingCompleted,
      });
    }
  },

  /**
   * @override
   */
  reconnect() {
    const isAuthenticated = this.get('session.isAuthenticated');
    return this.forceCloseConnection()
      .then(() =>
        this.initWebSocketConnection(isAuthenticated ? 'authenticated' : 'anonymous')
      );
  },

  resetState() {
    this.setProperties({
      reconnectorState: ReconnectorState.closed,
      currentCloseEvent: null,
      currentOpeningCompleted: null,
    });
  },
});
