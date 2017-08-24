import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | sidebar providers', function() {
  setupComponentTest('sidebar-providers', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#sidebar-providers}}
    //     template content
    //   {{/sidebar-providers}}
    // `);

    this.render(hbs`{{sidebar-providers}}`);
    expect(this.$()).to.have.length(1);
  });
});
