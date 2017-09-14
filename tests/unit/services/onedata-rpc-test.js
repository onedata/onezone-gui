import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';

import OnedataWebsocketService from '../../helpers/stubs/services/onedata-websocket';

describe('Unit | Service | onedata rpc', function () {
  setupTest('service:onedata-rpc', {
    needs: [],
  });

  beforeEach(function () {
    this.register('service:onedata-websocket', OnedataWebsocketService);
    this.inject.service('onedata-websocket', { as: 'onedataWebsocket' });
  });

  it('can use onedata-websocket mock handleSendRpc', function (done) {
    let service = this.subject();
    let ws = this.container.lookup('service:onedata-websocket');
    let handleSendRpc = sinon.spy({
      handleSendRpc() {
        return Promise.resolve({
          payload: {
            success: true,
            args: {},
          },
        });
      },
    }, 'handleSendRpc');

    ws.set('handleSendRpc', handleSendRpc);
    ws.initConnection().then(() => {
      service.request('testRpc', { hello: 'world' });
      wait().then(() => {
        expect(handleSendRpc).to.be.called.once;
        expect(handleSendRpc).to.be.calledWith({
          function: 'testRpc',
          args: { hello: 'world' },
        });
        done();
      });
    });
  });
});
