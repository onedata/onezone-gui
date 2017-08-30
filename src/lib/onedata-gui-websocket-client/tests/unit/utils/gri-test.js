import { expect } from 'chai';
import { describe, it } from 'mocha';
import gri from 'onedata-gui-websocket-client/utils/gri';

describe('Unit | Utility | gri', function () {
  it('allows to omit scope', function () {
    let result = gri('oneentity', 'oneid', 'oneaspect');
    expect(result).to.be.equal('oneentity.oneid.oneaspect');
  });
});
