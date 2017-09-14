import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupModelTest } from 'ember-mocha';
import sinon from 'sinon';

import { registerService, lookupService } from '../../helpers/stub-service';
import OnedataGraphStub from '../../helpers/stubs/services/onedata-graph';

describe('Unit | Model | group', function () {
  setupModelTest('group', {
    needs: [],
  });

  beforeEach(function () {
    registerService(this, 'onedata-graph', OnedataGraphStub);
  });

  it('resolves invite token data using graph', function (done) {
    let model = this.subject();
    model.set('id', 'od_group.some_id.instance');

    const TOKEN = 'abcd';
    let graph = lookupService(this, 'onedata-graph');
    let graphRequestStub = sinon.stub(graph, 'request');
    let graphData = { data: TOKEN };
    let graphValidArgs = {
      gri: sinon.match(new RegExp('.*od_group.*some_id.*invite.*user.*')),
      operation: 'create',
    };
    graphRequestStub
      .withArgs(graphValidArgs)
      .resolves(graphData);

    let promise = model.getInviteToken('user');
    expect(graphRequestStub).to.be.calledWith(graphValidArgs);
    promise.then(token => {
      expect(token).to.equal(TOKEN);
      done();
    });
  });
});
