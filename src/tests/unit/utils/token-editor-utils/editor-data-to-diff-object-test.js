import { expect } from 'chai';
import { describe, it } from 'mocha';
import { editorDataToDiffObject } from 'onezone-gui/utils/token-editor-utils';

describe('Unit | Utility | token editor utils/editor data to diff object', function () {
  it('converts name if it has been changed', function () {
    const result = editorDataToDiffObject({
      basic: {
        name: 'token2',
      },
    }, {
      name: 'token1',
    });

    expect(result).to.have.property('name', 'token2');
  });

  it('does not convert name if it has not been changed', function () {
    const result = editorDataToDiffObject({
      basic: {
        name: 'token1',
      },
    }, {
      name: 'token1',
    });

    expect(result).to.not.have.property('name');
  });

  it('converts revoked if it has been changed', function () {
    const result = editorDataToDiffObject({
      basic: {
        revoked: true,
      },
    }, {
      revoked: false,
    });

    expect(result).to.have.property('revoked', true);
  });

  it('does not convert revoked if it has not been changed', function () {
    const result = editorDataToDiffObject({
      basic: {
        revoked: false,
      },
    }, {
      revoked: false,
    });

    expect(result).to.not.have.property('revoked');
  });
});
