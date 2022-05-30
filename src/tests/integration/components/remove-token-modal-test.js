import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';

describe('Integration | Component | remove token modal', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('token', {
      name: 'some token',
    });
  });

  it('renders token name inside message', async function () {
    await render(hbs `{{remove-token-modal opened=true token=token}}`);

    expect($('body .remove-token-modal.in')).to.contain(this.get('token.name'));
  });
});
