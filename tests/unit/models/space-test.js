import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupModelTest } from 'ember-mocha';

import { registerService } from '../../helpers/stub-service';
import OnedataGraphStub from '../../helpers/stubs/services/onedata-graph';

describe('Unit | Model | space', function () {
  setupModelTest('space', {
    needs: [],
  });

  beforeEach(function () {
    registerService(this, 'onedata-graph', OnedataGraphStub);
  });

  it('has getInviteToken method', function () {
    let model = this.subject();
    expect(model.getInviteToken).to.be.instanceOf(Function);
  });
});
