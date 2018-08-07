import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Service | onedata graph context', function () {
  setupTest('service:onedata-graph-context', {
    needs: [],
  });

  it('removes specific registered context, leaving previous contexts', function () {
    const requestedId = 'a:b:c';
    let firstContext = 'group.abc.children';
    let secondContext = 'space.def.groups';
    let service = this.subject();

    service.register(requestedId, firstContext);
    service.register(requestedId, secondContext);
    service.deregister(secondContext);
    let resultContext = service.getContext(requestedId);

    expect(resultContext).to.equal(firstContext);
  });

  // Replace this with your real tests.
  it('returns last registered context', function () {
    const requestedId = 'a:b:c';
    let firstContext = 'group.abc.children';
    let secondContext = 'space.def.groups';
    let service = this.subject();

    service.register(requestedId, firstContext);
    service.register(requestedId, secondContext);
    let resultContext = service.getContext(requestedId);

    expect(resultContext).to.equal(secondContext);
  });
});
