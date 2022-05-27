import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import Service from '@ember/service';
import { get } from '@ember/object';
import { registerService } from '../../helpers/stub-service';
import OnedataGraphStub from '../../helpers/stubs/services/onedata-graph';

describe('Unit | Model | space', function () {
  setupTest();

  beforeEach(function () {
    registerService(this, 'onedata-graph', OnedataGraphStub);
    registerService(this, 'onedata-graph-utils', Service);
    registerService(this, 'token-manager', Service);
    registerService(this, 'current-user', Service);
    registerService(this, 'privilege-manager', Service);
  });

  it('has getInviteToken method', function () {
    const record = this.owner.lookup('service:store').createRecord('space', {});
    expect(record.getInviteToken).to.be.instanceOf(Function);
  });

  it('computes current user privileges without owner flag', function () {
    const model = this.owner.lookup('service:store').createRecord('space', {
      currentUserEffPrivileges: ['space_view_qos'],
      currentUserIsOwner: false,
    });

    const privileges = get(model, 'privileges');

    expect(privileges).to.have.property('viewQos', true);
    expect(privileges).to.have.property('viewTransfers', false);
  });

  it('computes current user privileges with owner flag', function () {
    const model = this.owner.lookup('service:store').createRecord('space', {
      currentUserEffPrivileges: [],
      currentUserIsOwner: true,
    });

    const privileges = get(model, 'privileges');

    expect(privileges).to.have.property('viewQos', true);
    expect(privileges).to.have.property('viewTransfers', true);
  });
});
