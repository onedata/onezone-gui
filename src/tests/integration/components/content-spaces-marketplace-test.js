import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | content-spaces-marketplace', function() {
  setupComponentTest('content-spaces-marketplace', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#content-spaces-marketplace}}
    //     template content
    //   {{/content-spaces-marketplace}}
    // `);

    this.render(hbs`{{content-spaces-marketplace}}`);
    expect(this.$()).to.have.length(1);
  });
});
