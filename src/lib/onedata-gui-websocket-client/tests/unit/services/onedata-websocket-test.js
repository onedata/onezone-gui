import EmberObject from '@ember/object';
import Evented from '@ember/object/evented';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import wait from 'ember-test-helpers/wait';

class WebSocketMock {
  constructor() {
    setTimeout(() => this.onopen({}), 0);
  }
}

describe('Unit | Service | onedata websocket', function () {
  setupTest('service:onedata-websocket', {
    needs: [],
  });

  it('resolves initWebsocket promise by opening ws connection', function (done) {
    let promiseResolved = false;
    let service = this.subject();

    service.set('_webSocketClass', WebSocketMock);

    let promise = service._initWebsocket();
    promise.then(() => {
      promiseResolved = true;
    });
    wait().then(() => {
      expect(promiseResolved).to.be.true;
      done();
    });
  });

  it('sends event with message content when push message is sent', function (done) {
    let service = this.subject();
    service.set('_webSocketClass', WebSocketMock);
    let pushHandlerDone = false;
    let pushHandler = function (m) {
      expect(m).to.equal('hello');
      pushHandlerDone = true;
    };

    EmberObject.extend(Evented).create({
      init() {
        service.on('push:graph', (m) => {
          pushHandler(m);
        });
      },
    });

    service._initWebsocket().then(() => {
      let _webSocket = service.get('_webSocket');
      _webSocket.onmessage({
        data: JSON.stringify({
          batch: [{
            type: 'push',
            subtype: 'graph',
            payload: 'hello',
          }],
        }),
      });
      wait().then(() => {
        expect(pushHandlerDone).to.be.true;
        done();
      });
    });
  });

  it('handles message responses', function (done) {
    let service = this.subject();
    service.set('_webSocketClass', WebSocketMock);
    const messageId = 'some_message_id';
    const responsePayload = { x: 'good evening' };
    service.set('_generateUuid', () => messageId);

    service._initWebsocket().then(() => {
      let _webSocket = service.get('_webSocket');

      _webSocket.send = function () {
        window.setTimeout(() => {
          // response on any send
          this.onmessage({
            data: JSON.stringify({
              id: messageId,
              type: 'response',
              payload: responsePayload,
            }),
          });
        }, 0);
      };

      service.sendMessage({}).then(m => {
        expect(m).has.property('payload');
        expect(m.payload).has.property('x');
        expect(m.payload.x).to.equal(responsePayload.x);
        done();
      });
    });
  });
});
