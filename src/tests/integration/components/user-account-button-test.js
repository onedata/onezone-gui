import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import Service from '@ember/service';
import SessionStub from '../../helpers/stubs/services/session';
import wait from 'ember-test-helpers/wait';
import { registerService, lookupService } from '../../helpers/stub-service';

const userId = 'some_user_id';
const username = 'some_username';

const userRecord = {
  id: userId,
  name: username,
};

const CurrentUser = Service.extend({
  getCurrentUserRecord() {},
});

describe('Integration | Component | user account button', function () {
  setupComponentTest('user-account-button', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'currentUser', CurrentUser);
    registerService(this, 'session', SessionStub);

    let session = this.container.lookup('service:session');
    session.get('data.authenticated').identity.user = userId;
  });

  it('renders WS account button with username provided by current user record',
    function () {
      const getCurrentUserRecord =
        sinon.stub(lookupService(this, 'currentUser'), 'getCurrentUserRecord');
      getCurrentUserRecord.resolves(userRecord);

      this.render(hbs `{{user-account-button}}`);

      wait().then(() => {
        const $username = this.$('.user-account-button-username');

        expect($username).to.exist;
        expect($username, $username.text()).to.contain(username);
      });
    });
});
