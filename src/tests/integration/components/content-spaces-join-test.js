import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | content spaces join', function () {
  setupComponentTest('content-spaces-join', {
    integration: true,
  });

  it('renders', function () {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#content-spaces-join}}
    //     template content
    //   {{/content-spaces-join}}
    // `);

    this.render(hbs `{{content-spaces-join}}`);
    expect(this.$()).to.have.length(1);
  });
});
