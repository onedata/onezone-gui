import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | sidebar providers/space item', function() {
  setupComponentTest('sidebar-providers/space-item', {
    integration: true,
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#sidebar-providers/space-item}}
    //     template content
    //   {{/sidebar-providers/space-item}}
    // `);

    this.render(hbs`{{sidebar-providers/space-item}}`);
    expect(this.$()).to.have.length(1);
  });
});
