import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | content clusters index', function() {
  setupComponentTest('content-clusters-index', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#content-clusters-index}}
    //     template content
    //   {{/content-clusters-index}}
    // `);

    this.render(hbs`{{content-clusters-index}}`);
    expect(this.$()).to.have.length(1);
  });
});
