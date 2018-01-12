import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';

import { registerService, lookupService } from '../../helpers/stub-service';
import OnedataGraphStub from '../../helpers/stubs/services/onedata-graph';

describe('Unit | Service | onedata token api', function () {
  setupTest('service:onedata-token-api', {
    needs: [],
  });

  beforeEach(function () {
    registerService(this, 'onedata-graph', OnedataGraphStub);
  });

  it('resolves invite token data using graph', function (done) {
    const service = this.subject();

    const TOKEN = 'abcd';
    const graph = lookupService(this, 'onedata-graph');
    const graphRequestStub = sinon.stub(graph, 'request');
    const graphData = { data: TOKEN };
    const graphValidArgs = {
      gri: sinon.match(new RegExp('.*group.*some_id.*invite.*user.*')),
      operation: 'create',
    };
    graphRequestStub
      .withArgs(graphValidArgs)
      .resolves(graphData);

    const promise = service.getInviteToken('group', 'some_id', 'user');

    wait().then(() => {
      expect(graphRequestStub).to.be.calledWith(graphValidArgs);
      expect(promise).to.eventually.be.equal(TOKEN).notify(done);
    });
  });
});
