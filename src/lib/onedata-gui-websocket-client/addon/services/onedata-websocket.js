/**
 * Onedata Websocket Sync API - low-level Websocket operation service
 *
 * For mocked service, that does not need backend, see `onedata-websocket`
 *
 * @module services/onedata-websocket
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import _zipObject from 'lodash/zipObject';

const {
  RSVP: { defer },
  computed,
  computed: { readOnly },
  Evented,
  String: { camelize },
  ObjectProxy,
  PromiseProxyMixin,
  RSVP: { Promise },
  isArray,
} = Ember;

const ObjectPromiseProxy = ObjectProxy.extend(PromiseProxyMixin);

/**
 * Default value for ``responseTimeout`` in service
 * @type {number}
 */
const RESPONSE_TIMEOUT_MS = 10 * 1000;

const AVAIL_MESSAGE_HANDLERS = ['response', 'push'];

export default Ember.Service.extend(Evented, {
  /**
   * Max time in milliseconds for receiving a response for message
   *
   * If we don't receive response for sent message in this time, the message's
   * promise will be rejected.
   * @type {number}
   */
  responseTimeout: RESPONSE_TIMEOUT_MS,

  /**
   * Object promise proxy that isResolved when WebSocket is initialized
   * @type {ObjectPromiseProxy}
   */
  webSocketInitializedProxy: computed('_initDefer.promise', function () {
    return ObjectPromiseProxy.create({
      promise: this.get('_initDefer.promise') ||
        new Promise((_, reject) => reject()),
    });
  }).readOnly(),

  /**
   * True if there is opened WebSocket available in this service
   * @type {boolean}
   */
  webSocketIsOpened: readOnly('webSocketInitializedProxy.isFulfilled'),

  /**
   * @type {RSVP.Deferred}
   */
  _initDefer: null,

  /**
   * @type {RSVP.Deferred}
   */
  _closeDefer: null,

  /**
   * Maps message id -> { sendDeferred: RSVP.Deferred, timeoutId: Number }
   * @type {Map}
   */
  _deferredMessages: new Map(),

  /**
   * A class for creating new WebSocket object
   *
   * Set this property to custom class for mocking websocket
   * @type {class}
   */
  _webSocketClass: WebSocket,

  /**
   * @type {WebSocket}
   */
  _webSocket: null,

  initPromise: readOnly('_initDefer.promise'),
  closePromise: readOnly('_initDefer.promise'),

  /**
   * @param {object} options
   * @param {number} options.protocolVersion
   * @returns {Promise} resolves with success handshake message
   */
  initConnection(options) {
    return this._initNewConnection(options);
  },

  closeConnection() {
    return this._closeConnectionStart();
  },

  /**
   * The promise resolves with received message data.
   * The promise rejects on:
   * - uuid collision
   * - websocket adapter exception
   * @param {string} subtype one of: handshake, rpc, graph
   * @param {object} message
   * @returns {Promise<object, object>} resolves with Onedata Sync API response
   */
  sendMessage(subtype, message) {
    let {
      _webSocket,
      _deferredMessages,
      responseTimeout,
    } = this.getProperties(
      '_webSocket',
      '_deferredMessages',
      'responseTimeout'
    );
    let id = this._generateUuid();
    let rawMessage = {
      id,
      type: 'request',
      subtype,
      payload: message,
    };
    let sendDeferred = defer();
    if (_deferredMessages.has(id)) {
      // TODO: reason - collision
      sendDeferred.reject({
        error: 'collision',
        details: {
          id,
        },
      });
    }
    try {
      let rawMessageString = JSON.stringify(rawMessage);
      console.debug(`onedata-websocket: Will send: ${rawMessageString}`);
      _webSocket.send(rawMessageString);
    } catch (error) {
      sendDeferred.reject({
        error: 'send-failed',
        details: {
          error,
        },
      });
    }
    let timeoutId = window.setTimeout(
      () => this._responseTimeout(id),
      responseTimeout
    );

    _deferredMessages.set(id, { sendDeferred, timeoutId });
    let sendPromise = sendDeferred.promise;
    sendPromise.catch(error =>
      console.warn(
        `service:onedata-websocket: sendMessage error: ${JSON.stringify(error)}`
      )
    );
    return sendDeferred.promise;
  },

  /**
   * @private
   * @param {string} messageId
   * @returns {undefined}
   */
  _responseTimeout(messageId) {
    let _deferredMessages = this.get('_deferredMessages');
    if (_deferredMessages.has(messageId)) {
      let { sendDeferred } = _deferredMessages.get(messageId);
      _deferredMessages.delete(messageId);
      sendDeferred.reject({
        error: 'timeout',
        message: 'Server response timeout',
      });
    }
  },

  /**
   * Creates WebSocket and opens connection
   * @returns {Promise} resolves when websocket is opened successfully
   */
  _initWebsocket() {
    let {
      _webSocketClass: WebSocketClass,
    } = this.getProperties('_webSocketClass');

    let _initDefer = defer();
    this.set('_initDefer', _initDefer);
    let protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    let host = window.location.hostname;
    let port = 443;
    let suffix = '/graph_sync/';

    let url = protocol + host + (port === '' ? '' : ':' + port) + suffix;

    try {
      let socket = new WebSocketClass(url);
      socket.onopen = this._onOpen.bind(this);
      socket.onmessage = this._onMessage.bind(this);
      socket.onerror = this._onError.bind(this);
      socket.onclose = this._onClose.bind(this);
      this.set('_webSocket', socket);
    } catch (error) {
      console.error(`WebSocket initialization error: ${error}`);
      _initDefer.reject(error);
    }

    return _initDefer.promise;
  },

  _initNewConnection(options) {
    return this._initWebsocket().then(() => this._handshake(options));
  },

  _closeConnectionStart() {
    let _webSocket = this.get('_webSocket');
    if (_webSocket) {
      let _closeDefer = defer();
      this.set('_closeDefer', _closeDefer);
      _webSocket.close();
      return _closeDefer.promise;
    } else {
      // if there is no _webSocket, we assume, that there is no connection at all
      return Promise.resolve();
    }
  },

  _onOpen( /*event*/ ) {
    this.get('_initDefer').resolve();
  },

  // TODO: move unpacking into protocol level?
  // TODO: currently supporting only batch messages
  _onMessage({ data }) {
    data = JSON.parse(data);

    if (isArray(data.batch)) {
      // not using forEach for performance
      let batch = data.batch;
      let length = batch.length;
      for (let i = 0; i < length; ++i) {
        this._handleMessage(batch[i]);
      }
    } else {
      this._handleMessage(data);
    }
  },

  /**
   * @param {object} options
   * @param {number} protocolVersion
   * @returns {Promise<object, object>} resolves with successful handshake data
   */
  _handshake({ protocolVersion } = { protocolVersion: 1 }) {
    return new Promise((resolve, reject) => {
      let handshaking = this.sendMessage('handshake', {
        supportedVersions: [protocolVersion],
        sessionId: null,
      });
      handshaking.then(({ payload: { success, data, error } }) => {
        if (success) {
          resolve(data);
        } else {
          reject(error);
        }
      });
      handshaking.catch(reject);
    });
  },

  // TODO: handle errors - reject inits, etc.
  _onError( /*event*/ ) {},

  _onClose( /*event*/ ) {
    let _closeDefer = this.get('_closeDefer');
    if (_closeDefer) {
      _closeDefer.resolve();
    }
  },

  /** 
   * Generates a random uuid of message
   * @return {string}
   */
  _generateUuid() {
    let date = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
      function (character) {
        let random = (date + Math.random() * 16) % 16 | 0;
        date = Math.floor(date / 16);
        return (character === 'x' ? random : random & 0x7 | 0x8).toString(16);
      });
  },

  _MESSAGE_HANDLERS: _zipObject(
    AVAIL_MESSAGE_HANDLERS,
    AVAIL_MESSAGE_HANDLERS.map(t => '_' + camelize(`handle-${t}-message`))
  ),

  /**
   * @param {object} message
   * @returns {undefined}
   */
  _handleMessage(message) {
    console.debug(`onedata-websocket: Handling message: ${JSON.stringify(message)}`);
    let {
      type,
    } = message;

    let handler = this[this._MESSAGE_HANDLERS[type]];

    if (typeof handler === 'function') {
      handler.bind(this)(message);
    } else {
      throw `No handler for message type: ${type}`;
    }
  },

  _handlePushMessage(message) {
    // HACK convert push error message to response message
    let badMessageId = this._badMessageId(message);
    if (badMessageId) {
      // TODO possibly unsafe
      message.id = badMessageId;
      message.type = 'response';
      this._handleResponseMessage(message);
    } else {
      this.trigger('push', message);
    }
  },

  _handleResponseMessage(message) {
    let _deferredMessages = this.get('_deferredMessages');
    let {
      id,
    } = message;
    if (_deferredMessages.has(id)) {
      let { sendDeferred, timeoutId } = _deferredMessages.get(id);
      // NOTE Map.delete will not work on IE 10 or lower
      _deferredMessages.delete(id);
      clearTimeout(timeoutId);
      sendDeferred.resolve(message);
    } else {
      console.warn(
        `Tried to handle message with unknown UUID: ${id} - maybe there was a timeout?`
      );
    }
  },

  /**
   * Helper: if response reports badMessage error, return id of bad message
   * @param {string} message 
   * @returns {string|undefined}
   */
  _badMessageId(message) {
    if (
      message.type === 'push' &&
      message.payload &&
      message.payload.error &&
      message.payload.error.id === 'badMessage'
    ) {
      let requestMessage = JSON.parse(message.payload.error.details.message);
      return requestMessage.id;
    } else {
      return undefined;
    }
  },
});