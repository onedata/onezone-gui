import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import Service from '@ember/service';
import sinon from 'sinon';
import { registerService, lookupService } from '../../helpers/stub-service';

describe('Unit | Service | token actions', function () {
  setupTest('service:token-actions', {
    // Specify the other units that are required for this test.
    // needs: ['service:foo']
  });

  beforeEach(function () {
    registerService(this, 'global-notify', GlobalNotifyStub);
    registerService(this, 'token-manager', TokenManagerStub);
    registerService(this, 'i18n', I18nStub);
    registerService(this, 'gui-utils', Service);
    registerService(this, 'router', Service);
  });

  it('allows to delete token successfully', function () {
    const tokenId = 'tokenId';
    const token = {
      name: 'some name',
      id: tokenId,
    };
    const globalNotify = lookupService(this, 'global-notify');
    const successNotifySpy = sinon.spy(globalNotify, 'success');
    const errorNotifySpy = sinon.spy(globalNotify, 'backendError');

    const tokenManager = lookupService(this, 'token-manager');
    const deleteTokenStub = sinon.stub(tokenManager, 'deleteToken')
      .withArgs(tokenId).resolves();

    const i18n = lookupService(this, 'i18n');
    sinon.stub(i18n, 't')
      .withArgs('services.tokenActions.tokenRemoveSuccess')
      .returns('success');

    const service = this.subject();

    return service.deleteToken(token).finally(() => {
      expect(deleteTokenStub).to.be.calledWith(token.id);
      expect(successNotifySpy).to.be.calledWith('success');
      expect(errorNotifySpy).not.to.be.called;
    });
  });

  it('handles error when token cannot be deleted', function () {
    const tokenId = 'tokenId';
    const token = {
      name: 'some name',
      id: tokenId,
    };
    const globalNotify = lookupService(this, 'global-notify');
    const successNotifySpy = sinon.spy(globalNotify, 'success');
    const errorNotifySpy = sinon.spy(globalNotify, 'backendError');

    const tokenManager = lookupService(this, 'token-manager');
    const deleteTokenStub = sinon.stub(tokenManager, 'deleteToken')
      .withArgs(tokenId).rejects('err');

    const i18n = lookupService(this, 'i18n');
    sinon.stub(i18n, 't')
      .withArgs('services.tokenActions.removingToken')
      .returns('removing token');

    const service = this.subject();

    return service.deleteToken(token).catch(() => {}).finally(() => {
      expect(deleteTokenStub).to.be.calledWith(token.id);
      expect(successNotifySpy).not.to.be.called;
      expect(errorNotifySpy).to.be.calledWith(
        'removing token',
        sinon.match.instanceOf(Error).and(sinon.match.has('name', 'err'))
      );
    });
  });
});

const GlobalNotifyStub = Service.extend({
  backendError() {},
  success() {},
});

const TokenManagerStub = Service.extend({
  deleteToken() {},
});

const I18nStub = Service.extend({
  t() {},
});
