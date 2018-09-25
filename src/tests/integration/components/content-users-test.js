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
            emailList: ['one@one.one'],
          }),
        ]),
      }),
    }));
  },
});

const authorizerManagerStub = Service.extend({
  getAvailableAuthorizers() {
    return [{
        type: 'google',
        name: 'Google+',
        iconType: 'oneicon',
        iconName: 'social-google',
      },
      {
        type: 'github',
        name: 'GitHub',
        iconType: 'oneicon',
        iconName: 'social-github',
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
      alias: 'some alias',
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

  it('renders alias', function (done) {
    this.render(hbs `{{content-users user=user}}`);
    wait().then(() => {
      expect(this.$('.alias-editor').text().trim())
        .to.equal(this.get('user.alias'));
      done();
    });
  });

  it('renders linked account', function (done) {
    this.render(hbs `{{content-users user=user}}`);
    wait().then(() => {
      expect(this.$('.google-account')).to.exist;
      expect(this.$('.google-account .account-type').text().trim())
        .to.equal('Google+');
      expect(this.$('.google-account .account-email').text().trim())
        .to.equal('one@one.one');
      done();
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

  it('allows to change alias', function (done) {
    this.render(hbs `{{content-users user=user}}`);
    const user = this.get('user');
    const newAlias = 'testAlias';
    const saveSpy = sinon.spy(() => resolve());
    user.save = saveSpy;
    wait().then(() => {
      click('.alias-editor .one-label').then(() => {
        fillIn('.alias-editor input', newAlias).then(() => {
          click('.alias-editor .save-icon').then(() => {
            expect(saveSpy).to.be.calledOnce;
            expect(this.$('.alias-editor').text().trim())
              .to.equal(user.get('alias'));
            expect(user.get('alias')).to.equal(newAlias);
            done();
          });
        });
      });
    });
  });
});
