import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | content spaces embedded base', function() {
  setupComponentTest('content-spaces-embedded-base', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#content-spaces-embedded-base}}
    //     template content
    //   {{/content-spaces-embedded-base}}
    // `);

    this.render(hbs`{{content-spaces-embedded-base}}`);
    expect(this.$()).to.have.length(1);
  });
});
