import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { set } from '@ember/object';
import { click, fillIn } from 'ember-native-dom-helpers';
import $ from 'jquery';
import { registerService, lookupService } from '../../../helpers/stub-service';
import Service from '@ember/service';
import sinon from 'sinon';
import { setProperties } from '@ember/object';

describe('Integration | Component | sidebar tokens/token item', function () {
  setupComponentTest('sidebar-tokens/token-item', {
    integration: true,
  });

  beforeEach(function () {
    this.set('token', {
      name: 'some token',
      isActive: true,
      hasDirtyAttributes: true,
      save() {},
    });
    registerService(this, 'token-actions', TokenActionsStub);
    registerService(this, 'navigation-state', NavigationStateStub);
  });

  it('shows token name', function () {
    this.render(hbs `{{sidebar-tokens/token-item item=token}}`);

    expect(this.$('.token-name')).to.contain(this.get('token.name'));
  });

  it('shows "invitation" icon for invite token', function () {
    set(this.get('token'), 'typeName', 'invite');

    this.render(hbs `{{sidebar-tokens/token-item item=token}}`);

    expect(this.$('.oneicon-token-invite')).to.exist;
  });

  it('shows "access-token" icon for access token', function () {
    set(this.get('token'), 'typeName', 'access');

    this.render(hbs `{{sidebar-tokens/token-item item=token}}`);

    expect(this.$('.oneicon-token-access')).to.exist;
  });

  it('shows "tokens" icon for unknown token', function () {
    set(this.get('token'), 'typeName', undefined);

    this.render(hbs `{{sidebar-tokens/token-item item=token}}`);

    expect(this.$('.oneicon-tokens')).to.exist;
  });

  it('shows "revoked" text for revoked token', function () {
    setProperties(this.get('token'), {
      isActive: false,
      revoked: true,
    });

    this.render(hbs `{{sidebar-tokens/token-item item=token}}`);

    expect(this.$('.sidebar-item-title-upper')).to.contain(this.get('token.name'));
    expect(this.$('.sidebar-item-title-lower')).to.contain('revoked');
  });

  it('shows "expired" text for expired token', function () {
    setProperties(this.get('token'), {
      isActive: false,
      isObsolete: true,
    });

    this.render(hbs `{{sidebar-tokens/token-item item=token}}`);

    expect(this.$('.sidebar-item-title-upper')).to.contain(this.get('token.name'));
    expect(this.$('.sidebar-item-title-lower')).to.contain('expired');
  });

  it('shows "expired" text for expired and revoked token', function () {
    setProperties(this.get('token'), {
      isActive: false,
      isObsolete: true,
      revoked: true,
    });

    this.render(hbs `{{sidebar-tokens/token-item item=token}}`);

    expect(this.$('.sidebar-item-title-upper')).to.contain(this.get('token.name'));
    expect(this.$('.sidebar-item-title-lower')).to.contain('expired');
    expect(this.$('.sidebar-item-title-lower')).to.not.contain('revoked');
  });

  it('does not add class "inactive-token" when token is active', function () {
    this.render(hbs `{{sidebar-tokens/token-item item=token}}`);

    expect(this.$('.token-item')).not.to.have.class('inactive-token');
  });

  it('adds class "inactive-token" when token is not active', function () {
    set(this.get('token'), 'isActive', false);

    this.render(hbs `{{sidebar-tokens/token-item item=token}}`);

    expect(this.$('.token-item')).to.have.class('inactive-token');
  });

  it('renders actions in dots menu', function () {
    this.render(hbs `{{sidebar-tokens/token-item item=token}}`);
    return click('.token-menu-trigger')
      .then(() => {
        const popoverContent = $('body .webui-popover.in');
        [
          '.remove-token-action-trigger',
          '.rename-token-action-trigger',
        ].forEach(actionSelector =>
          expect(popoverContent.find(actionSelector)).to.exist
        );
      });
  });

  it('does not render actions menu if inSidenav is true', function () {
    this.render(hbs `{{sidebar-tokens/token-item item=token inSidenav=true}}`);

    expect(this.$('.token-menu-trigger')).to.not.exist;
  });

  it('allows to rename token through "Rename" action', function () {
    const token = this.get('token');
    const saveStub = sinon.stub(token, 'save').resolves();

    this.render(hbs `{{sidebar-tokens/token-item item=token}}`);

    return click('.token-menu-trigger')
      .then(() => {
        const renameTrigger =
          $('body .webui-popover.in .rename-token-action-trigger')[0];
        return click(renameTrigger);
      })
      .then(() => fillIn('.token-name .form-control', 'newName'))
      .then(() => click('.token-name .save-icon'))
      .then(() => {
        const $tokenNameNode = this.$('.token-name');
        expect($tokenNameNode).to.contain('newName');
        expect($tokenNameNode).to.not.have.class('editor');
        expect(saveStub).to.be.calledOnce;
      });
  });

  it('allows to remove token through "Remove" action', function () {
    const token = this.get('token');
    const tokenActions = lookupService(this, 'token-actions');
    const deleteTokenStub = sinon.stub(tokenActions, 'deleteToken')
      .withArgs(token)
      .resolves();
    const navigationState = lookupService(this, 'navigation-state');
    // to avoid redirecting after delete
    sinon.stub(navigationState, 'resourceCollectionContainsId').resolves(true);

    this.render(hbs `{{sidebar-tokens/token-item item=token}}`);
    return click('.token-menu-trigger')
      .then(() => {
        const removeTrigger =
          $('body .webui-popover.in .remove-token-action-trigger')[0];
        return click(removeTrigger);
      })
      .then(() => {
        const removeProceed = $('body .remove-token-modal.in .proceed')[0];
        return click(removeProceed);
      })
      .then(() => {
        expect(deleteTokenStub).to.be.calledWith(token);
      });
  });

  it('allows to cancel opened "Remove" proceed modal', function () {
    const tokenActions = lookupService(this, 'token-actions');
    const deleteTokenSpy = sinon.spy(tokenActions, 'deleteToken');

    this.render(hbs `{{sidebar-tokens/token-item item=token}}`);
    return click('.token-menu-trigger')
      .then(() => {
        const removeTrigger =
          $('body .webui-popover.in .remove-token-action-trigger')[0];
        return click(removeTrigger);
      })
      .then(() => {
        const removeCancel = $('body .remove-token-modal.in .cancel')[0];
        return click(removeCancel);
      })
      .then(() => {
        expect(deleteTokenSpy).to.not.be.called;
        expect($('body .remove-token-modal.in')).to.not.exist;
      });
  });
});

const TokenActionsStub = Service.extend({
  deleteToken() {},
});

const NavigationStateStub = Service.extend({
  activeResource: Object.freeze({
    id: 'someId',
  }),

  resourceCollectionContainsId() {},
});
