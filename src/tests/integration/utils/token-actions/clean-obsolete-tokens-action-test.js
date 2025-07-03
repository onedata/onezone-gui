import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import CleanObsoleteTokensAction from 'onezone-gui/utils/token-actions/clean-obsolete-tokens-action';
import { get, getProperties } from '@ember/object';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';
import { all as allFulfilled } from 'rsvp';
import {
  getModal,
  getModalBody,
  getModalFooter,
} from '../../../helpers/modal';
import { clearStoreAfterEach } from '../../../helpers/clear-store';
import _ from 'lodash';

describe('Integration | Utility | token-actions/clean-obsolete-tokens-action', function () {
  const { afterEach } = setupRenderingTest();

  beforeEach(async function () {
    const store = lookupService(this, 'store');
    const tokenPromises = [{
      name: 'access token 1',
      typeName: 'access',
      isObsolete: true,
    }, {
      name: 'access token 2',
      typeName: 'access',
      isObsolete: false,
    }, {
      name: 'identity token 1',
      typeName: 'identity',
      isObsolete: true,
    }, {
      name: 'identity token 2',
      typeName: 'identity',
      isObsolete: false,
    }, {
      name: 'invite token 1',
      typeName: 'invite',
      isObsolete: false,
    }, {
      name: 'invite token 2',
      typeName: 'invite',
      isObsolete: true,
    }].map(data => createToken(store, data));
    const tokens = await allFulfilled(tokenPromises);
    this.setProperties({
      tokens,
      context: {
        sortedCollection: tokens,
        visibleCollection: tokens,
      },
    });
  });

  afterEach(function () {
    this.action?.destroy();
  });

  clearStoreAfterEach(afterEach);

  it('has correct className, icon and title', function () {
    this.action = CleanObsoleteTokensAction.create({
      ownerSource: this.owner,
      context: this.get('context'),
    });

    const {
      className,
      icon,
      title,
    } = getProperties(this.action, 'className', 'icon', 'title');
    expect(className).to.equal('clean-obsolete-tokens-trigger');
    expect(icon).to.equal('clean-filled');
    expect(String(title)).to.equal('Clean up obsolete tokens');
  });

  it('has correct tip when there is something to clean', function () {
    this.action = CleanObsoleteTokensAction.create({
      ownerSource: this.owner,
      context: this.get('context'),
    });

    expect(String(get(this.action, 'tip'))).to.equal('Clean up obsolete tokens');
  });

  it('has correct tip when there is nothing to clean', function () {
    this.action = CleanObsoleteTokensAction.create({
      ownerSource: this.owner,
    });

    expect(String(get(this.action, 'tip')))
      .to.equal('Clean up obsolete tokens (nothing to clean)');
  });

  it('is disabled when there are no tokens to remove', async function () {
    await allFulfilled(this.tokens.map(async (token) => {
      token.set('caveats', []);
      await token.save();
    }));
    this.action = CleanObsoleteTokensAction.create({
      ownerSource: this.owner,
      context: {
        collection: this.tokens,
      },
    });

    expect(get(this.action, 'disabled')).to.be.true;
  });

  it('is enabled when there are tokens to remove', function () {
    this.action = CleanObsoleteTokensAction.create({
      ownerSource: this.owner,
      context: this.get('context'),
    });

    expect(get(this.action, 'disabled')).to.be.false;
  });

  it('shows modal on execute', async function () {
    this.action = CleanObsoleteTokensAction.create({
      ownerSource: this.owner,
      context: this.get('context'),
    });

    await render(hbs `<GlobalModalMounter />`);
    this.action.execute();
    await settled();

    expect(getModal()).to.have.class('clean-obsolete-tokens-modal');
  });

  it('passes only obsolete tokens to modal', async function () {
    this.action = CleanObsoleteTokensAction.create({
      ownerSource: this.owner,
      context: this.get('context'),
    });

    await render(hbs `<GlobalModalMounter />`);
    this.action.execute();
    await settled();

    const accessTokens = getAccessTokenItems();
    const identityTokens = getIdentityTokenItems();
    const inviteTokens = getInviteTokenItems();

    expect(accessTokens).to.have.length(1);
    expect(accessTokens[0]).to.have.trimmed.text('access token 1');
    expect(identityTokens).to.have.length(1);
    expect(identityTokens[0]).to.have.trimmed.text('identity token 1');
    expect(inviteTokens).to.have.length(1);
    expect(inviteTokens[0]).to.have.trimmed.text('invite token 2');
  });

  it('passes information about visible tokens to modal', async function () {
    const tokens = this.get('tokens');
    this.action = CleanObsoleteTokensAction.create({
      ownerSource: this.owner,
      context: {
        sortedCollection: tokens,
        visibleCollection: tokens.slice(0, 2),
      },
    });

    await render(hbs `<GlobalModalMounter />`);
    this.action.execute();
    await settled();

    const accessTokens = getAccessTokenItems();
    const identityTokens = getIdentityTokenItems();
    const inviteTokens = getInviteTokenItems();

    expect(accessTokens).to.have.length(1);
    expect(accessTokens[0]).to.have.trimmed.text('access token 1');
    expect(accessTokens[0].querySelector('.one-checkbox')).to.have.class('checked');
    expect(identityTokens).to.have.length(1);
    expect(identityTokens[0]).to.have.trimmed.text('identity token 1');
    expect(identityTokens[0].querySelector('.one-checkbox')).to.not.have.class('checked');
    expect(inviteTokens).to.have.length(1);
    expect(inviteTokens[0]).to.have.trimmed.text('invite token 2');
    expect(inviteTokens[0].querySelector('.one-checkbox')).to.not.have.class('checked');
  });

  it('marks all tokens as visible when visibility is not specified', async function () {
    const tokens = this.get('tokens');
    const context = {
      sortedCollection: tokens,
      visibleCollection: undefined,
    };
    this.action = CleanObsoleteTokensAction.create({
      ownerSource: this.owner,
      context,
    });

    await render(hbs `<GlobalModalMounter />`);
    this.action.execute();
    await settled();

    const accessTokens = getAccessTokenItems();
    const identityTokens = getIdentityTokenItems();
    const inviteTokens = getInviteTokenItems();

    expect(accessTokens).to.have.length(1);
    expect(accessTokens[0]).to.have.trimmed.text('access token 1');
    expect(accessTokens[0].querySelector('.one-checkbox')).to.have.class('checked');
    expect(identityTokens).to.have.length(1);
    expect(identityTokens[0]).to.have.trimmed.text('identity token 1');
    expect(identityTokens[0].querySelector('.one-checkbox')).to.have.class('checked');
    expect(inviteTokens).to.have.length(1);
    expect(inviteTokens[0]).to.have.trimmed.text('invite token 2');
    expect(inviteTokens[0].querySelector('.one-checkbox')).to.have.class('checked');
  });

  it('returns promise with cancelled ActionResult after execute() and modal close using "Cancel"',
    async function () {
      this.action = CleanObsoleteTokensAction.create({
        ownerSource: this.owner,
        context: this.get('context'),
      });

      await render(hbs `<GlobalModalMounter />`);
      const resultPromise = this.action.execute();
      await settled();

      await click(getModalFooter().querySelector('.remove-tokens-cancel'));
      const actionResult = await resultPromise;
      expect(get(actionResult, 'status')).to.equal('cancelled');
    }
  );

  it('executes removing selected tokens on submit (success scenario)', async function () {
    this.action = CleanObsoleteTokensAction.create({
      ownerSource: this.owner,
      context: this.get('context'),
    });
    const tokenManager = lookupService(this, 'token-manager');
    const reloadTokensSpy = sinon.stub(tokenManager, 'reloadList').resolves();
    const successNotifySpy = sinon.spy(
      lookupService(this, 'global-notify'),
      'success'
    );
    const destroySpies = this.tokens.map(token => sinon.spy(token, 'destroyRecord'));
    const tokenDestroyers = _.zip(this.tokens, destroySpies);

    await render(hbs `<GlobalModalMounter />`);
    const actionResultPromise = this.action.execute();
    await settled();

    await click(getModalFooter().querySelector('.remove-tokens-submit'));
    const actionResult = await actionResultPromise;
    for (const [token, destroySpy] of tokenDestroyers) {
      if (token.isObsolete) {
        expect(destroySpy).to.have.been.calledOnce;
      } else {
        expect(destroySpy).to.not.have.been.called;
      }
    }
    expect(reloadTokensSpy).to.be.calledOnce;
    expect(successNotifySpy).to.be.calledWith(
      sinon.match.has('string', 'Selected tokens have been removed.')
    );
    expect(get(actionResult, 'status')).to.equal('done');
  });

  it('executes removing selected tokens on submit (remove failure scenario)',
    async function () {
      this.action = CleanObsoleteTokensAction.create({
        ownerSource: this.owner,
        context: this.get('context'),
      });
      const tokenManager = lookupService(this, 'token-manager');
      const reloadTokensSpy = sinon.stub(tokenManager, 'reloadList').resolves();
      const obsoleteToken = this.tokens.find(token => token.isObsolete);
      const destroyError = new Error('mock destroy error');
      sinon.stub(obsoleteToken, 'destroyRecord').rejects(destroyError);
      const failureNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'backendError'
      );

      await render(hbs `<GlobalModalMounter />`);
      const actionResultPromise = this.action.execute();
      await settled();

      await click(getModalFooter().querySelector('.remove-tokens-submit'));
      const actionResult = await actionResultPromise;
      expect(reloadTokensSpy).to.be.calledOnce;

      expect(failureNotifySpy).to.be.calledWith(
        sinon.match.has('string', 'removing tokens'),
        destroyError
      );
      const { status, error } = actionResult;
      expect(status).to.equal('failed');
      expect(error).to.equal(destroyError);
    }
  );

  it('executes removing selected tokens on submit (reload failure scenario)',
    async function () {
      this.action = CleanObsoleteTokensAction.create({
        ownerSource: this.owner,
        context: this.get('context'),
      });
      const tokenManager = lookupService(this, 'token-manager');
      const reloadError = new Error('mock reload error');
      sinon.stub(tokenManager, 'reloadList').rejects(reloadError);
      const failureNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'backendError'
      );

      await render(hbs `<GlobalModalMounter />`);
      const actionResultPromise = this.action.execute();
      await settled();

      await click(getModalFooter().querySelector('.remove-tokens-submit'));
      const actionResult = await actionResultPromise;
      expect(failureNotifySpy).to.be.calledWith(
        sinon.match.has('string', 'removing tokens'),
        reloadError
      );
      const { status, error } = actionResult;
      expect(status).to.equal('failed');
      expect(error).to.equal(reloadError);
    }
  );
});

function getAccessTokenItems() {
  return getModalBody().querySelectorAll('.access-tokens-list .checkbox-list-item');
}

function getIdentityTokenItems() {
  return getModalBody().querySelectorAll('.identity-tokens-list .checkbox-list-item');
}

function getInviteTokenItems() {
  return getModalBody().querySelectorAll('.invite-tokens-list .checkbox-list-item');
}

async function createToken(store, { name, typeName, isObsolete }) {
  let type;
  switch (typeName) {
    case 'access':
      type = { accessToken: {} };
      break;
    case 'identity':
      type = { identityToken: {} };
      break;
    case 'invite':
      type = { inviteToken: {} };
      break;
    default:
      break;
  }
  const caveats = [];
  if (isObsolete) {
    caveats.push({ type: 'time', validUntil: 0 });
  }
  return await store.createRecord('token', {
    name,
    type,
    caveats,
  }).save();
}
