import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | space-configuration', function() {
  setupComponentTest('space-configuration', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#space-configuration}}
    //     template content
    //   {{/space-configuration}}
    // `);

    this.render(hbs`{{space-configuration}}`);
    expect(this.$()).to.have.length(1);
  });
});
