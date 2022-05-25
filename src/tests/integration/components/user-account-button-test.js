import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
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

const GuiMessageManagerStub = Service.extend({
  privacyPolicyUrl: undefined,
  termsOfUseUrl: undefined,
});

describe('Integration | Component | user account button', function () {
  setupRenderingTest();

  beforeEach(function () {
    registerService(this, 'currentUser', CurrentUser);
    registerService(this, 'session', SessionStub);
    registerService(this, 'guiMessageManager', GuiMessageManagerStub);

    const session = lookupService(this, 'session');
    session.get('data.authenticated').identity.user = userId;

    const store = lookupService(this, 'store');
    this.findRecordStub = sinon.stub(store, 'findRecord')
      .withArgs('user', sinon.match(/.*/))
      .resolves(userRecord);
  });

  it('renders WS account button with username provided by current user record',
    async function () {
      const getCurrentUserRecord =
        sinon.stub(lookupService(this, 'currentUser'), 'getCurrentUserRecord');
      getCurrentUserRecord.resolves(userRecord);

      await render(hbs `{{user-account-button}}`);

      wait().then(() => {
        const $username = this.$('.user-account-button-username');

        expect($username).to.exist;
        expect($username, $username.text()).to.contain(username);
      });
    });
});
