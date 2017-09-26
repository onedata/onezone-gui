import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import EmberObject from '@ember/object';
import {
  environmentExport,
  isDevelopment,
  isModelMocked,
} from 'onedata-gui-websocket-client/utils/development-environment';
import sinon from 'sinon';

describe('Unit | Utility | development environment', function () {
  beforeEach(function () {
    this.storeStub = EmberObject.create({
      findRecord() {},
    });
  });

  it('detects if backend should be mocked', function () {
    let config = { APP: { MOCK_BACKEND: true } };
    let result = isDevelopment(config);
    expect(result).to.be.true;
  });

  it('returns symbol based on MOCK_BACKEND environment flag true', function () {
    let config = {
      APP: {
        MOCK_BACKEND: true,
      },
    };
    let Production = {};
    let Development = {};
    let result = environmentExport(config, Production, Development);
    expect(result).to.be.equal(Development);
  });

  it('returns symbol based on MOCK_BACKEND environment flag false', function () {
    let config = {
      APP: {},
    };
    let Production = {};
    let Development = {};
    let result = environmentExport(config, Production, Development);
    expect(result).to.be.equal(Production);
  });

  it('detects that model is already mocked', function (done) {
    let userRecord = {};
    let findRecord = sinon.stub(this.storeStub, 'findRecord');
    findRecord.withArgs('user', sinon.match(/.*stub_user_id.*/))
      .resolves(userRecord);

    let promise = isModelMocked(this.storeStub);
    promise.then(result => {
      expect(result).to.be.true;
      done();
    });
  });

  it('detects that model is not mocked', function (done) {
    sinon.stub(this.storeStub, 'findRecord')
      .withArgs('user', sinon.match(/.*stub_user_id.*/))
      .rejects();

    let promise = isModelMocked(this.storeStub);
    promise.then(result => {
      expect(result).to.be.false;
      done();
    });
  });
});
