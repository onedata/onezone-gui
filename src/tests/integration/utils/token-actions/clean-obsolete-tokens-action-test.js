import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import CleanObsoleteTokensAction from 'onezone-gui/utils/token-actions/clean-obsolete-tokens-action';
import { get, getProperties } from '@ember/object';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';
import wait from 'ember-test-helpers/wait';
import { click } from 'ember-native-dom-helpers';
import { reject, resolve } from 'rsvp';
import { getModal, getModalBody, getModalFooter } from '../../../helpers/modal';

describe('Integration | Util | token actions/clean obsolete tokens action', function () {
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
        collection: tokens,
        visibleCollection: tokens,
      },
    });
  });

  it('has correct classNames, icon and title', function () {
    const action = CleanObsoleteTokensAction.create({
      ownerSource: this,
      context: this.get('context'),
    });
    const {
      classNames,
      icon,
      title,
    } = getProperties(action, 'classNames', 'icon', 'title');

    expect(classNames).to.equal('clean-obsolete-tokens-trigger');
    expect(icon).to.equal('remove');
    expect(String(title)).to.equal('Clean up obsolete tokens');
  });

  it('has correct tip when there is something to clean', function () {
    const action = CleanObsoleteTokensAction.create({
      ownerSource: this,
      context: this.get('context'),
    });

    expect(String(get(action, 'tip'))).to.equal('Clean up obsolete tokens');
  });

  it('has correct tip when there is nothing to clean', function () {
    const action = CleanObsoleteTokensAction.create({
      ownerSource: this,
    });

    expect(String(get(action, 'tip')))
      .to.equal('Clean up obsolete tokens (nothing to clean)');
  });

  it('is disabled when there are no tokens to remove', function () {
    const tokens = this.get('tokens').setEach('isActive', true);
    const action = CleanObsoleteTokensAction.create({
      ownerSource: this,
      context: {
        collection: tokens,
      },
    });

    expect(get(action, 'disabled')).to.be.true;
  });

  it('is enabled when there are tokens to remove', function () {
    const action = CleanObsoleteTokensAction.create({
      ownerSource: this,
      context: this.get('context'),
    });

    expect(get(action, 'disabled')).to.be.false;
  });

  it('shows modal on execute', function () {
    const action = CleanObsoleteTokensAction.create({
      ownerSource: this,
      context: this.get('context'),
    });

    this.render(hbs `{{global-modal-mounter}}`);
    action.execute();

    return wait().then(() => {
      expect(getModal()).to.have.class('clean-obsolete-tokens-modal');
    });
  });

  it('passes only obsolete tokens to modal', function () {
    const action = CleanObsoleteTokensAction.create({
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
      collection: tokens,
      visibleCollection: tokens.slice(0, 2),
    };
    const action = CleanObsoleteTokensAction.create({
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
      collection: tokens,
      visibleCollection: undefined,
    };
    const action = CleanObsoleteTokensAction.create({
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
    const action = CleanObsoleteTokensAction.create({
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
    const successNotifySpy = sinon.spy(
      lookupService(this, 'global-notify'),
      'success'
    );

    this.render(hbs `{{global-modal-mounter}}`);
    const actionResultPromise = action.execute();

    return wait()
      .then(() => click(getModalFooter().find('.remove-tokens-submit')[0]))
      .then(() => actionResultPromise)
      .then(actionResult => {
        expect(deleteTokenStub).to.be.calledTwice;
        tokens.rejectBy('isActive').forEach(token =>
          expect(deleteTokenStub).to.be.calledWith(get(token, 'id'))
        );
        expect(reloadTokensSpy).to.be.calledOnce;
        expect(reloadCalledAfterRemove).to.be.true;
        expect(successNotifySpy).to.be.calledWith(
          sinon.match.has('string', 'Selected tokens has been removed.')
        );
        expect(get(actionResult, 'status')).to.equal('done');
      });
  });

  it(
    'executes removing selected tokens on submit (remove failure scenario)',
    function () {
      const action = CleanObsoleteTokensAction.create({
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
      const failureNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'backendError'
      );

      this.render(hbs `{{global-modal-mounter}}`);
      const actionResultPromise = action.execute();

      return wait()
        .then(() => click(getModalFooter().find('.remove-tokens-submit')[0]))
        .then(() => actionResultPromise)
        .then(actionResult => {
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
        });
    }
  );

  it(
    'executes removing selected tokens on submit (reload failure scenario)',
    function () {
      const action = CleanObsoleteTokensAction.create({
        ownerSource: this,
        context: this.get('context'),
      });
      const tokenManager = lookupService(this, 'token-manager');
      sinon.stub(tokenManager, 'reloadList').callsFake(() => reject('error'));
      sinon.stub(tokenManager, 'deleteToken').resolves();
      const failureNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'backendError'
      );

      this.render(hbs `{{global-modal-mounter}}`);
      const actionResultPromise = action.execute();

      return wait()
        .then(() => click(getModalFooter().find('.remove-tokens-submit')[0]))
        .then(() => actionResultPromise)
        .then(actionResult => {
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
        });
    }
  );
});
