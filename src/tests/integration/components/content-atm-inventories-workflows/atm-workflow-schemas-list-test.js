import { expect } from 'chai';
import {
  describe,
  it,
  before,
  beforeEach,
  afterEach,
} from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { resolve } from 'rsvp';
import ModifyAtmWorkflowSchemaAction from 'onezone-gui/utils/workflow-actions/modify-atm-workflow-schema-action';
import RemoveAtmWorkflowSchemaAction from 'onezone-gui/utils/workflow-actions/remove-atm-workflow-schema-action';
import CopyRecordIdAction from 'onedata-gui-common/utils/clipboard-actions/copy-record-id-action';
import CreateAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/create-atm-workflow-schema-revision-action';
import DuplicateAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/duplicate-atm-workflow-schema-revision-action';
import DumpAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/dump-atm-workflow-schema-revision-action';
import RemoveAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/remove-atm-workflow-schema-revision-action';

const workflowActionsSpec = [{
  className: 'change-details-action-trigger',
  label: 'Change details',
  icon: 'rename',
}, {
  className: 'remove-atm-workflow-schema-action-trigger',
  label: 'Remove',
  icon: 'x',
}, {
  className: 'copy-record-id-action-trigger',
  label: 'Copy ID',
  icon: 'copy',
}];

const revisionActionsSpec = [{
  className: 'create-atm-workflow-schema-revision-action-trigger',
  label: 'Redesign as new revision',
  icon: 'plus',
}, {
  className: 'duplicate-atm-workflow-schema-revision-action-trigger',
  label: 'Duplicate to...',
  icon: 'browser-copy',
}, {
  className: 'dump-atm-workflow-schema-revision-action-trigger',
  label: 'Download (json)',
  icon: 'browser-download',
}, {
  className: 'remove-atm-workflow-schema-revision-action-trigger',
  label: 'Remove',
  icon: 'x',
}];

function generateAtmWorkflowSchema(name) {
  return {
    constructor: {
      modelName: 'atmWorkflowSchema',
    },
    name,
    summary: `${name} summary`,
    revisionRegistry: {
      1: {
        state: 'draft',
        description: `${name} first revision`,
      },
    },
    isLoaded: true,
  };
}

describe('Integration | Component | content atm inventories workflows/atm workflow schemas list',
  function () {
    setupRenderingTest();

    before(function () {
      // Instatiate Action class to make its `prototype.execute` available for
      // mocking.
      ModifyAtmWorkflowSchemaAction.create();
      RemoveAtmWorkflowSchemaAction.create();
      CopyRecordIdAction.create();
      CreateAtmWorkflowSchemaRevisionAction.create();
      DuplicateAtmWorkflowSchemaRevisionAction.create();
      DumpAtmWorkflowSchemaRevisionAction.create();
      RemoveAtmWorkflowSchemaRevisionAction.create();
    });

    beforeEach(function () {
      this.setProperties({
        collection: [
          generateAtmWorkflowSchema('w1'),
          generateAtmWorkflowSchema('w0'),
        ],
        workflowRevisionClickedSpy: sinon.spy(),
        revisionCreatedSpy: sinon.spy(),
      });
    });

    afterEach(function () {
      // Reset stubbed actions
      [
        ModifyAtmWorkflowSchemaAction,
        RemoveAtmWorkflowSchemaAction,
        CopyRecordIdAction,
        CreateAtmWorkflowSchemaRevisionAction,
        DuplicateAtmWorkflowSchemaRevisionAction,
        DumpAtmWorkflowSchemaRevisionAction,
        RemoveAtmWorkflowSchemaRevisionAction,
      ].forEach(action => {
        if (action.prototype.onExecute.restore) {
          action.prototype.onExecute.restore();
        }
      });
    });

    it('has class "atm-workflow-schemas-list"', async function () {
      await render(hbs `{{content-atm-inventories-workflows/atm-workflow-schemas-list}}`);

      expect(this.element.children).to.have.length(1);
      expect(this.element.children[0])
        .to.have.class('atm-workflow-schemas-list');
    });

    it('shows list of workflows entries', async function () {
      await renderComponent();

      const workflows = findAll('.atm-workflow-schemas-list-entry');
      expect(workflows).to.have.length(2);
      [0, 1].forEach(idx => {
        const workflow = workflows[idx];
        expect(workflow.querySelector('.name-field')).to.contain.text(`w${idx}`);
        expect(workflow.querySelector('.summary-field'))
          .to.contain.text(`w${idx} summary`);
        expect(workflow.querySelector('.revisions-table'))
          .to.contain.text(`w${idx} first revision`);
      });
    });

    it('shows workflows in view mode on init', async function () {
      await renderComponent();

      expect(find('.field-edit-mode')).to.not.exist;
    });

    it('allows to choose from workflow actions', async function () {
      await renderComponent();

      const actionsTrigger = find('.workflow-actions-trigger');
      expect(actionsTrigger).to.exist;

      await click(actionsTrigger);

      const actions =
        document.querySelectorAll('.webui-popover.in .actions-popover-content a');
      expect(actions).to.have.length(workflowActionsSpec.length);
      workflowActionsSpec.forEach(({ className, label, icon }, index) => {
        const action = actions[index];
        expect(action).to.have.class(className);
        expect(action).to.have.trimmed.text(label);
        expect(action.querySelector('.one-icon')).to.have.class(`oneicon-${icon}`);
      });
    });

    it('allows to trigger workflow details editor', async function () {
      await renderComponent();
      const workflows = findAll('.atm-workflow-schemas-list-entry');
      const firstWorkflow = workflows[0];
      const secondWorkflow = workflows[1];

      await click(firstWorkflow.querySelector('.workflow-actions-trigger'));
      await click(
        document.querySelector('.webui-popover.in .change-details-action-trigger')
      );
      await click(firstWorkflow.querySelector('.workflow-actions-trigger'));

      expect(document.querySelector(
        '.webui-popover.in .change-details-action-trigger'
      ).parentElement).to.have.class('disabled');
      expect(firstWorkflow.querySelector('.field-edit-mode')).to.exist;
      expect(firstWorkflow.querySelector('.btn-save')).to.have.trimmed.text('Save');
      expect(firstWorkflow.querySelector('.btn-cancel')).to.have.trimmed.text('Cancel');
      expect(secondWorkflow.querySelector('.field-edit-mode')).to.not.exist;
      expect(secondWorkflow.querySelector('.btn')).to.not.exist;
    });

    it('allows to modify workflow', async function () {
      const firstWorkflow = this.get('collection.1');
      const executeStub = sinon.stub(ModifyAtmWorkflowSchemaAction.prototype, 'onExecute')
        .callsFake(function () {
          expect(this.get('context.atmWorkflowSchema')).to.equal(firstWorkflow);
          expect(this.get('context.atmWorkflowSchemaDiff')).to.deep.include({
            name: 'newName',
            summary: 'newSummary',
          });
          return resolve({ status: 'done' });
        });
      await renderComponent();
      const workflows = findAll('.atm-workflow-schemas-list-entry');
      const firstWorkflowElem = workflows[0];

      await click(firstWorkflowElem.querySelector('.workflow-actions-trigger'));
      await click(document.querySelector(
        '.webui-popover.in .change-details-action-trigger'
      ));
      await fillIn('.name-field .form-control', 'newName');
      await fillIn('.summary-field .form-control', 'newSummary');
      await click('.btn-save');

      expect(executeStub).to.be.calledOnce;
      expect(firstWorkflowElem.querySelector('.form-control')).to.not.exist;
    });

    it('stays in edition mode when workflow modification failed', async function () {
      sinon.stub(ModifyAtmWorkflowSchemaAction.prototype, 'onExecute').rejects();
      await renderComponent();
      const workflows = findAll('.atm-workflow-schemas-list-entry');
      const firstWorkflow = workflows[0];

      await click(firstWorkflow.querySelector('.workflow-actions-trigger'));
      await click(document.querySelector(
        '.webui-popover.in .change-details-action-trigger'
      ));
      await click('.btn-save');

      expect(firstWorkflow.querySelector('.form-control')).to.exist;
    });

    it('allows to cancel workflow modification', async function () {
      await renderComponent();
      const workflows = findAll('.atm-workflow-schemas-list-entry');
      const firstWorkflow = workflows[0];

      await click(firstWorkflow.querySelector('.workflow-actions-trigger'));
      await click(document.querySelector(
        '.webui-popover.in .change-details-action-trigger'
      ));
      await fillIn('.name-field .form-control', 'newName');
      await fillIn('.summary-field .form-control', 'newSummary');
      await click('.btn-cancel');

      expect(firstWorkflow.querySelector('.name-field')).to.contain.text('w0');
      expect(firstWorkflow.querySelector('.summary-field'))
        .to.contain.text('w0 summary');
    });

    it('blocks saving modifications when form is invalid', async function () {
      await renderComponent();
      const workflows = findAll('.atm-workflow-schemas-list-entry');
      const firstWorkflow = workflows[0];
      await click(firstWorkflow.querySelector('.workflow-actions-trigger'));
      await click(document.querySelector(
        '.webui-popover.in .change-details-action-trigger'));
      const saveBtn = find('.btn-save');

      expect(saveBtn).to.not.have.attr('disabled');

      await fillIn('.name-field .form-control', '');

      expect(saveBtn).to.have.attr('disabled');
    });

    it('allows to remove workflow', async function () {
      const firstWorkflowObj = this.get('collection.1');
      const executeStub = sinon.stub(
        RemoveAtmWorkflowSchemaAction.prototype,
        'onExecute'
      ).callsFake(function () {
        expect(this.get('context.atmWorkflowSchema')).to.equal(firstWorkflowObj);
      });

      await renderComponent();
      const workflows = findAll('.atm-workflow-schemas-list-entry');
      const firstWorkflow = workflows[0];

      await click(firstWorkflow.querySelector('.workflow-actions-trigger'));
      await click(document.querySelector(
        '.webui-popover.in .remove-atm-workflow-schema-action-trigger'
      ));

      expect(executeStub).to.be.calledOnce;
    });

    it('allows to copy workflow ID', async function () {
      const firstWorkflowObj = this.get('collection.1');
      const executeStub = sinon.stub(
        CopyRecordIdAction.prototype,
        'onExecute'
      ).callsFake(function () {
        expect(this.get('context.record')).to.equal(firstWorkflowObj);
      });

      await renderComponent();
      const workflows = findAll('.atm-workflow-schemas-list-entry');
      const firstWorkflow = workflows[0];

      await click(firstWorkflow.querySelector('.workflow-actions-trigger'));
      await click(document.querySelector(
        '.webui-popover.in .copy-record-id-action-trigger'
      ));

      expect(executeStub).to.be.calledOnce;
    });

    it('has empty search input on init', async function () {
      await renderComponent();

      expect(find('.search-bar')).to.have.value('');
    });

    it('filters workflows by name when search input is not empty', async function () {
      await renderComponent();

      await fillIn('.search-bar', 'w1');

      const workflows = findAll('.atm-workflow-schemas-list-entry');
      expect(workflows).to.have.length(1);
      expect(workflows[0]).to.contain.text('w1');
    });

    it('allows creating new revision', async function () {
      const revisionCreatedSpy = this.get('revisionCreatedSpy');
      sinon.stub(
        CreateAtmWorkflowSchemaRevisionAction.prototype,
        'onExecute'
      ).resolves(4);
      await renderComponent();
      expect(revisionCreatedSpy).to.not.be.called;

      await click(
        '.atm-workflow-schemas-list-entry .revisions-table-create-revision-entry'
      );

      expect(revisionCreatedSpy).to.be.calledOnce
        .and.to.be.calledWith(this.get('collection.1'), 4);
    });

    it('notifies about workflow revision click', async function () {
      await renderComponent();

      await click('.atm-workflow-schemas-list-entry .revisions-table-revision-entry');

      expect(this.get('workflowRevisionClickedSpy')).to.be.calledOnce
        .and.to.be.calledWith(this.get('collection.1'), 1);
    });

    it('allows choosing from workflow revision actions', async function () {
      await renderComponent();

      const actionsTrigger = find('.revision-actions-trigger');
      expect(actionsTrigger).to.exist;

      await click(actionsTrigger);

      const actions =
        document.querySelectorAll('.webui-popover.in .actions-popover-content a');
      expect(actions).to.have.length(revisionActionsSpec.length);
      revisionActionsSpec.forEach(({ className, label, icon }, index) => {
        const action = actions[index];
        expect(action).to.have.class(className);
        expect(action).to.have.trimmed.text(label);
        expect(action.querySelector('.one-icon')).to.have.class(`oneicon-${icon}`);
      });
    });

    it('allows redesigning workflow revision as new revision', async function () {
      const firstWorkflowObj = this.get('collection.1');
      const executeStub = sinon.stub(
        CreateAtmWorkflowSchemaRevisionAction.prototype,
        'onExecute'
      ).callsFake(function () {
        expect(this.get('context.atmWorkflowSchema')).to.equal(firstWorkflowObj);
        expect(this.get('context.originRevisionNumber')).to.equal(1);
      });
      await renderComponent();
      const workflows = findAll('.atm-workflow-schemas-list-entry');
      const firstWorkflow = workflows[0];

      await click(firstWorkflow.querySelector('.revision-actions-trigger'));
      await click(document.querySelector(
        '.webui-popover.in .create-atm-workflow-schema-revision-action-trigger'
      ));

      expect(executeStub).to.be.calledOnce;
    });

    it('allows duplicating workflow revision', async function () {
      const firstWorkflowObj = this.get('collection.1');
      const executeStub = sinon.stub(
        DuplicateAtmWorkflowSchemaRevisionAction.prototype,
        'onExecute'
      ).callsFake(function () {
        expect(this.get('context.atmWorkflowSchema')).to.equal(firstWorkflowObj);
        expect(this.get('context.revisionNumber')).to.equal(1);
      });
      await renderComponent();
      const workflows = findAll('.atm-workflow-schemas-list-entry');
      const firstWorkflow = workflows[0];

      await click(firstWorkflow.querySelector('.revision-actions-trigger'));
      await click(document.querySelector(
        '.webui-popover.in .duplicate-atm-workflow-schema-revision-action-trigger'
      ));

      expect(executeStub).to.be.calledOnce;
    });

    it('allows downloading workflow revision dump', async function () {
      const firstWorkflowObj = this.get('collection.1');
      const executeStub = sinon.stub(
        DumpAtmWorkflowSchemaRevisionAction.prototype,
        'onExecute'
      ).callsFake(function () {
        expect(this.get('context.atmWorkflowSchema')).to.equal(firstWorkflowObj);
        expect(this.get('context.revisionNumber')).to.equal(1);
      });
      await renderComponent();
      const workflows = findAll('.atm-workflow-schemas-list-entry');
      const firstWorkflow = workflows[0];

      await click(firstWorkflow.querySelector('.revision-actions-trigger'));
      await click(document.querySelector(
        '.webui-popover.in .dump-atm-workflow-schema-revision-action-trigger'
      ));

      expect(executeStub).to.be.calledOnce;
    });

    it('allows removing workflow revision', async function () {
      const firstWorkflowObj = this.get('collection.1');
      const executeStub = sinon.stub(
        RemoveAtmWorkflowSchemaRevisionAction.prototype,
        'onExecute'
      ).callsFake(function () {
        expect(this.get('context.atmWorkflowSchema')).to.equal(firstWorkflowObj);
        expect(this.get('context.revisionNumber')).to.equal(1);
      });
      await renderComponent();
      const workflows = findAll('.atm-workflow-schemas-list-entry');
      const firstWorkflow = workflows[0];

      await click(firstWorkflow.querySelector('.revision-actions-trigger'));
      await click(document.querySelector(
        'body .webui-popover.in .remove-atm-workflow-schema-revision-action-trigger'
      ));

      expect(executeStub).to.be.calledOnce;
    });
  });

async function renderComponent() {
  await render(hbs `{{content-atm-inventories-workflows/atm-workflow-schemas-list
    collection=collection
    onRevisionCreated=revisionCreatedSpy
    onRevisionClick=workflowRevisionClickedSpy
  }}`);
}
