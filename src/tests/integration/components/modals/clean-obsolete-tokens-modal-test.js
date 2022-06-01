import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../../helpers/stub-service';
import {
  getModal,
  getModalHeader,
  getModalBody,
  getModalFooter,
} from '../../../helpers/modal';
import { Promise } from 'rsvp';
import sinon from 'sinon';

describe('Integration | Component | modals/clean obsolete tokens modal', function () {
  setupRenderingTest();

  beforeEach(function () {
    const tokens = [{
      name: 'invite token 1',
      typeName: 'invite',
      isObsolete: true,
    }, {
      name: 'invite token 2',
      typeName: 'invite',
      isObsolete: true,
    }, {
      name: 'invite token 3',
      typeName: 'invite',
      isObsolete: true,
    }, {
      name: 'access token 1',
      typeName: 'access',
      isObsolete: true,
    }, {
      name: 'identity token 1',
      typeName: 'identity',
      isObsolete: true,
    }, {
      name: 'identity token 2',
      typeName: 'identity',
      isObsolete: true,
    }];
    this.setProperties({
      modalManager: lookupService(this, 'modal-manager'),
      tokens,
      modalOptions: {
        tokensToRemove: tokens,
      },
    });
  });

  it('renders modal with class "clean-obsolete-tokens-modal", correct header and footer',
    function () {
      return showModal(this)
        .then(() => {
          const modal = getModal();
          const modalHeader = getModalHeader();
          const modalBody = getModalBody();
          const modalFooter = getModalFooter();
          expect(modal).to.have.class('clean-obsolete-tokens-modal');
          expect(modalHeader.querySelector('h1'))
            .to.have.trimmed.text('Clean up obsolete tokens');
          expect(modalBody.querySelector('.description')).to.have.trimmed.text(
            'All tokens that have expired or reached their usage limit are listed below. Select which of them should be removed:',
          );
          expect(modalFooter.querySelector('.remove-tokens-submit'))
            .to.have.trimmed.text('Remove');
          expect(modalFooter.querySelector('.remove-tokens-cancel'))
            .to.have.trimmed.text('Cancel');
        });
    }
  );

  it(
    'renders sections "Access tokens", "Identity tokens" and "Invitation tokens"',
    function () {
      return showModal(this)
        .then(() => {
          const modalBody = getModalBody();
          const accessTokensSection = modalBody.querySelector('.access-tokens-list');
          const identityTokensSection = modalBody.querySelector('.identity-tokens-list');
          const inviteTokensSection = modalBody.querySelector('.invite-tokens-list');

          expect(accessTokensSection).to.exist;
          expect(identityTokensSection).to.exist;
          expect(inviteTokensSection).to.exist;
          expect(accessTokensSection.querySelector('.header-text'))
            .to.have.trimmed.text('Access tokens');
          expect(identityTokensSection.querySelector('.header-text'))
            .to.have.trimmed.text('Identity tokens');
          expect(inviteTokensSection.querySelector('.header-text'))
            .to.have.trimmed.text('Invitation tokens');
        });
    }
  );

  it('renders collapsed token sections by default', function () {
    return showModal(this)
      .then(() => {
        const modalBody = getModalBody();
        expect(modalBody.querySelector('.access-tokens-list .checkbox-list-collapse'))
          .to.not.have.class('in');
        expect(modalBody.querySelector('.identity-tokens-list .checkbox-list-collapse'))
          .to.not.have.class('in');
        expect(modalBody.querySelector('.invite-tokens-list .checkbox-list-collapse'))
          .to.not.have.class('in');
      });
  });

  it('renders passed list of tokens', function () {
    return showModal(this, true)
      .then(() => {
        const accessTokenItems = getAccessTokenItems();
        const identityTokenItems = getIdentityTokenItems();
        const inviteTokenItems = getInviteTokenItems();

        expect(accessTokenItems).to.have.length(1);
        expect(identityTokenItems).to.have.length(2);
        expect(inviteTokenItems).to.have.length(3);
        expect(accessTokenItems[0]).to.have.trimmed.text('access token 1');
        expect(identityTokenItems[0]).to.have.trimmed.text('identity token 1');
        expect(identityTokenItems[1]).to.have.trimmed.text('identity token 2');
        expect(inviteTokenItems[0]).to.have.trimmed.text('invite token 1');
        expect(inviteTokenItems[1]).to.have.trimmed.text('invite token 2');
        expect(inviteTokenItems[2]).to.have.trimmed.text('invite token 3');
      });
  });

  it('selects all tokens by default', function () {
    return showModal(this, true)
      .then(() => {
        const modalBody = getModalBody();
        expect(modalBody.querySelector('.one-checkbox:not(.checked)')).to.not.exist;
        // 6 token checkboxes + 3 section checkboxes
        expect(modalBody.querySelectorAll('.one-checkbox')).to.have.length(9);
      });
  });

  it('preselects tokens listed in selectedTokensToRemove', function () {
    this.set('modalOptions.selectedTokensToRemove', [this.get('tokens')[0]]);

    return showModal(this, true)
      .then(() => {
        const modalBody = getModalBody();
        const selectedCheckboxes = modalBody.querySelectorAll('.one-checkbox.checked');
        expect(selectedCheckboxes).to.have.length(1);
        expect(selectedCheckboxes[0].parentElement.querySelector('label'))
          .to.have.trimmed.text('invite token 1');
      });
  });

  it('responds to access token checkbox selection change', function () {
    return showModal(this, true)
      .then(() => click(getAccessTokenItems()[0].querySelector('.one-checkbox')))
      .then(() => {
        expect(getAccessTokenItems()[0].querySelector('.one-checkbox'))
          .to.not.have.class('checked');
      });
  });

  it('responds to identity token checkbox selection change', function () {
    return showModal(this, true)
      .then(() => click(getIdentityTokenItems()[0].querySelector('.one-checkbox')))
      .then(() => {
        expect(getIdentityTokenItems()[0].querySelector('.one-checkbox'))
          .to.not.have.class('checked');
      });
  });

  it('responds to invite token checkbox selection change', function () {
    return showModal(this, true)
      .then(() => click(getInviteTokenItems()[0].querySelector('.one-checkbox')))
      .then(() => {
        expect(getInviteTokenItems()[0].querySelector('.one-checkbox'))
          .to.not.have.class('checked');
      });
  });

  it('disables submit button when nothing is selected', function () {
    this.set('modalOptions.selectedTokensToRemove', []);

    return showModal(this)
      .then(() => {
        expect(getModalFooter().querySelector('.remove-tokens-submit'))
          .to.have.attr('disabled');
      });
  });

  it('enables submit button when something is selected', function () {
    this.set('modalOptions.selectedTokensToRemove', [this.get('tokens')[0]]);

    return showModal(this)
      .then(() => {
        expect(getModalFooter().querySelector('.remove-tokens-submit'))
          .to.not.have.attr('disabled');
      });
  });

  it('submits intially selected tokens', function () {
    const submitStub = sinon.stub().returns(new Promise(() => {}));
    this.set('modalOptions.onSubmit', submitStub);

    let submitButton;
    return showModal(this)
      .then(() => submitButton = getModalFooter().querySelector('.remove-tokens-submit'))
      .then(() => click(submitButton))
      .then(() => {
        expect(submitButton).to.have.class('pending');
        expect(submitStub.lastCall.args[0]).to.have.same.members(this.get('tokens'));
      });
  });

  it('submits modified selected tokens', function () {
    const submitStub = sinon.stub().returns(new Promise(() => {}));
    this.set('modalOptions.onSubmit', submitStub);
    const tokens = this.get('tokens');

    let submitButton;
    return showModal(this)
      .then(() => click(getAccessTokenItems()[0].querySelector('.one-checkbox')))
      .then(() => submitButton = getModalFooter().querySelector('.remove-tokens-submit'))
      .then(() => click(submitButton))
      .then(() => {
        expect(submitButton).to.have.class('pending');
        expect(submitStub.lastCall.args[0])
          .to.have.same.members(tokens.without(tokens[3]));
      });
  });

  it('closes modal on cancel click', function () {
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');

    return showModal(this)
      .then(() => {
        expect(onHideSpy).to.not.been.called;
        return click(getModalFooter().querySelector('.remove-tokens-cancel'));
      })
      .then(() => expect(onHideSpy).to.be.calledOnce);
  });

  it('closes modal on backdrop click', function () {
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');

    return showModal(this)
      .then(() => click(getModal()))
      .then(() => expect(onHideSpy).to.be.calledOnce);
  });

  it('disables cancel button when submitting', function () {
    const submitStub = sinon.stub().returns(new Promise(() => {}));
    this.set('modalOptions.onSubmit', submitStub);

    return showModal(this)
      .then(() => click(getModalFooter().querySelector('.remove-tokens-submit')))
      .then(() =>
        expect(getModalFooter().querySelector('.remove-tokens-cancel'))
        .to.have.attr('disabled')
      );
  });

  it('does not close modal on backdrop click when submitting', function () {
    const submitStub = sinon.stub().returns(new Promise(() => {}));
    this.set('modalOptions.onSubmit', submitStub);
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');

    return showModal(this)
      .then(() => click(getModalFooter().querySelector('.remove-tokens-submit')))
      .then(() => click(getModal()))
      .then(() => expect(onHideSpy).to.not.be.called);
  });
});

async function showModal(testCase, expandTokens = false) {
  const {
    modalManager,
    modalOptions,
  } = testCase.getProperties('modalManager', 'modalOptions');

  await render(hbs `{{global-modal-mounter}}`);

  await modalManager
    .show('clean-obsolete-tokens-modal', modalOptions).shownPromise;
  if (expandTokens) {
    await expandSections();
  }
}

function expandSections() {
  const modalBody = getModalBody();
  return click(modalBody.querySelector('.access-tokens-list .checkbox-list-header'))
    .then(() =>
      click(modalBody.querySelector('.invite-tokens-list .checkbox-list-header'))
    );
}

function getAccessTokenItems() {
  return getModalBody().querySelectorAll('.access-tokens-list .checkbox-list-item');
}

function getIdentityTokenItems() {
  return getModalBody().querySelectorAll('.identity-tokens-list .checkbox-list-item');
}

function getInviteTokenItems() {
  return getModalBody().querySelectorAll('.invite-tokens-list .checkbox-list-item');
}
