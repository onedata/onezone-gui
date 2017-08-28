import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

import sessionStub from '../../helpers/stubs/services/session';

const USERNAME = 'some_username';

describe('Integration | Component | user account button', function () {
  setupComponentTest('user-account-button', {
    integration: true,
  });

  beforeEach(function () {
    this.register('service:session', sessionStub);
    this.inject.service('session', { as: 'session' });

    let session = this.container.lookup('service:session');
    session.get('data.authenticated').identity.user = USERNAME;
  });

  it('uses WS account button with username provided by session', function () {
    this.render(hbs `{{user-account-button}}`);

    let $username = this.$('.user-account-button-username');

    expect($username).to.exist;
    expect($username).to.contain(USERNAME);
  });
});
