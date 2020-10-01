import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | token template selector', function () {
  setupComponentTest('token-template-selector', {
    integration: true,
  });

  it('has class "token-template-selector"', function () {
    this.render(hbs `{{token-template-selector}}`);

    expect(this.$('.token-template-selector')).to.have.length(1);
  });
});
