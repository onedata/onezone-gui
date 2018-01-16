import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | content spaces new', function() {
  setupComponentTest('content-spaces-new', {
    integration: true,
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#content-spaces-new}}
    //     template content
    //   {{/content-spaces-new}}
    // `);

    this.render(hbs`{{content-spaces-new}}`);
    expect(this.$()).to.have.length(1);
  });
});
