import { expect } from 'chai';
import { describe, it } from 'mocha';
import privilegesArrayToObject from 'onedata-gui-websocket-client/utils/privileges-array-to-object';

describe('Unit | Utility | privileges array to object', function() {
  // Replace this with your real tests.
  it('works', function() {
    let result = privilegesArrayToObject();
    expect(result).to.be.ok;
  });
});
