import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | embedded content space transfers', function () {
  setupComponentTest('embedded-content-space-transfers', {
    integration: true,
  });

  it('renders', function () {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#embedded-content-space-transfers}}
    //     template content
    //   {{/embedded-content-space-transfers}}
    // `);

    this.render(hbs `{{embedded-content-space-transfers}}`);
    expect(this.$()).to.have.length(1);
  });
});
