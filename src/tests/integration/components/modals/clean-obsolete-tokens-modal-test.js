import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../../helpers/stub-service';
import {
  getModal,
  getModalHeader,
  getModalBody,
  getModalFooter,
} from '../../../helpers/modal';
import { click } from 'ember-native-dom-helpers';
import { Promise, resolve } from 'rsvp';
import sinon from 'sinon';

describe('Integration | Component | modals/clean obsolete tokens modal', function () {
  setupComponentTest('modals/clean-obsolete-tokens-modal', {
    integration: true,
  });

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
      name: 'access token 1',
      typeName: 'access',
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
          const $modal = getModal();
          const $modalHeader = getModalHeader();
          const $modalBody = getModalBody();
          const $modalFooter = getModalFooter();
          expect($modal).to.have.class('clean-obsolete-tokens-modal');
          expect($modalHeader.find('h1').text().trim())
            .to.equal('Clean up obsolete tokens');
          expect($modalBody.find('.description').text().trim()).to.equal(
            'All tokens that have expired or reached their usage limit are listed below. Select which of them should be removed:',
          );
          expect($modalFooter.find('.remove-tokens-submit').text().trim())
            .to.equal('Remove');
          expect($modalFooter.find('.remove-tokens-cancel').text().trim())
            .to.equal('Cancel');
        });
    }
  );

  it(
    'renders sections "Access tokens" and "Invitation tokens"',
    function () {
      return showModal(this)
        .then(() => {
          const $modalBody = getModalBody();
          const $accessTokensSection = $modalBody.find('.access-tokens-list');
          const $inviteTokensSection = $modalBody.find('.invite-tokens-list');

          expect($accessTokensSection).to.exist;
          expect($inviteTokensSection).to.exist;
          expect($accessTokensSection.find('.header-text').text().trim())
            .to.equal('Access tokens');
          expect($inviteTokensSection.find('.header-text').text().trim())
            .to.equal('Invitation tokens');
        });
    }
  );

  it('renders collapsed token sections by default', function () {
    return showModal(this)
      .then(() => {
        const $modalBody = getModalBody();
        expect($modalBody.find('.access-tokens-list .checkbox-list-collapse'))
          .to.not.have.class('in');
        expect($modalBody.find('.invite-tokens-list .checkbox-list-collapse'))
          .to.not.have.class('in');
      });
  });

  it('renders passed list of tokens', function () {
    return showModal(this, true)
      .then(() => {
        const $accessTokenItems = getAccessTokenItems();
        const $inviteTokenItems = getInviteTokenItems();

        expect($accessTokenItems).to.have.length(1);
        expect($inviteTokenItems).to.have.length(2);
        expect($accessTokenItems.text().trim()).to.equal('access token 1');
        expect($inviteTokenItems.eq(0).text().trim()).to.equal('invite token 1');
        expect($inviteTokenItems.eq(1).text().trim()).to.equal('invite token 2');
      });
  });

  it('selects all tokens by default', function () {
    return showModal(this, true)
      .then(() => {
        const $modalBody = getModalBody();
        expect($modalBody.find('.one-checkbox:not(.checked)')).to.not.exist;
        // 3 token checkboxes + 2 section checkboxes
        expect($modalBody.find('.one-checkbox')).to.have.length(5);
      });
  });

  it('preselects tokens listed in selectedTokensToRemove', function () {
    this.set('modalOptions.selectedTokensToRemove', [this.get('tokens')[0]]);

    return showModal(this, true)
      .then(() => {
        const $modalBody = getModalBody();
        const $selectedCheckboxes = $modalBody.find('.one-checkbox.checked');
        expect($selectedCheckboxes).to.have.length(1);
        expect($selectedCheckboxes.parent().find('label').text().trim())
          .to.equal('invite token 1');
      });
  });

  it('responds to access token checkbox selection change', function () {
    return showModal(this, true)
      .then(() => click(getAccessTokenItems().eq(0).find('.one-checkbox')[0]))
      .then(() => {
        expect(getAccessTokenItems().eq(0).find('.one-checkbox'))
          .to.not.have.class('checked');
      });
  });

  it('responds to invite token checkbox selection change', function () {
    return showModal(this, true)
      .then(() => click(getInviteTokenItems().eq(0).find('.one-checkbox')[0]))
      .then(() => {
        expect(getInviteTokenItems().eq(0).find('.one-checkbox'))
          .to.not.have.class('checked');
      });
  });

  it('disables submit button when nothing is selected', function () {
    this.set('modalOptions.selectedTokensToRemove', []);

    return showModal(this)
      .then(() => {
        expect(getModalFooter().find('.remove-tokens-submit'))
          .to.have.attr('disabled');
      });
  });

  it('enables submit button when something is selected', function () {
    this.set('modalOptions.selectedTokensToRemove', [this.get('tokens')[0]]);

    return showModal(this)
      .then(() => {
        expect(getModalFooter().find('.remove-tokens-submit'))
          .to.not.have.attr('disabled');
      });
  });

  it('submits intially selected tokens', function () {
    const submitSpy = sinon.spy(function () {
      return new Promise(() => {});
    });
    this.set('modalOptions.onSubmit', submitSpy);

    let $submitButton;
    return showModal(this)
      .then(() => $submitButton = getModalFooter().find('.remove-tokens-submit'))
      .then(() => click($submitButton[0]))
      .then(() => {
        expect($submitButton).to.have.class('in-flight');
        expect(submitSpy.lastCall.args[0].toArray())
          .to.deep.equal(this.get('tokens').toArray());
      });
  });

  it('submits modified selected tokens', function () {
    const submitSpy = sinon.spy(function () {
      return new Promise(() => {});
    });
    this.set('modalOptions.onSubmit', submitSpy);

    let $submitButton;
    return showModal(this)
      .then(() => click(getAccessTokenItems().find('.one-checkbox')[0]))
      .then(() => $submitButton = getModalFooter().find('.remove-tokens-submit'))
      .then(() => click($submitButton[0]))
      .then(() => {
        expect($submitButton).to.have.class('in-flight');
        expect(submitSpy.lastCall.args[0].toArray())
          .to.deep.equal(this.get('tokens').slice(0, 2));
      });
  });
});

function showModal(testCase, expandTokens = false) {
  const {
    modalManager,
    modalOptions,
  } = testCase.getProperties('modalManager', 'modalOptions');

  testCase.render(hbs `{{global-modal-mounter}}`);

  return modalManager
    .show('clean-obsolete-tokens-modal', modalOptions).shownPromise
    .then(() => expandTokens ? expandSections() : resolve());
}

function expandSections() {
  const $modalBody = getModalBody();
  return click($modalBody.find('.access-tokens-list .checkbox-list-header')[0])
    .then(() =>
      click($modalBody.find('.invite-tokens-list .checkbox-list-header')[0])
    );
}

function getAccessTokenItems() {
  return getModalBody().find('.access-tokens-list .checkbox-list-item');
}

function getInviteTokenItems() {
  return getModalBody().find('.invite-tokens-list .checkbox-list-item');
}
