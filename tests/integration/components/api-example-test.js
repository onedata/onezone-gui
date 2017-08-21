import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | api example', function () {
  setupComponentTest('api-example', {
    integration: true,
  });

  it('renders', function () {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#api-example}}
    //     template content
    //   {{/api-example}}
    // `);

    this.render(hbs `{{api-example}}`);
    expect(this.$()).to.have.length(1);
  });
});
