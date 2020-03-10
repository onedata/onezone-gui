import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { lookupService } from '../../helpers/stub-service';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { resolve, Promise } from 'rsvp';
import wait from 'ember-test-helpers/wait';
import { fillIn, click } from 'ember-native-dom-helpers';

describe('Integration | Component | content tokens new', function () {
  this.timeout(15000);
  setupComponentTest('content-tokens-new', {
    integration: true,
  });

  beforeEach(function () {
    sinon.stub(lookupService(this, 'current-user'), 'getCurrentUserRecord')
      .resolves({ entityId: 'user1' });
    sinon.stub(lookupService(this, 'group-manager'), 'getGroups')
      .resolves({
        list: PromiseArray.create({
          promise: resolve([]),
        }),
      });
  });

  it('has class "content-tokens-new', function () {
    this.render(hbs `{{content-tokens-new}}`);

    return wait()
      .then(() => expect(this.$('.content-tokens-new')).to.exist);
  });

  it(
    'passess raw token to CreateTokenAction instance and executes it',
    function () {
      const tokenActions = lookupService(this, 'token-actions');
      const createTokenAction = {
        execute: sinon.stub().resolves(),
      };
      const createCreateTokenActionStub =
        sinon.stub(tokenActions, 'createCreateTokenAction')
        .returns(createTokenAction);

      this.render(hbs `{{content-tokens-new}}`);

      return wait()
        .then(() => fillIn('.name-field input', 'abc'))
        .then(() => click('.submit-token'))
        .then(() => {
          expect(createCreateTokenActionStub).to.be.calledOnce;
          expect(createCreateTokenActionStub).to.be.calledWith(sinon.match({
            rawToken: sinon.match({
              name: 'abc',
              type: sinon.match({
                accessToken: sinon.match({}),
              }),
            }),
          }));
          expect(createTokenAction.execute).to.be.calledOnce;
        });
    }
  );

  it(
    'token editor form is blocked until CreateTokenAction execution is done',
    function () {
      let resolveSubmit;
      const tokenActions = lookupService(this, 'token-actions');
      const createTokenAction = {
        execute: sinon.stub()
          .returns(new Promise(resolve => resolveSubmit = resolve)),
      };
      sinon.stub(tokenActions, 'createCreateTokenAction')
        .returns(createTokenAction);

      this.render(hbs `{{content-tokens-new}}`);

      return wait()
        .then(() => fillIn('.name-field input', 'abc'))
        .then(() => click('.submit-token'))
        .then(() => {
          expect(this.$('.submit-token [role="progressbar"]')).to.exist;
          resolveSubmit();
          return wait();
        })
        .then(() =>
          expect(this.$('.submit-token [role="progressbar"]')).to.not.exist
        );
    }
  );
});
