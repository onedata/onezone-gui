import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupModelTest } from 'ember-mocha';
import sinon from 'sinon';
import Service from '@ember/service';

import { registerService, lookupService } from '../../helpers/stub-service';

const OnedataTokenApiMock = Service.extend({
  getInviteToken() {},
});

describe('Unit | Model | group', function () {
  setupModelTest('group', {
    needs: [],
  });

  beforeEach(function () {
    registerService(this, 'onedata-token-api', OnedataTokenApiMock);
    registerService(this, 'onedata-graph-utils', Service);
  });

  it('resolves invite token using token api service and graph', function () {
    let record = this.subject();
    record.set('id', 'group.some_id.instance');

    const TOKEN = 'abcd';
    let tokenApi = lookupService(this, 'onedata-token-api');
    let tokenApiRequestStub = sinon.stub(tokenApi, 'getInviteToken');
    let tokenData = TOKEN;
    const validArgs = ['group', 'some_id', 'user'];
    tokenApiRequestStub
      .withArgs(...validArgs)
      .resolves(tokenData);

    let promise = record.getInviteToken('user');
    expect(tokenApiRequestStub).to.be.calledWith(...validArgs);
    return promise.then(token => {
      expect(token).to.equal(TOKEN);
    });
  });
});