import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | content spaces support/expose data', function() {
  setupComponentTest('content-spaces-support/expose-data', {
    integration: true,
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#content-spaces-support/expose-data}}
    //     template content
    //   {{/content-spaces-support/expose-data}}
    // `);

    this.render(hbs`{{content-spaces-support/expose-data}}`);
    expect(this.$()).to.have.length(1);
  });
});
