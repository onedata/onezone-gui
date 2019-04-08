/**
 * Modal that controls and shows status of WebSocket reconnection attempts
 * 
 * @module comopnents/websocket-reconnection-modal
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { ReconnectorState } from 'onezone-gui/services/onedata-websocket-error-handler';
import { inject as service } from '@ember/service';
import { reads, gt } from '@ember/object/computed';
import { computed, observer } from '@ember/object';
import { Promise } from 'rsvp';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import I18n from 'onedata-gui-common/mixins/components/i18n';

/**
 * Maps: state number => state name (eg. 2 => connecting) of ReconnectorState
 */
const stateNames = Object.keys(ReconnectorState).reduce((prev, key) => {
  prev[ReconnectorState[key]] = key;
  return prev;
}, {});

export default Component.extend(I18n, {
  onedataWebsocketErrorHandler: service(),
  globalNotify: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.websocketReconnectionModal',

  /**
   * @type {Location}
   */
  _location: location,

  /**
   * Number of automatic (scheduled) reconnect attempt; resetted on modal show.
   * @type {Number}
   */
  currentAttempt: 0,

  /**
   * Max numbers of automatic reconnect attempts, after which reconnection
   * will be invoked only with button.
   * @type {Number}
   */
  maxAttempts: 10,

  /**
   * Last error thrown by connection method. Currently not used.
   * @type {any}
   */
  lastError: null,

  /**
   * How many seconds longer each attempt should wait relative to previous.
   * @type {Number}
   */
  secondsIncrement: 5,

  /**
   * Current state of seconds counter.
   * @type {Number}
   */
  secondsRemaining: 0,

  /**
   * Id of `setInterval` loop for connection attempts
   * @type {Number|null}
   */
  attemptInterval: null,

  /**
   * @type {number}
   */
  reconnectorState: reads('onedataWebsocketErrorHandler.reconnectorState'),

  /**
   * @type {boolean}
   */
  opened: gt('reconnectorState', ReconnectorState.init),

  /**
   * Name of ReconnectorState, eg. closed, init, waiting, connecting, timeout,
   * error.
   * @type {string}
   */
  state: computed('reconnectorState', function state() {
    return stateNames[this.get('reconnectorState')];
  }),

  /**
   * Starts reconnection procedure when external `reconnectorState` changes
   */
  watchInitState: observer('reconnectorState', function watchInitState() {
    if (this.get('reconnectorState') === ReconnectorState.init) {
      this.open();
    }
  }),

  init() {
    this._super(...arguments);
    // activate observers
    this.get('reconnectorState');
  },

  startNextAttempt() {
    clearInterval(this.get('attemptInterval'));
    this.set('attemptInterval', null);
    this.incrementProperty('currentAttempt');
    return this.reconnectAttempt();
  },

  manualAttempt() {
    return this.reconnectAttempt();
  },

  reconnectSuccess() {
    this.close();
    this.get('globalNotify').success(this.t('connectedSuccessfully'));
  },

  /**
   * Use this method to cause modal to open, reset counters and start
   * reconnection procedure.
   * @returns {undefined}
   */
  open() {
    safeExec(this, 'setProperties', {
      lastError: null,
      currentAttempt: 0,
      secondsRemaining: 0,
    });
    this.startNextAttempt();
  },

  /**
   * Use this method to change global state and close the modal.
   * @returns {undefined}
   */
  close() {
    this.setReconnectorState(ReconnectorState.closed);
  },

  /**
   * Hook invoked when reconnection fails.
   * @param {any} error 
   * @returns {undefined}
   */
  reconnectFailure(error) {
    const {
      currentAttempt,
      maxAttempts,
      globalNotify,
    } = this.getProperties('currentAttempt', 'maxAttempts', 'globalNotify');
    globalNotify.warning(this.t('connectionFailed'));
    safeExec(this, 'set', 'lastError', error);
    if (currentAttempt >= maxAttempts) {
      this.set('currentAttempt', maxAttempts);
      this.setReconnectorState(ReconnectorState.timeout);
    } else {
      this.setReconnectorState(ReconnectorState.waiting);
      this.scheduleNextAttempt();
    }
  },

  /**
   * Schedule next waiting time for reconnection attempt.
   * @returns {undefined}
   */
  scheduleNextAttempt() {
    const currentAttempt = this.get('currentAttempt');
    const attemptSeconds = this.get('secondsIncrement') * currentAttempt;
    this.set('secondsRemaining', attemptSeconds);
    const attemptInterval = setInterval(() => {
      const secondsRemainig = this.get('secondsRemaining');
      if (secondsRemainig <= 1) {
        this.startNextAttempt();
      } else {
        this.decrementProperty('secondsRemaining');
      }
    }, 1000);
    this.set('attemptInterval', attemptInterval);
  },

  /**
   * Set global reconnector state.
   * @param {Number} reconnectorState 
   * @returns {Number} the set state
   */
  setReconnectorState(reconnectorState) {
    return safeExec(
      this,
      'set',
      'onedataWebsocketErrorHandler.reconnectorState',
      reconnectorState
    );
  },

  /**
   * Start reconnection procedure
   * @returns {Promise} resolves wher reconnected sucessfully
   */
  reconnectAttempt() {
    this.setReconnectorState(ReconnectorState.connecting);
    return this.get('onedataWebsocketErrorHandler').reconnect()
      .then(() => {
        this.reconnectSuccess();
      })
      .catch(error => {
        this.reconnectFailure(error);
        throw error;
      });
  },

  actions: {
    connectNow() {
      if (this.get('reconnectorState') === ReconnectorState.timeout) {
        return this.manualAttempt();
      } else {
        return this.startNextAttempt();
      }
    },
    reload() {
      return new Promise(() => {
        this.get('_location').reload();
      });
    },
  },
});
