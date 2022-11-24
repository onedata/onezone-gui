import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | content-spaces-marketplace/item', function() {
  setupComponentTest('content-spaces-marketplace/item', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#content-spaces-marketplace/item}}
    //     template content
    //   {{/content-spaces-marketplace/item}}
    // `);

    this.render(hbs`{{content-spaces-marketplace/item}}`);
    expect(this.$()).to.have.length(1);
  });
});
