import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import { click, fillIn } from 'ember-native-dom-helpers';
import hbs from 'htmlbars-inline-precompile';
import { registerService } from '../../helpers/stub-service';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { resolve } from 'rsvp';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';

const linkedAccountManagerStub = Service.extend({
  getLinkedAccounts() {
    return resolve(EmberObject.create({
      list: PromiseArray.create({
        promise: resolve([
          EmberObject.create({
            idp: 'google',
            emails: ['one@one.one'],
          }),
        ]),
      }),
    }));
  },
});

const authorizerManagerStub = Service.extend({
  getAvailableAuthorizers() {
    return [{
        id: 'google',
        displayName: 'Google+',
        iconPath: '/test/social-google.svg',
        iconBackgroundColor: '#fff',
      },
      {
        id: 'github',
        displayName: 'GitHub',
        iconPath: '/test/social-github.svg',
        iconBackgroundColor: '#123',
      },
    ];
  },
});

describe('Integration | Component | content users', function () {
  setupComponentTest('content-users', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'linkedAccountManager', linkedAccountManagerStub);
    registerService(this, 'authorizerManager', authorizerManagerStub);

    const MOCKED_USER = EmberObject.create({
      displayName: 'some name',
      username: 'some login',
      basicAuthEnabled: true,
    });
    this.set('user', MOCKED_USER);
  });

  it('renders display name', function (done) {
    this.render(hbs `{{content-users user=user}}`);
    wait().then(() => {
      expect(this.$('.display-name-editor').text().trim())
        .to.equal(this.get('user.displayName'));
      done();
    });
  });

  it('renders username', function (done) {
    this.render(hbs `{{content-users user=user}}`);
    wait().then(() => {
      expect(this.$('.username-editor').text().trim())
        .to.equal(this.get('user.username'));
      done();
    });
  });

  it('renders linked account', function () {
    this.render(hbs `{{content-users user=user}}`);
    return wait().then(() => {
      expect(this.$('.google-account'), 'google-account').to.exist;
      expect(
        this.$('.google-account .account-type', 'Google+ text').text().trim()
      ).to.equal('Google+');
      expect(
        this.$('.google-account .account-email', 'email text').text().trim()
      ).to.equal('one@one.one');
    });
  });

  it('allows to change display name', function (done) {
    this.render(hbs `{{content-users user=user}}`);
    const user = this.get('user');
    const newName = 'testName';
    const saveSpy = sinon.spy(() => resolve());
    user.save = saveSpy;
    wait().then(() => {
      click('.display-name-editor .one-label').then(() => {
        fillIn('.display-name-editor input', newName).then(() => {
          click('.display-name-editor .save-icon').then(() => {
            expect(saveSpy).to.be.calledOnce;
            expect(this.$('.display-name-editor').text().trim())
              .to.equal(user.get('displayName'));
            expect(user.get('displayName')).to.equal(newName);
            done();
          });
        });
      });
    });
  });

  it('allows to change username', function (done) {
    this.render(hbs `{{content-users user=user}}`);
    const user = this.get('user');
    const newUsername = 'testUsername';
    const saveSpy = sinon.spy(() => resolve());
    user.save = saveSpy;
    wait().then(() => {
      click('.username-editor .one-label').then(() => {
        fillIn('.username-editor input', newUsername).then(() => {
          click('.username-editor .save-icon').then(() => {
            expect(saveSpy).to.be.calledOnce;
            expect(this.$('.username-editor').text().trim())
              .to.equal(user.get('username'));
            expect(user.get('username')).to.equal(newUsername);
            done();
          });
        });
      });
    });
  });

  it('renders password section for user with basicAuth enabled', function () {
    this.render(hbs `{{content-users user=user}}`);
    return wait().then(() => {
      expect(this.$('.change-password-row .one-inline-editor')).to.exist;
    });
  });

  it(
    'does not render password section for user with basicAuth disabled',
    function () {
      this.set('user.basicAuthEnabled', false);
      this.render(hbs `{{content-users user=user}}`);
      return wait().then(() => {
        expect(this.$('.change-password-row .one-inline-editor')).to.not.exist;
      });
    }
  );
});
