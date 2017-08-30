import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupModelTest } from 'ember-mocha';

import { registerService } from '../../helpers/stub-service';
import OnedataGraphStub from '../../helpers/stubs/services/onedata-graph';

describe('Unit | Model | space', function () {
  setupModelTest('space', {
    // Specify the other units that are required for this test.
    needs: [],
  });

  beforeEach(function () {
    registerService(this, 'onedata-graph', OnedataGraphStub);
  });

  it('exists', function () {
    let model = this.subject();
    expect(model).to.be.ok;
  });

  it('has getInviteToken method', function () {
    let model = this.subject();
    expect(model.getInviteToken).to.be.instanceOf(Function);
  });
});
