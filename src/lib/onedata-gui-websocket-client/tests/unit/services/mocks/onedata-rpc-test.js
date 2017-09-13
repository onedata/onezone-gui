import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Service | mocks/onedata rpc', function () {
  setupTest('service:mocks/onedata-rpc', {
    needs: [],
  });

  it('responds to testRPC like echo', function (done) {
    const service = this.subject();

    const promise = service.request('testRPC', { echo: 'hello' });

    expect(promise).to.eventually.be.deep.equal({ echo: 'hello' }).notify(done);
  });
});
