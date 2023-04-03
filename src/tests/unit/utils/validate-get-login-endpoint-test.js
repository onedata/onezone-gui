import { expect } from 'chai';
import { describe, it } from 'mocha';
import validateGetLoginEndpoint from 'onezone-gui/utils/validate-get-login-endpoint';

describe('Unit | Utility | validate-get-login-endpoint', function () {
  it('detects missing fields in POST-type endpoint data', function () {
    const result = validateGetLoginEndpoint({
      method: 'post',
      url: 'https://example.com',
    });

    expect(result).to.be.false;
  });

  it('passes validation of get method with url only', function () {
    const result = validateGetLoginEndpoint({
      method: 'get',
      url: 'https://example.com',
    });

    expect(result).to.be.true;
  });
});
