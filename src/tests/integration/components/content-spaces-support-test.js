import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | content spaces add storage', function() {
  setupComponentTest('content-spaces-add-storage', {
    integration: true,
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#content-spaces-add-storage}}
    //     template content
    //   {{/content-spaces-add-storage}}
    // `);

    this.render(hbs`{{content-spaces-add-storage}}`);
    expect(this.$()).to.have.length(1);
  });
});
