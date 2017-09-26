import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';

import { registerService, lookupService } from '../../helpers/stub-service';
import GraphContextStub from '../../helpers/stubs/services/onedata-graph-context';
import sinon from 'sinon';

describe('Unit | Serializer | context collection', function () {
  setupTest('serializer:-context-collection', {
    needs: [],
  });

  beforeEach(function () {
    registerService(this, 'onedata-graph-context', GraphContextStub);
  });

  it('uses onedata-graph-context to register context of list records', function () {
    const hash = {
      gri: 'hello.world.foo',
      list: ['one.two.three', 'five.six.seven'],
    };

    let graphContext = lookupService(this, 'onedata-graph-context');
    let registerStub = sinon.stub(graphContext, 'register');

    let serializer = this.subject();

    serializer.registerContextForItems(hash);

    expect(registerStub).to.have.callCount(hash.list.length);
  });
});
