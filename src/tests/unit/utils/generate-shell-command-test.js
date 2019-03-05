import { expect } from 'chai';
import { describe, it } from 'mocha';
import generateShellCommand from 'onezone-gui/utils/generate-shell-command';

describe('Unit | Utility | generate shell command', function () {
  it('generates command for onedatify', function () {
    const host = window.location.host;
    const supportToken = 'jdisdfg7fgr36t67f';
    const onezoneRegistrationToken = 'some_reg_token';

    let result = generateShellCommand('onedatify', {
      token: supportToken,
      onezoneRegistrationToken,
    });
    expect(result).to.match(/curl/);
    expect(result).to.match(
      new RegExp(`${host}.*${onezoneRegistrationToken}.*${supportToken}`)
    );
  });

  it('escapes string delimiter in onedatify command', function () {
    const supportToken = '\'hey\'destroy\'; rm -rf;';

    let result = generateShellCommand('onedatify', { supportToken });
    expect(result).to.match(/curl/);
    expect(result).to.match(/'\\'hey\\'destroy\\'; rm -rf;'/);
  });
});
