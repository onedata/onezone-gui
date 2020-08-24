import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupModelTest } from 'ember-mocha';
import Service from '@ember/service';
import { get, set } from '@ember/object';
import { lookupService, registerService } from '../../helpers/stub-service';
import OnedataGraphStub from '../../helpers/stubs/services/onedata-graph';
import sinon from 'sinon';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { resolve } from 'rsvp';

describe('Unit | Model | space', function () {
  setupModelTest('space', {
    needs: [
      'service:onedata-token-api',
    ],
  });

  beforeEach(function () {
    registerService(this, 'onedata-graph', OnedataGraphStub);
    registerService(this, 'onedata-graph-utils', Service);
    registerService(this, 'token-manager', Service);
    registerService(this, 'current-user', Service);
    registerService(this, 'privilege-manager', Service);
  });

  it('has getInviteToken method', function () {
    const record = this.subject();
    expect(record.getInviteToken).to.be.instanceOf(Function);
  });

  describe('computes its ownership by current user', function () {
    beforeEach(function () {
      this.record = this.subject();
      sinon.stub(this.record, 'ownerList').value(promiseObject(resolve({
        list: [
          { entityId: 'b1' },
          { entityId: 'b2' },
        ],
      })));
    });

    it('as true if the user is on owners list', function () {
      set(lookupService(this, 'current-user'), 'userId', 'b2');

      return get(this.record, 'currentUserIsOwnerProxy').then(currentUserIsOwner => {
        expect(currentUserIsOwner).to.equal(true);
      });
    });

    it('as false if the user is not on owners list', function () {
      set(lookupService(this, 'current-user'), 'userId', 'a1');

      return get(this.record, 'currentUserIsOwnerProxy').then(currentUserIsOwner => {
        expect(currentUserIsOwner).to.equal(false);
      });
    });
  });
});
