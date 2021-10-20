import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import { lookupService } from '../../../helpers/stub-service';
import hbs from 'htmlbars-inline-precompile';
import {
  getModal,
  getModalHeader,
  // getModalBody,
  getModalFooter,
} from '../../../helpers/modal';

describe('Integration | Component | modals/upload atm workflow schema modal',
  function () {
    setupComponentTest('modals,/upload-atm-workflow-schema-modal', {
      integration: true,
    });

    beforeEach(function () {
      this.setProperties({
        modalManager: lookupService(this, 'modal-manager'),
        modalOptions: {},
      });
    });

    it('renders modal with class "upload-atm-workflow-schema-modal" and correct content',
      async function () {
        await showModal(this);

        const $modal = getModal();
        const $modalHeader = getModalHeader();
        // const $modalBody = getModalBody();
        const $modalFooter = getModalFooter();

        expect($modal).to.have.class('upload-atm-workflow-schema-modal');
        expect($modalHeader.find('h1').text().trim()).to.equal('Upload workflow');
        const $submitBtn = $modalFooter.find('.submit-btn');
        const $cancelBtn = $modalFooter.find('.cancel-btn');
        expect($submitBtn).to.have.class('btn-primary');
        expect($submitBtn.text().trim()).to.equal('Apply');
        expect($submitBtn).to.be.disabled;
        expect($cancelBtn).to.have.class('btn-default');
        expect($cancelBtn.text().trim()).to.equal('Cancel');
      });
  });

async function showModal(testCase) {
  const {
    modalManager,
    modalOptions,
  } = testCase.getProperties('modalManager', 'modalOptions');

  testCase.render(hbs `{{global-modal-mounter}}`);

  await modalManager.show('upload-atm-workflow-schema-modal', modalOptions).shownPromise;
}
