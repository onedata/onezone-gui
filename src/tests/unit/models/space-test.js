import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupModelTest } from 'ember-mocha';
import Service from '@ember/service';

import { registerService } from '../../helpers/stub-service';
import OnedataGraphStub from '../../helpers/stubs/services/onedata-graph';

describe('Unit | Model | space', function () {
  setupModelTest('space', {
    needs: ['service:onedata-token-api'],
  });

  beforeEach(function () {
    registerService(this, 'onedata-graph', OnedataGraphStub);
    registerService(this, 'onedata-graph-utils', Service);
    registerService(this, 'token-manager', Service);
  });

  it('has getInviteToken method', function () {
    let record = this.subject();
    expect(record.getInviteToken).to.be.instanceOf(Function);
  });
});
