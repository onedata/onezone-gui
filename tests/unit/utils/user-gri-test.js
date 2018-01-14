import { expect } from 'chai';
import { describe, it } from 'mocha';
import userGri from 'onedata-gui-websocket-client/utils/user-gri';

describe('Unit | Utility | user gri', function () {
  it('constructs GRI for session user', function () {
    let result = userGri('stub_user_id');
    expect(result).to.be.equal('user.stub_user_id.instance:protected');
  });
});
