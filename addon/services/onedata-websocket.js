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
} = Ember;

const ObjectPromiseProxy = ObjectProxy.extend(PromiseProxyMixin);

/**
 * Default value for ``responseTimeout`` in service
 * @type {number}
 */
const RESPONSE_TIMEOUT_MS = 1 * 60 * 1000;

const AVAIL_MESSAGE_HANDLERS = ['response', 'push'];

export default Ember.Service.extend(Evented, {
  /**
   * Max time in milliseconds for receiving a response for message
   *
   * If we don't receive reponse for sent message in this time, the message's
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
        new Promise((_, reject) => reject())
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
   * Maps message id -> deferred
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

  /**
   * @param {object} options
   * @param {number} options.protocolVersion
   * @returns {Promise} resolves with success handshake message
   */
  initConnection(options) {
    return this._initWebsocket().then(() => this._handshake(options));
  },

  /**
   * The promise resolves with received message data.
   * The promise rejects on:
   * - uuid collision
   * - websocket adapter exception
   * @param {object} message
   * @param {string} subtype one of: handshake, rpc, graph
   * @return {Promise}
   */
  send(subtype, message) {
    let {
      socket,
      _deferredMessages,
      responseTimeout,
    } = this.getProperties(
      'socket',
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
          id
        },
      });
    }
    try {
      let rawMessageString = JSON.stringify(rawMessage);
      console.debug(`onedata-websocket: Will send: ${rawMessageString}`);
      socket.send(rawMessageString);
    } catch (error) {
      sendDeferred.reject({
        error: 'send-failed',
        details: {
          error
        }
      });
    }
    _deferredMessages.set(id, sendDeferred);
    // FIXME register timeout and clear it after message resolve
    // FIXME optimize - do not create whole function every time
    window.setTimeout(function () {
      if (_deferredMessages.has(id)) {
        sendDeferred.reject({
          error: 'timeout',
        });
      }
    }, responseTimeout);
    return sendDeferred.promise;
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
    let port = 8001;

    let url = protocol + host + (port === '' ? '' : ':' + port);

    try {
      let socket = new WebSocketClass(url);
      this.set('socket', socket);
      socket.onopen = this._onOpen.bind(this);
      socket.onmessage = this._onMessage.bind(this);
      socket.onerror = this._onError.bind(this);
      socket.onclose = this._onClose.bind(this);
      this.set('_webSocket', socket);

      // FIXME send me a handshake it will be better for me
    } catch (error) {
      console.error(`WebSocket initializtion error: ${error}`);
      _initDefer.reject(error);
    }

    return _initDefer.promise;
  },

  _onOpen( /*event*/ ) {
    this.get('_initDefer').resolve();
  },

  // TODO move unpacking into protocol level?
  // TODO currently supporting only batch messages
  _onMessage({ data }) {
    data = JSON.parse(data);

    if (data.batch) {
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
   * @returns {Promise}
   */
  _handshake({ protocolVersion } = { protocolVersion: 1 }) {
    return new Promise((resolve, reject) => {
      let handshaking = this.send('handshake', {
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

  _onError( /*event*/ ) {},

  _onClose( /*event*/ ) {},

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
        return (character === 'x' ? random : (random & 0x7 | 0x8)).toString(16);
      });
  },

  _MESSAGE_HANDLERS: _zipObject(
    AVAIL_MESSAGE_HANDLERS,
    AVAIL_MESSAGE_HANDLERS.map(t => '_' + camelize(`handle-${t}-message`))
  ),

  /**
   * @param {object} message 
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
      let deferred = _deferredMessages.get(id);
      // NOTE Map.delete will not work on IE 10 or lower
      _deferredMessages.delete(id);
      deferred.resolve(message);
    } else {
      throw `Tried to handle message with unknown UUID: ${id}`;
    }
  },

  /** 
   * @return {string}
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
