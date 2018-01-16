import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | space without support', function() {
  setupComponentTest('space-without-support', {
    integration: true,
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#space-without-support}}
    //     template content
    //   {{/space-without-support}}
    // `);

    this.render(hbs`{{space-without-support}}`);
    expect(this.$()).to.have.length(1);
  });
});
