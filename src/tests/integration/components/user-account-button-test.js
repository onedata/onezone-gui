import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import Service from '@ember/service';
import sessionStub from '../../helpers/stubs/services/session';
import wait from 'ember-test-helpers/wait';
import { registerService, lookupService } from '../../helpers/stub-service';

const USER_ID = 'some_user_id';
const USERNAME = 'some_username';

const USER_RECORD = {
  id: USER_ID,
  name: USERNAME,
};

const storeStub = Service.extend({
  findRecord() {},
});

const PrivacyPolicyManagerStub = Service.extend({
  showPrivacyPolicyAction: undefined,
});

describe('Integration | Component | user account button', function () {
  setupComponentTest('user-account-button', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'session', sessionStub);
    registerService(this, 'store', storeStub);
    registerService(this, 'privacyPolicyManager', PrivacyPolicyManagerStub);

    lookupService(this, 'session').get('data.authenticated').identity.user = USER_ID;
    const store = lookupService(this, 'store');
    this.findRecordStub = sinon.stub(store, 'findRecord')
      .withArgs('user', sinon.match(/.*/))
      .resolves(USER_RECORD);
  });

  it('uses WS account button with username provided by session', function () {
    this.render(hbs `{{user-account-button}}`);

    wait().then(() => {
      let $username = this.$('.user-account-button-username');

      expect(this.findRecordStub)
        .to.be.calledWith('user', sinon.match(/.*some_user_id.*/));

      expect($username).to.exist;
      expect($username, $username.text()).to.contain(USERNAME);
    });
  });
});
