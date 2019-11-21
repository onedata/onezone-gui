import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import RemoveDisabledTokensAction from 'onezone-gui/utils/token-actions/remove-disabled-tokens-action';
import { get, getProperties } from '@ember/object';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';
import wait from 'ember-test-helpers/wait';
import { click } from 'ember-native-dom-helpers';
import { reject, resolve } from 'rsvp';
import { getModal, getModalBody, getModalFooter } from '../../../helpers/modal';

describe('Integration | Util | token actions/remove disabled tokens action', function () {
  setupComponentTest('global-modal-mounter', {
    integration: true,
  });

  beforeEach(function () {
    const tokens = [{
      name: 'access token 1',
      typeName: 'access',
      isActive: false,
    }, {
      name: 'access token 2',
      typeName: 'access',
      isActive: true,
    }, {
      name: 'invite token 1',
      typeName: 'invite',
      isActive: true,
    }, {
      name: 'invite token 2',
      typeName: 'invite',
      isActive: false,
    }];
    this.setProperties({
      tokens,
      context: {
        allTokens: tokens,
        visibleTokens: tokens,
      },
    });
  });

  it('is disabled when there are no tokens to remove', function () {
    const tokens = this.get('tokens').setEach('isActive', true);
    const action = RemoveDisabledTokensAction.create({
      ownerSource: this,
      context: {
        allTokens: tokens,
      },
    });

    expect(get(action, 'disabled')).to.be.true;
  });

  it('is enabled when there are tokens to remove', function () {
    const action = RemoveDisabledTokensAction.create({
      ownerSource: this,
      context: this.get('context'),
    });

    expect(get(action, 'disabled')).to.be.false;
  });

  it('shows modal on execute', function () {
    const action = RemoveDisabledTokensAction.create({
      ownerSource: this,
      context: this.get('context'),
    });

    this.render(hbs `{{global-modal-mounter}}`);
    action.execute();

    return wait().then(() => {
      expect(getModal()).to.have.class('remove-disabled-tokens-modal');
    });
  });

  it('passes only disabled tokens to modal', function () {
    const action = RemoveDisabledTokensAction.create({
      ownerSource: this,
      context: this.get('context'),
    });

    this.render(hbs `{{global-modal-mounter}}`);
    action.execute();

    return wait().then(() => {
      const $modalBody = getModalBody();
      const $accessTokens =
        $modalBody.find('.access-tokens-list .checkbox-list-item');
      const $inviteTokens =
        $modalBody.find('.invite-tokens-list .checkbox-list-item');

      expect($accessTokens).to.have.length(1);
      expect($accessTokens.text().trim()).to.equal('access token 1');
      expect($inviteTokens).to.have.length(1);
      expect($inviteTokens.text().trim()).to.equal('invite token 2');
    });
  });

  it('passes information about visible tokens to modal', function () {
    const tokens = this.get('tokens');
    const context = {
      allTokens: tokens,
      visibleTokens: tokens.slice(0, 2),
    };
    const action = RemoveDisabledTokensAction.create({
      ownerSource: this,
      context,
    });

    this.render(hbs `{{global-modal-mounter}}`);
    action.execute();

    return wait().then(() => {
      const $modalBody = getModalBody();
      const $accessTokens =
        $modalBody.find('.access-tokens-list .checkbox-list-item');
      const $inviteTokens =
        $modalBody.find('.invite-tokens-list .checkbox-list-item');

      expect($accessTokens).to.have.length(1);
      expect($accessTokens.text().trim()).to.equal('access token 1');
      expect($accessTokens.find('.one-checkbox')).to.have.class('checked');
      expect($inviteTokens).to.have.length(1);
      expect($inviteTokens.text().trim()).to.equal('invite token 2');
      expect($inviteTokens.find('.one-checkbox')).to.not.have.class('checked');
    });
  });

  it('marks all tokens as visible when visibility is not specified', function () {
    const tokens = this.get('tokens');
    const context = {
      allTokens: tokens,
      visibleTokens: undefined,
    };
    const action = RemoveDisabledTokensAction.create({
      ownerSource: this,
      context,
    });

    this.render(hbs `{{global-modal-mounter}}`);
    action.execute();

    return wait().then(() => {
      const $modalBody = getModalBody();
      const $accessTokens =
        $modalBody.find('.access-tokens-list .checkbox-list-item');
      const $inviteTokens =
        $modalBody.find('.invite-tokens-list .checkbox-list-item');

      expect($accessTokens).to.have.length(1);
      expect($accessTokens.text().trim()).to.equal('access token 1');
      expect($accessTokens.find('.one-checkbox')).to.have.class('checked');
      expect($inviteTokens).to.have.length(1);
      expect($inviteTokens.text().trim()).to.equal('invite token 2');
      expect($inviteTokens.find('.one-checkbox')).to.have.class('checked');
    });
  });

  it('executes removing selected tokens on submit (success scenario)', function () {
    const tokens = this.get('tokens');
    const action = RemoveDisabledTokensAction.create({
      ownerSource: this,
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

    this.render(hbs `{{global-modal-mounter}}`);
    const actionResultPromise = action.execute();

    return wait()
      .then(() => click(getModalFooter().find('.remove-tokens-submit')[0]))
      .then(() => actionResultPromise)
      .then(actionResult => {
        expect(deleteTokenStub).to.be.calledTwice;
        tokens.rejectBy('isActive').forEach(token =>
          expect(deleteTokenStub).to.be.calledWith(token)
        );
        expect(reloadTokensSpy).to.be.calledOnce;
        expect(reloadCalledAfterRemove).to.be.true;
        expect(get(actionResult, 'status')).to.equal('done');
      });
  });

  it(
    'executes removing selected tokens on submit (remove failure scenario)',
    function () {
      const action = RemoveDisabledTokensAction.create({
        ownerSource: this,
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

      this.render(hbs `{{global-modal-mounter}}`);
      const actionResultPromise = action.execute();

      return wait()
        .then(() => click(getModalFooter().find('.remove-tokens-submit')[0]))
        .then(() => actionResultPromise)
        .then(actionResult => {
          expect(reloadTokensSpy).to.be.calledOnce;
          expect(reloadCalledAfterRemove).to.be.true;

          const {
            status,
            error,
          } = getProperties(actionResult, 'status', 'error');
          expect(status).to.equal('failed');
          expect(error).to.equal('error');
        });
    }
  );

  it(
    'executes removing selected tokens on submit (reload failure scenario)',
    function () {
      const action = RemoveDisabledTokensAction.create({
        ownerSource: this,
        context: this.get('context'),
      });
      const tokenManager = lookupService(this, 'token-manager');
      sinon.stub(tokenManager, 'reloadList').callsFake(() => reject('error'));
      sinon.stub(tokenManager, 'deleteToken').resolves();

      this.render(hbs `{{global-modal-mounter}}`);
      const actionResultPromise = action.execute();

      return wait()
        .then(() => click(getModalFooter().find('.remove-tokens-submit')[0]))
        .then(() => actionResultPromise)
        .then(actionResult => {
          const {
            status,
            error,
          } = getProperties(actionResult, 'status', 'error');
          expect(status).to.equal('failed');
          expect(error).to.equal('error');
        });
    }
  );
});
