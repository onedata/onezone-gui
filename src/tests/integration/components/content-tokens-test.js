import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, settled, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';
import { Promise } from 'rsvp';

describe('Integration | Component | content tokens', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('token', {
      name: 'token name',
      revoked: false,
    });
  });

  it('has class content-tokens', async function () {
    await render(hbs `{{content-tokens}}`);

    expect(find('.content-tokens')).to.exist;
  });

  it('shows token name in header', async function () {
    await render(hbs `{{content-tokens token=token}}`);

    expect(find('h1 .token-name'))
      .to.have.trimmed.text(this.get('token.name'));
  });

  it('shows modify action trigger', async function () {
    await render(hbs `{{content-tokens token=token}}`);

    const trigger = find('.edit-token-action-btn');
    expect(trigger).to.exist;
    expect(trigger).to.contain.text('Modify');
    expect(trigger.querySelector('.one-icon')).to.have.class('oneicon-rename');
    expect(trigger.closest('.one-collapsible-toolbar-item.disabled')).to.not.exist;
  });

  it('shows token editor component in view mode with token data', async function () {
    await render(hbs `{{content-tokens token=token}}`);

    expect(find('.token-editor')).to.have.class('view-mode');
    // Not have to test other fields - we only need to check if token is passed to
    // token-editor component. Token data rendering is deeply tested in token-editor tests.
    expect(find('.name-field')).to.contain.text('token name');
  });

  it('changes mode to "edit" after clicking "Modify" button', async function () {
    await render(hbs `{{content-tokens token=token}}`);

    await click('.edit-token-action-btn');
    expect(find('.token-editor')).to.have.class('edit-mode');
    const trigger = find('.edit-token-action-btn');
    expect(trigger.closest('.one-collapsible-toolbar-item.disabled')).to.exist;
  });

  it(
    'passess token and diff object to ModifyTokenAction instance and executes it',
    async function () {
      const tokenActions = lookupService(this, 'token-actions');
      const modifyTokenAction = {
        execute: sinon.stub().resolves({ status: 'done' }),
      };
      const createModifyTokenActionStub =
        sinon.stub(tokenActions, 'createModifyTokenAction')
        .returns(modifyTokenAction);

      await render(hbs `{{content-tokens token=token}}`);

      await click('.edit-token-action-btn');
      await fillIn('.name-field input', 'token2');
      await click('.revoked-field .one-way-toggle');
      await click('.submit-token');
      expect(createModifyTokenActionStub).to.be.calledOnce;
      expect(createModifyTokenActionStub).to.be.calledWith(sinon.match({
        token: this.get('token'),
        tokenDiff: sinon.match({
          name: 'token2',
          revoked: true,
        }),
      }));
      expect(modifyTokenAction.execute).to.be.calledOnce;
    }
  );

  it(
    'token editor form is blocked until ModifyTokenAction execution is done',
    async function () {
      let resolveSubmit;
      const tokenActions = lookupService(this, 'token-actions');
      const modifyTokenAction = {
        execute: sinon.stub()
          .returns(new Promise(resolve => resolveSubmit = resolve)),
      };
      sinon.stub(tokenActions, 'createModifyTokenAction')
        .returns(modifyTokenAction);

      await render(hbs `{{content-tokens token=token}}`);

      await click('.edit-token-action-btn');
      await click('.submit-token');
      expect(find('.submit-token [role="progressbar"]')).to.exist;
      resolveSubmit({ status: 'done' });
      await settled();
      expect(find('.submit-token [role="progressbar"]')).to.not.exist;
    }
  );

  it(
    'comes back to view mode after successful token modification',
    async function () {
      const tokenActions = lookupService(this, 'token-actions');
      const modifyTokenAction = {
        execute: sinon.stub().resolves({ status: 'done' }),
      };
      sinon.stub(tokenActions, 'createModifyTokenAction')
        .returns(modifyTokenAction);

      await render(hbs `{{content-tokens token=token}}`);

      await click('.edit-token-action-btn');
      await click('.submit-token');
      expect(find('.token-editor')).to.have.class('view-mode');
    }
  );

  it(
    'stays in edit mode after failed token modification',
    async function () {
      const tokenActions = lookupService(this, 'token-actions');
      const modifyTokenAction = {
        execute: sinon.stub().resolves({ status: 'failed' }),
      };
      sinon.stub(tokenActions, 'createModifyTokenAction')
        .returns(modifyTokenAction);

      await render(hbs `{{content-tokens token=token}}`);

      await click('.edit-token-action-btn');
      await click('.submit-token');
      expect(find('.token-editor')).to.have.class('edit-mode');
    }
  );

  it(
    'comes back to view mode after clicking "cancel" and rollbacks all changes',
    async function () {
      await render(hbs `{{content-tokens token=token}}`);

      await click('.edit-token-action-btn');
      await fillIn('.name-field input', 'test');
      await click('.revoked-field .one-way-toggle');
      await click('.cancel-edition');
      expect(find('.token-editor')).to.have.class('view-mode');
      expect(find('.name-field')).to.contain.text('token name');
      expect(find('.revoked-field .one-way-toggle')).to.not.have.class('checked');
    }
  );

  it(
    'comes back to view mode when is in edit mode and token instance has changed',
    async function () {
      await render(hbs `{{content-tokens token=token}}`);

      await click('.edit-token-action-btn');
      this.set('token', {
        name: 'another token',
      });
      await settled();
      expect(find('.token-editor')).to.have.class('view-mode');
      const trigger = find('.edit-token-action-btn');
      expect(trigger.closest('.one-collapsible-toolbar-item.disabled')).to.not.exist;
    }
  );
});
