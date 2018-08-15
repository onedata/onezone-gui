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

const linkedAccountManagerStub = Service.extend({
  getLinkedAccounts() {
    const accounts = [
      EmberObject.create({
        idp: 'google',
        emailList: ['one@one.one'],
      }),
    ];
    accounts.isLoaded = true;
    return resolve(accounts);
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
      name: 'some name',
      login: 'some login',
    });
    this.set('user', MOCKED_USER);
  });

  it('renders user name', function (done) {
    this.render(hbs `{{content-users user=user}}`);
    wait().then(() => {
      expect(this.$('.name-editor').text().trim())
        .to.equal(this.get('user.name'));
      done();
    });
  });

  it('renders login', function (done) {
    this.render(hbs `{{content-users user=user}}`);
    wait().then(() => {
      expect(this.$('.login-editor').text().trim())
        .to.equal(this.get('user.login'));
      done();
    });
  });

  it('renders linked account', function () {
    this.render(hbs `{{content-users user=user}}`);
    return wait().then(() => {
      expect(this.$('.google-account'), 'google-account').to.exist;
      expect(this.$('.google-account .account-type', 'Google+ text').text().trim())
        .to.equal('Google+');
      expect(this.$('.google-account .account-email', 'email text').text().trim())
        .to.equal('one@one.one');
    });
  });

  it('allows to change user name', function (done) {
    this.render(hbs `{{content-users user=user}}`);
    const user = this.get('user');
    const newName = 'testName';
    const saveSpy = sinon.spy(() => resolve());
    user.save = saveSpy;
    wait().then(() => {
      click('.name-editor .one-label').then(() => {
        fillIn('.name-editor input', newName).then(() => {
          click('.name-editor .save-icon').then(() => {
            expect(saveSpy).to.be.calledOnce;
            expect(this.$('.name-editor').text().trim())
              .to.equal(user.get('name'));
            expect(user.get('name')).to.equal(newName);
            done();
          });
        });
      });
    });
  });

  it('allows to change login', function (done) {
    this.render(hbs `{{content-users user=user}}`);
    const user = this.get('user');
    const newLogin = 'testLogin';
    const saveSpy = sinon.spy(() => resolve());
    user.save = saveSpy;
    wait().then(() => {
      click('.login-editor .one-label').then(() => {
        fillIn('.login-editor input', newLogin).then(() => {
          click('.login-editor .save-icon').then(() => {
            expect(saveSpy).to.be.calledOnce;
            expect(this.$('.login-editor').text().trim())
              .to.equal(user.get('login'));
            expect(user.get('login')).to.equal(newLogin);
            done();
          });
        });
      });
    });
  });
});
