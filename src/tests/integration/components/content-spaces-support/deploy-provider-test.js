import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | content spaces support/deploy provider', function() {
  setupComponentTest('content-spaces-support/deploy-provider', {
    integration: true,
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#content-spaces-support/deploy-provider}}
    //     template content
    //   {{/content-spaces-support/deploy-provider}}
    // `);

    this.render(hbs`{{content-spaces-support/deploy-provider}}`);
    expect(this.$()).to.have.length(1);
  });
});
