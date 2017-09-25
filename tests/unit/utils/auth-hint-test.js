import { expect } from 'chai';
import { describe, it } from 'mocha';
import authHintGet from 'onedata-gui-websocket-client/utils/auth-hint-get';

describe('Unit | Utility | auth hints', function () {
  let authHintGetCases = [
    ['od_group', 'users', 'throughGroup'],
    ['od_group', 'groups', 'throughGroup'],
    ['od_space', 'users', 'throughSpace'],
    ['od_space', 'groups', 'throughSpace'],
  ];

  // define 4 test - each for combination in authHintGetCases
  authHintGetCases.forEach(([parentType, collectionType, expectedResult]) => {
    it(
      `generates hint prefix for ${parentType} shared ${collectionType} list`,
      function () {
        let gid = `${parentType}.some_id.${collectionType}`;
        expect(
          authHintGet(gid),
          `input gid: ${gid}`,
        ).to.equal(expectedResult);
      });
  });
});
