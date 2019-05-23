import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | embedded content file browser', function() {
  setupComponentTest('embedded-content-file-browser', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#embedded-content-file-browser}}
    //     template content
    //   {{/embedded-content-file-browser}}
    // `);

    this.render(hbs`{{embedded-content-file-browser}}`);
    expect(this.$()).to.have.length(1);
  });
});
