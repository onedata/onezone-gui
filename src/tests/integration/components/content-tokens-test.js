import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | content tokens', function () {
  setupComponentTest('content-tokens', {
    integration: true,
  });

  beforeEach(function () {
    this.set('token', { name: 'token name' });
  });

  it('has class content-tokens', function () {
    this.render(hbs `{{content-tokens}}`);

    expect(this.$('.content-tokens')).to.exist;
  });

  it('shows token name in header', function () {
    this.render(hbs `{{content-tokens token=token}}`);

    expect(this.$('h1 .token-name').text().trim())
      .to.equal(this.get('token.name'));
  });

  it('shows token editor component in view mode with token data', function () {
    this.render(hbs `{{content-tokens token=token}}`);

    expect(this.$('.token-editor')).to.have.class('view-mode');
    // Not have to test other fields - we only need to check if token is passed to
    // token-editor component. Token data rendering is deeply tested in token-editor tests.
    expect(this.$('.name-field').text()).to.contain('token name');
  });
});
