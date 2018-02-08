import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | content spaces support/ tab base', function() {
  setupComponentTest('content-spaces-support/-tab-base', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#content-spaces-support/-tab-base}}
    //     template content
    //   {{/content-spaces-support/-tab-base}}
    // `);

    this.render(hbs`{{content-spaces-support/-tab-base}}`);
    expect(this.$()).to.have.length(1);
  });
});
