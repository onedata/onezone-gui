import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, settled, find } from '@ember/test-helpers';
import { lookupService } from '../../../helpers/stub-service';
import { hbs } from 'ember-cli-htmlbars';
import {
  getModal,
  getModalHeader,
  getModalBody,
  getModalFooter,
} from '../../../helpers/modal';
import generateAtmWorkflowSchemaDump from '../../../helpers/workflows/generate-atm-workflow-schema-dump';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { resolve, Promise } from 'rsvp';
import { clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';
import { A } from '@ember/array';
import sinon from 'sinon';
import ObjectProxy from '@ember/object/proxy';

describe('Integration | Component | modals/apply atm workflow schema dump modal',
  function () {
    setupRenderingTest();

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
      const atmInventory1 = {
        name: 'inv1',
        atmWorkflowSchemaList: promiseObject(resolve({
          list: promiseArray(resolve(atmWorkflowSchemas)),
        })),
      };
      const atmInventory2 = {
        name: 'inv2',
        atmWorkflowSchemaList: promiseObject(resolve({
          list: promiseArray(resolve([])),
        })),
      };
      const atmInventories = [atmInventory1, atmInventory2];
      const onSubmit = sinon.spy(() => resolve());
      sinon.stub(lookupService(this, 'record-manager'), 'getUserRecordList')
        .resolves({ list: promiseArray(resolve(atmInventories)) });
      const dump = generateAtmWorkflowSchemaDump();
      const dumpSourceProxy = ObjectProxy.create({
        content: {
          name: 'file.json',
          dump,
        },
      });
      this.setProperties({
        modalManager: lookupService(this, 'modal-manager'),
        modalOptions: {
          initialAtmInventory: atmInventory1,
          dumpSourceType: 'upload',
          dumpSourceProxy,
          onSubmit,
        },
        atmInventories,
        atmWorkflowSchemas,
        onSubmit,
        dump,
        dumpSourceProxy,
      });
    });

    context('when "dumpSourceType" is "upload"', function () {
      beforeEach(function () {
        this.set('modalOptions.dumpSourceType', 'upload');
      });

      itShowsModalWithContent();

      it('allows changing uploaded file to another one', async function () {
        await showModal(this);
        const modalBody = getModalBody();

        const dump2 = generateAtmWorkflowSchemaDump();
        dump2.name = 'w2';
        dump2.originalAtmWorkflowSchemaId = 'w2id';

        this.set('dumpSourceProxy.content', {
          name: 'file2.json',
          dump: dump2,
        });
        await settled();

        expect(modalBody.querySelector('.upload-details .filename'))
          .to.have.trimmed.text('file2.json');
        expect(modalBody.querySelector('.dump-details .name'))
          .to.have.trimmed.text(dump2.name);
        expect(modalBody.querySelector('.option-merge input'))
          .to.have.property('checked', true);
        expect(modalBody
          .querySelector('.targetWorkflow-field .dropdown-field-trigger')
        ).to.have.trimmed.text('wf2');
        expect(modalBody.querySelector('.newWorkflowName-field .form-control'))
          .to.have.value('w2');
      });

      itShowsWorkflowDumpError();
      itAllowsChangingTargetWorkflow();
      itAllowsChangingOperationAndNewWorkflowName();
      itChangesOperationToCreateOnEmptyTargetWorkflows();
      itSubmitsMergingWorkflowDump();
      itSubmitsCreatingWorkflow();
      itBlocksSubmitWhenWorkflowNameEmpty();
      itDoesntBlockSubmitWnehWorkflowNameIsEmptyInMerge();
      itClosesModal();
      itBlocksControlsAndCloseWhenSubmitting();
    });

    context('when "dumpSourceType" is "duplication"', function () {
      beforeEach(function () {
        this.set('modalOptions.dumpSourceType', 'duplication');
      });

      itShowsModalWithContent();
      itShowsWorkflowDumpError();

      it('allows changing target inventory', async function () {
        await showModal(this);
        const modalBody = getModalBody();

        await clickTrigger('.targetAtmInventory-field');
        const options = document.querySelectorAll('.ember-power-select-option');
        expect(options).to.have.length(2);
        expect(options[0]).to.have.trimmed.text('inv1');
        expect(options[1]).to.have.trimmed.text('inv2');
        await selectChoose('.targetAtmInventory-field', 'inv2');

        expect(modalBody
          .querySelector('.targetAtmInventory-field .dropdown-field-trigger')
        ).to.have.trimmed.text('inv2');
        expect(modalBody.querySelector('.no-target-workflow-warning')).to.exist;
        expect(modalBody.querySelector('.option-create input'))
          .to.have.property('checked', true);
      });

      itAllowsChangingTargetWorkflow();
      itAllowsChangingOperationAndNewWorkflowName();
      itChangesOperationToCreateOnEmptyTargetWorkflows();
      itSubmitsMergingWorkflowDump();
      itSubmitsCreatingWorkflow();
      itBlocksSubmitWhenWorkflowNameEmpty();
      itDoesntBlockSubmitWnehWorkflowNameIsEmptyInMerge();
      itClosesModal();
      itBlocksControlsAndCloseWhenSubmitting();
    });
  });

async function showModal(testCase) {
  const {
    modalManager,
    modalOptions,
  } = testCase.getProperties('modalManager', 'modalOptions');

  await render(hbs `{{global-modal-mounter}}`);

  await modalManager.show('apply-atm-workflow-schema-dump-modal', modalOptions)
    .shownPromise;
}

function itShowsModalWithContent() {
  it('renders modal with class "apply-atm-workflow-schema-dump-modal" and correct content',
    async function () {
      const isUploadMode = this.get('modalOptions.dumpSourceType') === 'upload';
      const expectedTitle = isUploadMode ? 'Upload workflow' : 'Duplicate revision';
      const dump = this.get('dump');
      await showModal(this);

      const modal = getModal();
      const modalHeader = getModalHeader();
      const modalBody = getModalBody();
      const modalFooter = getModalFooter();

      expect(modal).to.have.class('apply-atm-workflow-schema-dump-modal');
      expect(modalHeader.querySelector('h1')).to.have.trimmed.text(expectedTitle);
      if (isUploadMode) {
        expect(modalBody.querySelector('.upload-details .filename'))
          .to.have.trimmed.text('file.json');
      } else {
        expect(modalBody.querySelector('.upload-details')).to.not.exist;
      }
      expect(modalBody.querySelector('.dump-details')).to.exist;
      expect(modalBody.querySelector('.dump-details .name'))
        .to.have.trimmed.text(dump.name);
      if (isUploadMode) {
        expect(modalBody.querySelector('.inventory-selector')).to.not.exist;
      } else {
        expect(modalBody
          .querySelector('.targetAtmInventory-field .dropdown-field-trigger')
        ).to.have.trimmed.text('inv1');
      }
      expect(modalBody.querySelector('.operation-form')).to.exist;
      expect(modalBody.querySelector('.option-merge input'))
        .to.have.property('checked', true);
      expect(modalBody
        .querySelector('.targetWorkflow-field .dropdown-field-trigger')
      ).to.have.trimmed.text('wf1');
      expect(modalBody.querySelector('.newWorkflowName-field .form-control'))
        .to.have.value('w1');
      const submitBtn = modalFooter.querySelector('.submit-btn');
      const cancelBtn = modalFooter.querySelector('.cancel-btn');
      expect(submitBtn).to.have.class('btn-primary');
      expect(submitBtn).to.have.trimmed.text('Apply');
      expect(cancelBtn).to.have.class('btn-default');
      expect(cancelBtn).to.have.trimmed.text('Cancel');
    });
}

function itShowsWorkflowDumpError() {
  it('shows workflow dump error and no forms when dump is corrupted',
    async function () {
      const isUploadMode = this.get('modalOptions.dumpSourceType') === 'upload';
      this.set('dumpSourceProxy.content.dump', null);
      await showModal(this);
      const modalBody = getModalBody();

      if (isUploadMode) {
        expect(modalBody.querySelector('.upload-details .filename'))
          .to.have.trimmed.text('file.json');
      }
      expect(modalBody.querySelector('.dump-details .error')).to.exist;
      expect(modalBody.querySelector('.inventory-selector')).to.not.exist;
      expect(modalBody.querySelector('.operation-form')).to.not.exist;
    });
}

function itAllowsChangingTargetWorkflow() {
  it('allows changing target workflow', async function () {
    await showModal(this);
    const modalBody = getModalBody();

    await clickTrigger('.targetWorkflow-field');
    const options = document.querySelectorAll('.ember-power-select-option');
    expect(options).to.have.length(2);
    expect(options[0]).to.have.trimmed.text('wf1');
    expect(options[1]).to.have.trimmed.text('wf3');
    await selectChoose('.targetWorkflow-field', 'wf3');

    expect(modalBody
      .querySelector('.targetWorkflow-field .dropdown-field-trigger')
    ).to.have.trimmed.text('wf3');
    expect(modalBody.querySelector('.revision-conflict-warning')).to.exist;
  });
}

function itAllowsChangingOperationAndNewWorkflowName() {
  it('allows changing operation and new workflow name', async function () {
    await showModal(this);
    const modalBody = getModalBody();

    await click('.option-create');
    await fillIn('.newWorkflowName-field .form-control', 'xyz');

    expect(modalBody.querySelector('.option-create input'))
      .to.have.property('checked', true);
    expect(modalBody.querySelector('.newWorkflowName-field .form-control'))
      .to.have.value('xyz');
  });
}

function itChangesOperationToCreateOnEmptyTargetWorkflows() {
  it('changes operation from "merge" to "create" when there are no target workflows available',
    async function () {
      await showModal(this);
      const modalBody = getModalBody();

      this.get('atmWorkflowSchemas').clear();
      await settled();

      expect(modalBody.querySelector('.option-create input'))
        .to.have.property('checked', true);
    });
}

function itSubmitsMergingWorkflowDump() {
  it('submits info about merging workflow dump', async function () {
    await showModal(this);

    await click('.submit-btn');

    expect(this.get('onSubmit')).to.be.calledOnce.and.to.be.calledWith({
      atmInventory: this.get('atmInventories.0'),
      atmWorkflowSchemaDump: this.get('dump'),
      operation: 'merge',
      targetAtmWorkflowSchema: this.get('atmWorkflowSchemas.1'),
    });
  });
}

function itSubmitsCreatingWorkflow() {
  it('submits info about creating new workflow from dump', async function () {
    await showModal(this);

    await click('.option-create');
    await fillIn('.newWorkflowName-field .form-control', 'xyz');
    await click('.submit-btn');

    expect(this.get('onSubmit')).to.be.calledOnce.and.to.be.calledWith({
      atmInventory: this.get('atmInventories.0'),
      atmWorkflowSchemaDump: this.get('dump'),
      operation: 'create',
      newAtmWorkflowSchemaName: 'xyz',
    });
  });
}

function itBlocksSubmitWhenWorkflowNameEmpty() {
  it('disallows submission when new workflow name is empty', async function () {
    await showModal(this);

    await click('.option-create');
    await fillIn('.newWorkflowName-field .form-control', '');

    expect(find('.submit-btn')).to.have.attr('disabled');
  });
}

function itDoesntBlockSubmitWnehWorkflowNameIsEmptyInMerge() {
  it('allows submission when new workflow name is empty but operation is "merge"',
    async function () {
      await showModal(this);

      await click('.option-create');
      await fillIn('.newWorkflowName-field .form-control', '');
      await click('.option-merge');

      expect(find('.submit-btn')).to.not.have.attr('disabled');
    });
}

function itClosesModal() {
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

    await click(getModal());
    expect(onHideSpy).to.be.calledOnce;
  });
}

function itBlocksControlsAndCloseWhenSubmitting() {
  it('disables all controls and does not close modal on backdrop click when submitting via "save" button',
    async function () {
      const isUploadMode = this.get('modalOptions.dumpSourceType') === 'upload';
      this.set('modalOptions.onSubmit', () => new Promise(() => {}));
      const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');
      await showModal(this);

      await click('.submit-btn');
      await click(getModal());

      expect(onHideSpy).to.not.be.called;
      if (isUploadMode) {
        expect(find('.upload-btn')).to.have.attr('disabled');
      } else {
        expect(find('.targetAtmInventory-field .dropdown-field-trigger'))
          .to.have.attr('aria-disabled');
      }
      expect(find('.targetWorkflow-field .dropdown-field-trigger'))
        .to.have.attr('aria-disabled');
      expect(find('.newWorkflowName-field .form-control')).to.have.attr('disabled');
      expect(find('.one-way-radio-group')).to.have.class('disabled');
      expect(getModalFooter().querySelector('.cancel-btn')).to.have.attr('disabled');
    });
}
