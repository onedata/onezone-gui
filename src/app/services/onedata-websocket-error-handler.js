import OnedataWebsocketErrorHandler from 'onedata-gui-websocket-client/services/onedata-websocket-error-handler';

export const ReconnectorState = Object.freeze({
  closed: 0,
  init: 1,
  connecting: 2,
  waiting: 3,
  timeout: 4,
  error: 5,
});

export default OnedataWebsocketErrorHandler.extend({
  /**
   * Global state accessible by reconnector
   * @type {number}
   */
  reconnectorState: ReconnectorState.closed,

  /**
   * @override
   * @param {CloseEvent} closeEvent 
   * @param {boolean} openingCompleted 
   */
  abnormalClose(closeEvent, openingCompleted) {
    console.warn(
      `service:onedata-websocket-error-handler#abnormalClose: Onezone WS close not invoked by user, code: ${closeEvent.code}, WS was ${openingCompleted ? 'opened' : 'NOT opened'}; reconnecting...`
    );
    this.set('reconnectorState', ReconnectorState.init);
  },
});
