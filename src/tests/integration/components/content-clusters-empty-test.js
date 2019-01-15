import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | content clusters empty', function() {
  setupComponentTest('content-clusters-empty', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#content-clusters-empty}}
    //     template content
    //   {{/content-clusters-empty}}
    // `);

    this.render(hbs`{{content-clusters-empty}}`);
    expect(this.$()).to.have.length(1);
  });
});
