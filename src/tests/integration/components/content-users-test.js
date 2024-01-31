import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { registerService } from '../../helpers/stub-service';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { resolve } from 'rsvp';
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
        iconPath: '/test/google.svg',
        iconBackgroundColor: '#fff',
      },
      {
        id: 'github',
        displayName: 'GitHub',
        iconPath: '/test/github.svg',
        iconBackgroundColor: '#123',
      },
    ];
  },
});

describe('Integration | Component | content-users', function () {
  setupRenderingTest();

  beforeEach(function () {
    registerService(this, 'linkedAccountManager', linkedAccountManagerStub);
    registerService(this, 'authorizerManager', authorizerManagerStub);

    const MOCKED_USER = EmberObject.create({
      fullName: 'some name',
      username: 'some login',
      entityId: 'user_id',
      basicAuthEnabled: true,
    });
    this.set('user', MOCKED_USER);
  });

  it('renders full name', async function () {
    await render(hbs `{{content-users user=user}}`);

    expect(find('.full-name-editor'))
      .to.have.trimmed.text(this.get('user.fullName'));
  });

  it('renders username', async function () {
    await render(hbs `{{content-users user=user}}`);

    expect(find('.username-editor'))
      .to.have.trimmed.text(this.get('user.username'));
  });

  it('renders copiable user id', async function () {
    await render(hbs `{{content-users user=user}}`);

    expect(find('.user-id-clipboard-line input'))
      .to.have.value(this.get('user.entityId'));
  });

  it('renders linked account', async function () {
    await render(hbs `{{content-users user=user}}`);

    expect(find('.google-account'), 'google-account').to.exist;
    expect(
      find('.google-account .account-type'), 'Google+ text'
    ).to.have.trimmed.text('Google+');
    expect(
      find('.google-account .account-email'), 'email text'
    ).to.have.trimmed.text('one@one.one');
  });

  it('allows to change display name', async function () {
    await render(hbs `{{content-users user=user}}`);
    const user = this.get('user');
    const newName = 'testName';
    const saveSpy = sinon.spy(() => resolve());
    user.save = saveSpy;

    await click('.full-name-editor .one-label');
    await fillIn('.full-name-editor input', newName);
    await click('.full-name-editor .save-icon');
    expect(saveSpy).to.be.calledOnce;
    expect(find('.full-name-editor'))
      .to.have.trimmed.text(user.get('fullName'));
    expect(user.get('fullName')).to.equal(newName);
  });

  it('allows to change username', async function () {
    await render(hbs `{{content-users user=user}}`);
    const user = this.get('user');
    const newUsername = 'testUsername';
    const saveSpy = sinon.spy(() => resolve());
    user.save = saveSpy;

    await click('.username-editor .one-label');
    await fillIn('.username-editor input', newUsername);
    await click('.username-editor .save-icon');
    expect(saveSpy).to.be.calledOnce;
    expect(find('.username-editor'))
      .to.have.trimmed.text(user.get('username'));
    expect(user.get('username')).to.equal(newUsername);
  });

  it('renders password section for user with basicAuth enabled', async function () {
    await render(hbs `{{content-users user=user}}`);

    expect(find('.change-password-row .one-inline-editor')).to.exist;
  });

  it(
    'does not render password section for user with basicAuth disabled',
    async function () {
      this.set('user.basicAuthEnabled', false);
      await render(hbs `{{content-users user=user}}`);

      expect(find('.change-password-row .one-inline-editor')).to.not.exist;
    }
  );
});
