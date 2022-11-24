import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | content-spaces-marketplace/list', function() {
  setupComponentTest('content-spaces-marketplace/list', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#content-spaces-marketplace/list}}
    //     template content
    //   {{/content-spaces-marketplace/list}}
    // `);

    this.render(hbs`{{content-spaces-marketplace/list}}`);
    expect(this.$()).to.have.length(1);
  });
});
