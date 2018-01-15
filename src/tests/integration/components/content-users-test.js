import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | content users', function() {
  setupComponentTest('content-users', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{content-users}}`);
    expect(this.$()).to.have.length(1);
  });
});
