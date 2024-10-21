import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import ModifyTokenAction from 'onezone-gui/utils/token-actions/modify-token-action';
import { get } from '@ember/object';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';
import { reject, resolve } from 'rsvp';

describe('Integration | Utility | token-actions/modify-token-action', function () {
  const { afterEach } = setupRenderingTest();

  afterEach(function () {
    this.action?.destroy();
  });

  it('executes modifying token (success scenario)', function () {
    const tokenDiff = {
      name: 'token2',
      revoked: false,
    };
    const token = {
      name: 'token1',
      revoked: true,
      save: sinon.stub().callsFake(() => {
        if (token.name === tokenDiff.name && token.revoked === tokenDiff.revoked) {
          return resolve();
        }
      }),
    };
    this.action = ModifyTokenAction.create({
      ownerSource: this.owner,
      context: {
        token,
        tokenDiff,
      },
    });
    const successNotifySpy = sinon.spy(
      lookupService(this, 'global-notify'),
      'success'
    );

    return this.action.execute()
      .then(actionResult => {
        expect(token.save).to.be.calledOnce;
        expect(token.name).to.equal('token2');
        expect(token.revoked).to.equal(false);
        expect(successNotifySpy).to.be.calledWith(
          sinon.match.has('string', 'Token has been modified successfully.')
        );
        expect(get(actionResult, 'status')).to.equal('done');
        expect(get(actionResult, 'result')).to.equal(token);
      });
  });

  it('executes modifying token (failure scenario)', function () {
    const tokenDiff = {
      name: 'token2',
      revoked: false,
    };
    const token = {
      name: 'token1',
      revoked: true,
      save: sinon.stub().callsFake(() => {
        if (token.name === tokenDiff.name && token.revoked === tokenDiff.revoked) {
          return reject('error');
        }
      }),
      rollbackAttributes() {
        token.name = 'token1';
        token.revoked = true;
      },
    };
    this.action = ModifyTokenAction.create({
      ownerSource: this.owner,
      context: {
        token,
        tokenDiff,
      },
    });
    const failureNotifySpy = sinon.spy(
      lookupService(this, 'global-notify'),
      'backendError'
    );

    return this.action.execute()
      .then(actionResult => {
        expect(token.name).to.equal('token1');
        expect(token.revoked).to.equal(true);
        expect(failureNotifySpy).to.be.calledWith(
          sinon.match.has('string', 'modifying token'),
          'error'
        );
        expect(get(actionResult, 'status')).to.equal('failed');
        expect(get(actionResult, 'error')).to.equal('error');
      });
  });
});
