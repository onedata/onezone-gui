import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | content-spaces-marketplace/content', function() {
  setupComponentTest('content-spaces-marketplace/content', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#content-spaces-marketplace/content}}
    //     template content
    //   {{/content-spaces-marketplace/content}}
    // `);

    this.render(hbs`{{content-spaces-marketplace/content}}`);
    expect(this.$()).to.have.length(1);
  });
});
