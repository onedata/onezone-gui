import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import CreateTokenAction from 'onezone-gui/utils/token-actions/create-token-action';
import { get } from '@ember/object';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';
import { reject, Promise } from 'rsvp';
import { next } from '@ember/runloop';

describe('Integration | Utility | token-actions/create-token-action', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('context', {
      rawToken: { name: 'token1' },
    });
  });

  it('executes creating token (success scenario)', function () {
    const action = CreateTokenAction.create({
      ownerSource: this.owner,
      context: this.get('context'),
    });
    const tokenManager = lookupService(this, 'token-manager');
    const router = lookupService(this, 'router');
    const rawToken = this.get('context.rawToken');
    const createdToken = {
      id: 'token.newTokenId.instance:private',
    };
    const createTokenStub = sinon
      .stub(tokenManager, 'createToken')
      .withArgs(rawToken)
      .resolves(createdToken);
    const transitionToStub = sinon.stub(router, 'transitionTo')
      .resolves();
    const successNotifySpy = sinon.spy(
      lookupService(this, 'global-notify'),
      'success'
    );

    return action.execute()
      .then(actionResult => {
        expect(createTokenStub).to.be.calledOnce;
        expect(createTokenStub).to.be.calledWith(rawToken);
        expect(successNotifySpy).to.be.calledWith(
          sinon.match.has('string', 'Token has been created successfully.')
        );
        expect(get(actionResult, 'status')).to.equal('done');
        expect(get(actionResult, 'result')).to.equal(createdToken);
        return new Promise(resolve => next(resolve));
      })
      .then(() => expect(transitionToStub).to.be.calledWith(
        'onedata.sidebar.content',
        'tokens',
        'newTokenId'
      ));
  });

  it('executes creating token (failure scenario)', function () {
    const action = CreateTokenAction.create({
      ownerSource: this.owner,
      context: this.get('context'),
    });
    const tokenManager = lookupService(this, 'token-manager');
    sinon
      .stub(tokenManager, 'createToken')
      .returns(reject('error'));
    const failureNotifySpy = sinon.spy(
      lookupService(this, 'global-notify'),
      'backendError'
    );

    return action.execute()
      .then(actionResult => {
        expect(failureNotifySpy).to.be.calledWith(
          sinon.match.has('string', 'creating token'),
          'error'
        );
        expect(get(actionResult, 'status')).to.equal('failed');
        expect(get(actionResult, 'error')).to.equal('error');
      });
  });
});
