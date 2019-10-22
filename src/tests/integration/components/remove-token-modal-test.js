import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';
import wait from 'ember-test-helpers/wait';

describe('Integration | Component | remove token modal', function () {
  setupComponentTest('remove-token-modal', {
    integration: true,
  });

  beforeEach(function () {
    this.set('token', {
      name: 'some token',
    });
  });

  it('renders token name inside message', function () {
    this.render(hbs`{{remove-token-modal opened=true token=token}}`);
    
    return wait().then(() => {
      expect($('body .remove-token-modal.in')).to.contain(this.get('token.name'));
    });
  });
});
