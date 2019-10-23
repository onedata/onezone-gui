import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | content tokens new', function () {
  setupComponentTest('content-tokens-new', {
    integration: true,
  });

  it('has class "content-tokens-new"', function () {
    this.render(hbs`{{content-tokens-new}}`);

    expect(this.$('.content-tokens-new')).to.exist;
  });

  it('renders component content-info', function () {
    this.render(hbs`{{content-tokens-new}}`);

    expect(this.$('.content-info')).to.exist;
  });
});
