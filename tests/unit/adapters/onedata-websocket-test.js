import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';

import sinon from 'sinon';
const {
  stub,
} = sinon;

import { registerService, lookupService } from '../../helpers/stub-service';
import OnedataGraphStub from '../../helpers/stubs/services/onedata-graph';
import OnedataGraphContextStub from '../../helpers/stubs/services/onedata-graph-context';

describe('Unit | Adapter | onedata websocket', function () {
  setupTest('adapter:onedata-websocket', {
    needs: [],
  });

  beforeEach(function () {
    registerService(this, 'onedata-graph', OnedataGraphStub);
    registerService(this, 'onedata-graph-context', OnedataGraphContextStub);
  });

  it('uses graph service to findRecord', function (done) {
    let store = {};
    let type = {};
    let recordId = 'record_id';
    let graphData = {};
    let adapter = this.subject();

    let graph = lookupService(this, 'onedata-graph');
    let graphRequestStub = stub(graph, 'request');
    graphRequestStub.throws('onedata-graph#request called with wrong args');
    graphRequestStub
      .withArgs({
        gri: recordId,
        operation: 'get',
        authHint: undefined,
      })
      .resolves(graphData);

    let graphContext = lookupService(this, 'onedata-graph-context');
    stub(graphContext, 'getAuthHint').returns(undefined);

    adapter.findRecord(store, type, recordId).then(adapterRecord => {
      expect(adapterRecord).to.equal(graphData);
      done();
    });
  });

  it('uses graph service to createRecord with support for metadata and null trimming',
    function (done) {
      let store = {};
      let modelName = 'something';
      let type = { modelName };
      let authHint = ['asUser', 'u1'];
      let recordData = {
        foo: 'bar',
        one: null,
      };
      let snapshot = {
        record: {
          toJSON: () => recordData,
          _meta: {
            authHint,
          },
        },
      };
      let retGraphData = {};
      let adapter = this.subject();
      let graph = lookupService(this, 'onedata-graph');
      let graphRequestStub = stub(graph, 'request');
      let graphValidArgs = {
        gri: sinon.match(new RegExp(`.*${modelName}.*`)),
        operation: 'create',
        // data for graph is stripped from _meta
        data: { foo: 'bar' },
        authHint,
      };
      graphRequestStub
        .withArgs(graphValidArgs)
        .resolves(retGraphData);

      let promise = adapter.createRecord(store, type, snapshot);
      expect(graphRequestStub).to.be.calledWith(graphValidArgs);
      promise.then(createResult => {
        expect(createResult).to.equal(retGraphData);
        done();
      });
    });

  it('uses graph service to updateRecord', function (done) {
    let store = {};
    let modelName = 'something';
    let type = {
      modelName,
    };
    let recordId = 'a:b:c';
    let recordData = {
      foo: 'bar',
    };
    let snapshot = {
      record: {
        toJSON() {
          return recordData;
        },
        id: recordId,
      },
    };
    let graphData = {};
    let adapter = this.subject();

    let graph = lookupService(this, 'onedata-graph');
    let graphRequestStub = stub(graph, 'request');
    let graphValidArgs = {
      gri: recordId,
      operation: 'update',
      data: recordData,
    };
    graphRequestStub
      .withArgs(graphValidArgs)
      .resolves(graphData);

    let promise = adapter.updateRecord(store, type, snapshot);
    expect(graphRequestStub).to.be.calledWith(graphValidArgs);

    promise.then(createResult => {
      expect(createResult).to.equal(graphData);
      done();
    });
  });

  it('uses graph service to deleteRecord', function (done) {
    let store = {};
    let modelName = 'something';
    let type = {
      modelName,
    };
    let recordId = 'a:b:c';
    let recordData = {
      foo: 'bar',
    };
    let snapshot = {
      record: {
        toJSON() {
          return recordData;
        },
        id: recordId,
      },
    };
    let graphData = {};
    let adapter = this.subject();

    let graph = lookupService(this, 'onedata-graph');
    let graphRequestStub = stub(graph, 'request');
    let graphValidArgs = {
      gri: recordId,
      operation: 'delete',
    };
    graphRequestStub
      .withArgs(graphValidArgs)
      .resolves(graphData);

    let promise = adapter.deleteRecord(store, type, snapshot);
    expect(graphRequestStub).to.be.calledWith(graphValidArgs);

    promise.then(createResult => {
      expect(createResult).to.equal(graphData);
      done();
    });
  });
});
