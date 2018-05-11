import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | permissions tree editor', function() {
  setupComponentTest('permissions-tree-editor', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#permissions-tree-editor}}
    //     template content
    //   {{/permissions-tree-editor}}
    // `);

    this.render(hbs`{{permissions-tree-editor}}`);
    expect(this.$()).to.have.length(1);
  });
});
