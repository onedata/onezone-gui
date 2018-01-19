import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Transform | array', function () {
  setupTest('transform:array', {});

  it('deserializes array', function () {
    const transform = this.subject();
    const source = [1, 2, 3];
    const result = transform.deserialize(source);
    expect(result.length).to.equal(source.length);
    result.forEach((v, i) => expect(v).to.equal(source[i]));
  });

  it('serializes array', function () {
    const transform = this.subject();
    const source = [1, 2, 3];
    const result = transform.serialize(source);
    expect(result.length).to.equal(source.length);
    result.forEach((v, i) => expect(v).to.equal(source[i]));
  });
});
