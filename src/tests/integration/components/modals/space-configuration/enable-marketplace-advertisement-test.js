import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | modals/space-configuration/enable-marketplace-advertisement', function() {
  setupComponentTest('modals/space-configuration/enable-marketplace-advertisement', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#modals/space-configuration/enable-marketplace-advertisement}}
    //     template content
    //   {{/modals/space-configuration/enable-marketplace-advertisement}}
    // `);

    this.render(hbs`{{modals/space-configuration/enable-marketplace-advertisement}}`);
    expect(this.$()).to.have.length(1);
  });
});
