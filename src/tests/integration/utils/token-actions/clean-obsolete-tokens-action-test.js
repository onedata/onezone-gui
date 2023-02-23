import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import CleanObsoleteTokensAction from 'onezone-gui/utils/token-actions/clean-obsolete-tokens-action';
import { get, getProperties } from '@ember/object';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';
import { reject, resolve } from 'rsvp';
import {
  getModal,
  getModalBody,
  getModalFooter,
} from '../../../helpers/modal';

describe('Integration | Utility | token-actions/clean-obsolete-tokens-action', function () {
  setupRenderingTest();

  beforeEach(function () {
    const tokens = [{
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
    }];
    this.setProperties({
      tokens,
      context: {
        collection: tokens,
        visibleCollection: tokens,
      },
    });
  });

  it('has correct className, icon and title', function () {
    const action = CleanObsoleteTokensAction.create({
      ownerSource: this.owner,
      context: this.get('context'),
    });

    const {
      className,
      icon,
      title,
    } = getProperties(action, 'className', 'icon', 'title');
    expect(className).to.equal('clean-obsolete-tokens-trigger');
    expect(icon).to.equal('clean-filled');
    expect(String(title)).to.equal('Clean up obsolete tokens');
  });

  it('has correct tip when there is something to clean', function () {
    const action = CleanObsoleteTokensAction.create({
      ownerSource: this.owner,
      context: this.get('context'),
    });

    expect(String(get(action, 'tip'))).to.equal('Clean up obsolete tokens');
  });

  it('has correct tip when there is nothing to clean', function () {
    const action = CleanObsoleteTokensAction.create({
      ownerSource: this.owner,
    });

    expect(String(get(action, 'tip')))
      .to.equal('Clean up obsolete tokens (nothing to clean)');
  });

  it('is disabled when there are no tokens to remove', function () {
    const tokens = this.get('tokens').setEach('isObsolete', false);
    const action = CleanObsoleteTokensAction.create({
      ownerSource: this.owner,
      context: {
        collection: tokens,
      },
    });

    expect(get(action, 'disabled')).to.be.true;
  });

  it('is enabled when there are tokens to remove', function () {
    const action = CleanObsoleteTokensAction.create({
      ownerSource: this.owner,
      context: this.get('context'),
    });

    expect(get(action, 'disabled')).to.be.false;
  });

  it('shows modal on execute', async function () {
    const action = CleanObsoleteTokensAction.create({
      ownerSource: this.owner,
      context: this.get('context'),
    });

    await render(hbs `{{global-modal-mounter}}`);
    action.execute();
    await settled();

    expect(getModal()).to.have.class('clean-obsolete-tokens-modal');
  });

  it('passes only obsolete tokens to modal', async function () {
    const action = CleanObsoleteTokensAction.create({
      ownerSource: this.owner,
      context: this.get('context'),
    });

    await render(hbs `{{global-modal-mounter}}`);
    action.execute();
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
    const action = CleanObsoleteTokensAction.create({
      ownerSource: this.owner,
      context: {
        collection: tokens,
        visibleCollection: tokens.slice(0, 2),
      },
    });

    await render(hbs `{{global-modal-mounter}}`);
    action.execute();
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
      collection: tokens,
      visibleCollection: undefined,
    };
    const action = CleanObsoleteTokensAction.create({
      ownerSource: this.owner,
      context,
    });

    await render(hbs `{{global-modal-mounter}}`);
    action.execute();
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

  it(
    'returns promise with cancelled ActionResult after execute() and modal close using "Cancel"',
    async function () {
      const action = CleanObsoleteTokensAction.create({
        ownerSource: this.owner,
        context: this.get('context'),
      });

      await render(hbs `{{global-modal-mounter}}`);
      const resultPromise = action.execute();
      await settled();

      await click(getModalFooter().querySelector('.remove-tokens-cancel'));
      const actionResult = await resultPromise;
      expect(get(actionResult, 'status')).to.equal('cancelled');
    }
  );

  it('executes removing selected tokens on submit (success scenario)', async function () {
    const tokens = this.get('tokens');
    const action = CleanObsoleteTokensAction.create({
      ownerSource: this.owner,
      context: this.get('context'),
    });
    const tokenManager = lookupService(this, 'token-manager');
    const reloadTokensSpy = sinon.stub(tokenManager, 'reloadList').resolves();
    let reloadCalledAfterRemove = true;
    const deleteTokenStub = sinon
      .stub(tokenManager, 'deleteToken')
      .callsFake(() => {
        if (reloadTokensSpy.called) {
          reloadCalledAfterRemove = false;
        }
        return resolve();
      });
    const successNotifySpy = sinon.spy(
      lookupService(this, 'global-notify'),
      'success'
    );

    await render(hbs `{{global-modal-mounter}}`);
    const actionResultPromise = action.execute();
    await settled();

    await click(getModalFooter().querySelector('.remove-tokens-submit'));
    const actionResult = await actionResultPromise;
    expect(deleteTokenStub).to.be.calledThrice;
    tokens.filterBy('isObsolete').forEach(token =>
      expect(deleteTokenStub).to.be.calledWith(get(token, 'id'))
    );
    expect(reloadTokensSpy).to.be.calledOnce;
    expect(reloadCalledAfterRemove).to.be.true;
    expect(successNotifySpy).to.be.calledWith(
      sinon.match.has('string', 'Selected tokens have been removed.')
    );
    expect(get(actionResult, 'status')).to.equal('done');
  });

  it(
    'executes removing selected tokens on submit (remove failure scenario)',
    async function () {
      const action = CleanObsoleteTokensAction.create({
        ownerSource: this.owner,
        context: this.get('context'),
      });
      const tokenManager = lookupService(this, 'token-manager');
      const reloadTokensSpy = sinon.stub(tokenManager, 'reloadList').resolves();
      let reloadCalledAfterRemove = true;
      sinon
        .stub(tokenManager, 'deleteToken')
        .callsFake(() => {
          if (reloadTokensSpy.called) {
            reloadCalledAfterRemove = false;
          }
          return reject('error');
        });
      const failureNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'backendError'
      );

      await render(hbs `{{global-modal-mounter}}`);
      const actionResultPromise = action.execute();
      await settled();

      await click(getModalFooter().querySelector('.remove-tokens-submit'));
      const actionResult = await actionResultPromise;
      expect(reloadTokensSpy).to.be.calledOnce;
      expect(reloadCalledAfterRemove).to.be.true;

      expect(failureNotifySpy).to.be.calledWith(
        sinon.match.has('string', 'removing tokens'),
        'error'
      );
      const {
        status,
        error,
      } = getProperties(actionResult, 'status', 'error');
      expect(status).to.equal('failed');
      expect(error).to.equal('error');
    }
  );

  it(
    'executes removing selected tokens on submit (reload failure scenario)',
    async function () {
      const action = CleanObsoleteTokensAction.create({
        ownerSource: this.owner,
        context: this.get('context'),
      });
      const tokenManager = lookupService(this, 'token-manager');
      sinon.stub(tokenManager, 'reloadList').callsFake(() => reject('error'));
      sinon.stub(tokenManager, 'deleteToken').resolves();
      const failureNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'backendError'
      );

      await render(hbs `{{global-modal-mounter}}`);
      const actionResultPromise = action.execute();
      await settled();

      await click(getModalFooter().querySelector('.remove-tokens-submit'));
      const actionResult = await actionResultPromise;
      expect(failureNotifySpy).to.be.calledWith(
        sinon.match.has('string', 'removing tokens'),
        'error'
      );
      const {
        status,
        error,
      } = getProperties(actionResult, 'status', 'error');
      expect(status).to.equal('failed');
      expect(error).to.equal('error');
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
