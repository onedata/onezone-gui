import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import { lookupService } from '../../../helpers/stub-service';
import hbs from 'htmlbars-inline-precompile';
import {
  getModal,
  getModalHeader,
  getModalBody,
  getModalFooter,
} from '../../../helpers/modal';
import {
  triggerUploadInputChange,
  generateExampleDump,
} from './upload-atm-workflow-schema-modal/uploader-test';

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
        const $modalBody = getModalBody();
        const $modalFooter = getModalFooter();

        expect($modal).to.have.class('upload-atm-workflow-schema-modal');
        expect($modalHeader.find('h1').text().trim()).to.equal('Upload workflow');
        expect($modalBody.find('.uploader')).to.exist;
        expect($modalBody.find('.uploader .filename')).to.not.exist;
        expect($modalBody.find('.details')).to.not.exist;
        const $submitBtn = $modalFooter.find('.submit-btn');
        const $cancelBtn = $modalFooter.find('.cancel-btn');
        expect($submitBtn).to.have.class('btn-primary');
        expect($submitBtn.text().trim()).to.equal('Apply');
        expect($submitBtn).to.be.disabled;
        expect($cancelBtn).to.have.class('btn-default');
        expect($cancelBtn.text().trim()).to.equal('Cancel');
      });

    it('shows workflow dump details after file upload', async function () {
      await showModal(this);
      const $modalBody = getModalBody();
      const dump = generateExampleDump();
      const filename = 'file.json';

      await triggerUploadInputChange(this, filename, JSON.stringify(dump));

      expect($modalBody.find('.uploader .filename').text().trim()).to.equal('file.json');
      expect($modalBody.find('.details .name').text().trim()).to.equal(dump.name);
    });

    it('allows changing uploaded file to another one', async function () {
      await showModal(this);
      const $modalBody = getModalBody();
      const dump1 = generateExampleDump();
      const filename1 = 'file.json';
      const dump2 = generateExampleDump();
      dump2.name = 'w2';
      const filename2 = 'file2.json';

      await triggerUploadInputChange(this, filename1, JSON.stringify(dump1));
      await triggerUploadInputChange(this, filename2, JSON.stringify(dump2));

      expect($modalBody.find('.uploader .filename').text().trim()).to.equal('file2.json');
      expect($modalBody.find('.details .name').text().trim()).to.equal(dump2.name);
    });

    it('shows workflow dump error after invalid file upload', async function () {
      await showModal(this);
      const $modalBody = getModalBody();
      const dump = 'incorrect data';
      const filename = 'file.json';

      await triggerUploadInputChange(this, filename, JSON.stringify(dump));

      expect($modalBody.find('.uploader .filename').text().trim()).to.equal('file.json');
      expect($modalBody.find('.details .error')).to.exist;
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
