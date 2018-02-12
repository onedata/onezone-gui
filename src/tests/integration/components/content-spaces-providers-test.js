import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

// FIXME: implement tests

describe('Integration | Component | content spaces providers', function () {
  setupComponentTest('content-spaces-providers', {
    integration: true,
  });

  it('renders', function () {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#content-spaces-providers}}
    //     template content
    //   {{/content-spaces-providers}}
    // `);

    this.render(hbs `{{content-spaces-providers}}`);
    expect(this.$()).to.have.length(1);
  });
});
