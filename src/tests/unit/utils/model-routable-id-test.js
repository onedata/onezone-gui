import { expect } from 'chai';
import { describe, it } from 'mocha';
import modelRoutableId from 'onezone-gui/utils/model-routable-id';

describe('Unit | Utility | model routable id', function () {
  it('extracts id from gri', function () {
    const result = modelRoutableId({ id: 'provider.abcdef.instance:private' });
    expect(result).to.be.equal('abcdef');
  });
});
