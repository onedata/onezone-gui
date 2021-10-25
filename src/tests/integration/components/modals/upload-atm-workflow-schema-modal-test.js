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
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { resolve, Promise } from 'rsvp';
import { clickTrigger, selectChoose } from '../../../helpers/ember-power-select';
import { click, fillIn } from 'ember-native-dom-helpers';
import $ from 'jquery';
import { A } from '@ember/array';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';

describe('Integration | Component | modals/upload atm workflow schema modal',
  function () {
    setupComponentTest('modals,/upload-atm-workflow-schema-modal', {
      integration: true,
    });

    beforeEach(function () {
      const atmWorkflowSchemas = A([{
        name: 'wf0',
        originalAtmWorkflowSchemaId: undefined,
        revisionRegistry: {
          1: {},
        },
      }, {
        name: 'wf1',
        originalAtmWorkflowSchemaId: 'w1id',
        revisionRegistry: {
          1: {},
        },
      }, {
        name: 'wf2',
        originalAtmWorkflowSchemaId: 'w2id',
        revisionRegistry: {
          1: {},
        },
      }, {
        name: 'wf3',
        originalAtmWorkflowSchemaId: 'w1id',
        revisionRegistry: {
          1: {},
          3: {},
        },
      }]);
      const atmInventory = {
        atmWorkflowSchemaList: promiseObject(resolve({
          list: promiseArray(resolve(atmWorkflowSchemas)),
        })),
      };
      const onSubmit = sinon.spy(() => resolve());
      this.setProperties({
        modalManager: lookupService(this, 'modal-manager'),
        modalOptions: {
          atmInventory,
          onSubmit,
        },
        atmWorkflowSchemas,
        onSubmit,
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
        expect($modalBody.find('.details')).to.not.exist;
        expect($modalBody.find('.operation-form')).to.not.exist;
        const $submitBtn = $modalFooter.find('.submit-btn');
        const $cancelBtn = $modalFooter.find('.cancel-btn');
        expect($submitBtn).to.have.class('btn-primary');
        expect($submitBtn.text().trim()).to.equal('Apply');
        expect($submitBtn).to.be.disabled;
        expect($cancelBtn).to.have.class('btn-default');
        expect($cancelBtn.text().trim()).to.equal('Cancel');
      });

    it('shows workflow dump details and operation form after file upload',
      async function () {
        await showModal(this);
        const $modalBody = getModalBody();
        const dump = generateExampleDump();
        const filename = 'file.json';

        await triggerUploadInputChange(this, filename, JSON.stringify(dump));

        expect($modalBody.find('.uploader .filename').text().trim()).to.equal('file.json');
        expect($modalBody.find('.details .name').text().trim()).to.equal(dump.name);
        expect($modalBody.find('.option-merge input').prop('checked'))
          .to.equal(true);
        expect($modalBody
          .find('.targetWorkflow-field .dropdown-field-trigger')
          .text().trim()
        ).to.equal('wf1');
        expect($modalBody.find('.newWorkflowName-field .form-control'))
          .to.have.value('w1');
      });

    it('allows changing uploaded file to another one', async function () {
      await showModal(this);
      const $modalBody = getModalBody();
      const dump1 = generateExampleDump();
      const filename1 = 'file.json';
      const dump2 = generateExampleDump();
      dump2.name = 'w2';
      dump2.originalAtmWorkflowSchemaId = 'w2id';
      const filename2 = 'file2.json';

      await triggerUploadInputChange(this, filename1, JSON.stringify(dump1));
      await triggerUploadInputChange(this, filename2, JSON.stringify(dump2));

      expect($modalBody.find('.uploader .filename').text().trim()).to.equal('file2.json');
      expect($modalBody.find('.details .name').text().trim()).to.equal(dump2.name);
      expect($modalBody.find('.option-merge input').prop('checked'))
        .to.equal(true);
      expect($modalBody
        .find('.targetWorkflow-field .dropdown-field-trigger')
        .text().trim()
      ).to.equal('wf2');
      expect($modalBody.find('.newWorkflowName-field .form-control'))
        .to.have.value('w2');
    });

    it('shows workflow dump error and no operation form after invalid file upload',
      async function () {
        await showModal(this);
        const $modalBody = getModalBody();
        const dump = 'incorrect data';
        const filename = 'file.json';

        await triggerUploadInputChange(this, filename, JSON.stringify(dump));

        expect($modalBody.find('.uploader .filename').text().trim()).to.equal('file.json');
        expect($modalBody.find('.details .error')).to.exist;
        expect($modalBody.find('.operation-form')).to.not.exist;
      });

    it('allows changing target workflow', async function () {
      await showModal(this);
      const $modalBody = getModalBody();
      const dump = generateExampleDump();
      const filename = 'file.json';

      await triggerUploadInputChange(this, filename, JSON.stringify(dump));
      await clickTrigger('.targetWorkflow-field');
      const $options = $('.ember-power-select-option');
      expect($options).to.have.length(2);
      expect($options.eq(0).text().trim()).to.equal('wf1');
      expect($options.eq(1).text().trim()).to.equal('wf3');
      await selectChoose('.targetWorkflow-field', 'wf3');

      expect($modalBody
        .find('.targetWorkflow-field .dropdown-field-trigger')
        .text().trim()
      ).to.equal('wf3');
      expect($modalBody.find('.revision-conflict-warning')).to.exist;
    });

    it('allows changing operation and new workflow name', async function () {
      await showModal(this);
      const $modalBody = getModalBody();
      const dump = generateExampleDump();
      const filename = 'file.json';

      await triggerUploadInputChange(this, filename, JSON.stringify(dump));
      await click('.option-create');
      await fillIn('.newWorkflowName-field .form-control', 'xyz');

      expect($modalBody.find('.option-create input').prop('checked')).to.equal(true);
      expect($modalBody.find('.newWorkflowName-field .form-control')).to.have.value('xyz');
    });

    it('changes operation from "merge" to "create" when there are no target workflows available',
      async function () {
        await showModal(this);
        const $modalBody = getModalBody();
        const dump = generateExampleDump();
        await triggerUploadInputChange(this, 'file.json', JSON.stringify(dump));

        this.get('atmWorkflowSchemas').clear();
        await wait();

        expect($modalBody.find('.option-create input').prop('checked')).to.equal(true);
      });

    it('submits info about merging workflow dump', async function () {
      await showModal(this);
      const dump = generateExampleDump();
      await triggerUploadInputChange(this, 'file.json', JSON.stringify(dump));

      await click('.submit-btn');

      expect(this.get('onSubmit')).to.be.calledOnce.and.to.be.calledWith({
        atmWorkflowSchemaDump: dump,
        operation: 'merge',
        targetAtmWorkflowSchema: this.get('atmWorkflowSchemas.1'),
      });
    });

    it('submits info about creating new workflow from dump', async function () {
      await showModal(this);
      const dump = generateExampleDump();
      await triggerUploadInputChange(this, 'file.json', JSON.stringify(dump));

      await click('.option-create');
      await fillIn('.newWorkflowName-field .form-control', 'xyz');
      await click('.submit-btn');

      expect(this.get('onSubmit')).to.be.calledOnce.and.to.be.calledWith({
        atmWorkflowSchemaDump: dump,
        operation: 'create',
        newAtmWorkflowSchemaName: 'xyz',
      });
    });

    it('disallows submission when new workflow name is empty', async function () {
      await showModal(this);
      const dump = generateExampleDump();
      await triggerUploadInputChange(this, 'file.json', JSON.stringify(dump));

      await click('.option-create');
      await fillIn('.newWorkflowName-field .form-control', '');

      expect(this.$('.submit-btn')).to.be.disabled;
    });

    it('allows submission when new workflow name is empty but operation is "merge"',
      async function () {
        await showModal(this);
        const dump = generateExampleDump();
        await triggerUploadInputChange(this, 'file.json', JSON.stringify(dump));

        await click('.option-create');
        await fillIn('.newWorkflowName-field .form-control', '');
        await click('.option-merge');

        expect(this.$('.submit-btn')).to.be.not.disabled;
      });

    it('closes modal on cancel click', async function () {
      const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');
      await showModal(this);
      expect(onHideSpy).to.not.been.called;

      await click('.cancel-btn');
      expect(onHideSpy).to.be.calledOnce;
    });

    it('closes modal on backdrop click', async function () {
      const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');
      await showModal(this);

      await click(getModal()[0]);
      expect(onHideSpy).to.be.calledOnce;
    });

    it('disables cancel buttons and does not close modal on backdrop click when submitting via "save" button',
      async function () {
        this.set('modalOptions.onSubmit', () => new Promise(() => {}));
        const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');
        await showModal(this);
        const dump = generateExampleDump();
        await triggerUploadInputChange(this, 'file.json', JSON.stringify(dump));

        await click('.submit-btn');
        await click(getModal()[0]);

        expect(onHideSpy).to.not.be.called;
        expect(getModalFooter().find('.cancel-btn')).to.be.disabled;
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
