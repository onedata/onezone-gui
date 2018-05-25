import { expect } from 'chai';
import { describe, it } from 'mocha';
import privilegesArrayToObject from 'onedata-gui-websocket-client/utils/privileges-array-to-object';
import flatFlags, { groupedFlags } from 'onedata-gui-websocket-client/utils/group-privileges-flags';

function getTreeSumedValue(tree, useAnd) {
  return Object.keys(tree).reduce((val, groupName) => {
    return Object.keys(tree[groupName]).reduce((inVal, privName) => {
      if (useAnd) {
        return inVal && tree[groupName][privName];
      } else {
        return inVal || tree[groupName][privName];
      }
    }, val);
  }, useAnd);
}

describe('Unit | Utility | privileges array to object', function () {
  it('marks privileges as true if available', function () {
    let result = privilegesArrayToObject(flatFlags, groupedFlags);
    expect(getTreeSumedValue(result, true)).to.be.true;
  });

  it('marks privileges as false if not available', function () {
    let result = privilegesArrayToObject([], groupedFlags);
    expect(getTreeSumedValue(result, false)).to.be.false;
  });
});
