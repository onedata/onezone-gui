import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | content spaces transfers', function () {
  setupComponentTest('content-spaces-transfers', {
    integration: true,
  });

  it('renders', function () {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#content-spaces-transfers}}
    //     template content
    //   {{/content-spaces-transfers}}
    // `);

    this.render(hbs `{{content-spaces-transfers}}`);
    expect(this.$()).to.have.length(1);
  });
});
