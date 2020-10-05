import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { click, fillIn } from 'ember-native-dom-helpers';
import { lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { Promise } from 'rsvp';

describe('Integration | Component | content tokens', function () {
  setupComponentTest('content-tokens', {
    integration: true,
  });

  beforeEach(function () {
    this.set('token', {
      name: 'token name',
      revoked: false,
    });
  });

  it('has class content-tokens', function () {
    this.render(hbs `{{content-tokens}}`);

    expect(this.$('.content-tokens')).to.exist;
  });

  it('shows token name in header', function () {
    this.render(hbs `{{content-tokens token=token}}`);

    expect(this.$('h1 .token-name').text().trim())
      .to.equal(this.get('token.name'));
  });

  it('shows modify action trigger', function () {
    this.render(hbs `{{content-tokens token=token}}`);

    const $trigger = this.$('.edit-token-action-btn').eq(0);
    expect($trigger).to.exist;
    expect($trigger.text().trim()).to.equal('Modify');
    expect($trigger.find('.one-icon')).to.have.class('oneicon-rename');
    expect($trigger.parents('.one-collapsible-toolbar-item.disabled')).to.not.exist;
  });

  it('shows token editor component in view mode with token data', function () {
    this.render(hbs `{{content-tokens token=token}}`);

    return wait()
      .then(() => {
        expect(this.$('.token-editor')).to.have.class('view-mode');
        // Not have to test other fields - we only need to check if token is passed to
        // token-editor component. Token data rendering is deeply tested in token-editor tests.
        expect(this.$('.name-field').text()).to.contain('token name');
      });
  });

  it('changes mode to "edit" after clicking "Modify" button', function () {
    this.render(hbs `{{content-tokens token=token}}`);

    return click('.edit-token-action-btn')
      .then(() => {
        expect(this.$('.token-editor')).to.have.class('edit-mode');
        const $trigger = this.$('.edit-token-action-btn').eq(0);
        expect($trigger.parents('.one-collapsible-toolbar-item.disabled')).to.exist;
      });
  });

  it(
    'passess token and diff object to ModifyTokenAction instance and executes it',
    function () {
      const tokenActions = lookupService(this, 'token-actions');
      const modifyTokenAction = {
        execute: sinon.stub().resolves({ status: 'done' }),
      };
      const createModifyTokenActionStub =
        sinon.stub(tokenActions, 'createModifyTokenAction')
        .returns(modifyTokenAction);

      this.render(hbs `{{content-tokens token=token}}`);

      return click('.edit-token-action-btn')
        .then(() => fillIn('.name-field input', 'token2'))
        .then(() => click('.revoked-field .one-way-toggle'))
        .then(() => click('.submit-token'))
        .then(() => {
          expect(createModifyTokenActionStub).to.be.calledOnce;
          expect(createModifyTokenActionStub).to.be.calledWith(sinon.match({
            token: this.get('token'),
            tokenDiff: sinon.match({
              name: 'token2',
              revoked: true,
            }),
          }));
          expect(modifyTokenAction.execute).to.be.calledOnce;
        });
    }
  );

  it(
    'token editor form is blocked until ModifyTokenAction execution is done',
    function () {
      let resolveSubmit;
      const tokenActions = lookupService(this, 'token-actions');
      const modifyTokenAction = {
        execute: sinon.stub()
          .returns(new Promise(resolve => resolveSubmit = resolve)),
      };
      sinon.stub(tokenActions, 'createModifyTokenAction')
        .returns(modifyTokenAction);

      this.render(hbs `{{content-tokens token=token}}`);

      return click('.edit-token-action-btn')
        .then(() => click('.submit-token'))
        .then(() => {
          expect(this.$('.submit-token [role="progressbar"]')).to.exist;
          resolveSubmit({ status: 'done' });
          return wait();
        })
        .then(() =>
          expect(this.$('.submit-token [role="progressbar"]')).to.not.exist
        );
    }
  );

  it(
    'comes back to view mode after successful token modification',
    function () {
      const tokenActions = lookupService(this, 'token-actions');
      const modifyTokenAction = {
        execute: sinon.stub().resolves({ status: 'done' }),
      };
      sinon.stub(tokenActions, 'createModifyTokenAction')
        .returns(modifyTokenAction);

      this.render(hbs `{{content-tokens token=token}}`);

      return click('.edit-token-action-btn')
        .then(() => click('.submit-token'))
        .then(() =>
          expect(this.$('.token-editor')).to.have.class('view-mode')
        );
    }
  );

  it(
    'stays in edit mode after failed token modification',
    function () {
      const tokenActions = lookupService(this, 'token-actions');
      const modifyTokenAction = {
        execute: sinon.stub().resolves({ status: 'failed' }),
      };
      sinon.stub(tokenActions, 'createModifyTokenAction')
        .returns(modifyTokenAction);

      this.render(hbs `{{content-tokens token=token}}`);

      return click('.edit-token-action-btn')
        .then(() => click('.submit-token'))
        .then(() =>
          expect(this.$('.token-editor')).to.have.class('edit-mode')
        );
    }
  );

  it(
    'comes back to view mode after clicking "cancel" and rollbacks all changes',
    function () {
      this.render(hbs `{{content-tokens token=token}}`);

      return click('.edit-token-action-btn')
        .then(() => fillIn('.name-field input', 'test'))
        .then(() => click('.revoked-field .one-way-toggle'))
        .then(() => click('.cancel-edition'))
        .then(() => {
          expect(this.$('.token-editor')).to.have.class('view-mode');
          expect(this.$('.name-field').text()).to.contain('token name');
          expect(this.$('.revoked-field .one-way-toggle')).to.not.have.class('checked');
        });
    }
  );

  it(
    'comes back to view mode when is in edit mode and token instance has changed',
    function () {
      this.render(hbs `{{content-tokens token=token}}`);

      return click('.edit-token-action-btn')
        .then(() => {
          this.set('token', {
            name: 'another token',
          });
          return wait();
        })
        .then(() => {
          expect(this.$('.token-editor')).to.have.class('view-mode');
          const $trigger = this.$('.edit-token-action-btn').eq(0);
          expect($trigger.parents('.one-collapsible-toolbar-item.disabled')).to.not.exist;
        });
    }
  );
});
