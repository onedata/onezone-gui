import { expect } from 'chai';
import { describe, it } from 'mocha';
import generateShellCommand from 'onezone-gui/utils/generate-shell-command';

describe('Unit | Utility | generate shell command', function () {
  it('generates command for onedatify', function () {
    const host = window.location.host;
    const token = 'jdisdfg7fgr36t67f';

    let result = generateShellCommand('onedatify', { token });
    expect(result).to.match(/curl/);
    expect(result).to.match(new RegExp(host));
    expect(result).to.match(new RegExp(token));
  });

  it('escapes string delimiter in onedatify command', function () {
    const token = '\'hey\'destroy\'; rm -rf;';

    let result = generateShellCommand('onedatify', { token });
    expect(result).to.match(/curl/);
    expect(result).to.match(/'\\'hey\\'destroy\\'; rm -rf;'/);
  });
});
