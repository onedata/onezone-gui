import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | leave space confirm', function() {
  setupComponentTest('leave-space-confirm', {
    integration: true,
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#leave-space-confirm}}
    //     template content
    //   {{/leave-space-confirm}}
    // `);

    this.render(hbs`{{leave-space-confirm}}`);
    expect(this.$()).to.have.length(1);
  });
});
