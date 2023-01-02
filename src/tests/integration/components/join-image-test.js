import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | join-image', function() {
  setupComponentTest('join-image', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#join-image}}
    //     template content
    //   {{/join-image}}
    // `);

    this.render(hbs`{{join-image}}`);
    expect(this.$()).to.have.length(1);
  });
});
