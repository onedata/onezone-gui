import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { click, fillIn } from 'ember-native-dom-helpers';
import $ from 'jquery';
import sinon from 'sinon';
import { resolve } from 'rsvp';
import { lookupService } from '../../../helpers/stub-service';
import RemoveAtmWorkflowSchemaAction from 'onezone-gui/utils/workflow-actions/remove-atm-workflow-schema-action';

const workflowActionsSpec = [{
  className: 'change-details-action-trigger',
  label: 'Change details',
  icon: 'rename',
}, {
  className: 'dump-atm-workflow-schema-action-trigger',
  label: 'Download (json)',
  icon: 'browser-download',
}, {
  className: 'remove-atm-workflow-schema-action-trigger',
  label: 'Remove',
  icon: 'x',
}];

describe('Integration | Component | content atm inventories workflows/atm workflow schemas list',
  function () {
    setupComponentTest('content-atm-inventories-workflows/atm-workflow-schemas-list', {
      integration: true,
    });

    beforeEach(function () {
      this.setProperties({
        collection: [{
          name: 'w1',
          description: 'w1 description',
        }, {
          name: 'w0',
          description: 'w0 description',
        }],
        workflowClickedSpy: sinon.spy(),
      });
    });

    it('has class "atm-workflow-schemas-list"', function () {
      this.render(hbs `{{content-atm-inventories-workflows/atm-workflow-schemas-list}}`);

      expect(this.$().children()).to.have.class('atm-workflow-schemas-list')
        .and.to.have.length(1);
    });

    it('shows list of workflows entries', async function () {
      await render(this);

      const $workflows = this.$('.atm-workflow-schemas-list-entry');
      expect($workflows).to.have.length(2);
      [0, 1].forEach(idx => {
        expect($workflows.eq(idx).find('.name-field').text()).to.contain(`w${idx}`);
        expect($workflows.eq(idx).find('.description-field').text())
          .to.contain(`w${idx} description`);
      });
    });

    it('shows workflows in view mode on init', async function () {
      await render(this);

      expect(this.$('.field-edit-mode')).to.not.exist;
    });

    it('allows to choose from workflow actions', async function () {
      await render(this);

      const $actionsTrigger = this.$('.workflow-actions-trigger');
      expect($actionsTrigger).to.exist;

      await click($actionsTrigger[0]);

      const $actions = $('body .webui-popover.in .actions-popover-content a');
      expect($actions).to.have.length(workflowActionsSpec.length);
      workflowActionsSpec.forEach(({ className, label, icon }, index) => {
        const $action = $actions.eq(index);
        expect($action).to.have.class(className);
        expect($action.text().trim()).to.equal(label);
        expect($action.find('.one-icon')).to.have.class(`oneicon-${icon}`);
      });
    });

    it('allows to trigger workflow details editor', async function () {
      await render(this);
      const $workflows = this.$('.atm-workflow-schemas-list-entry');
      const $firstWorkflow = $workflows.eq(0);
      const $secondWorkflow = $workflows.eq(1);

      await click($firstWorkflow.find('.workflow-actions-trigger')[0]);
      await click($('body .webui-popover.in .change-details-action-trigger')[0]);
      await click($firstWorkflow.find('.workflow-actions-trigger')[0]);

      expect($('body .webui-popover.in .change-details-action-trigger').parent())
        .to.have.class('disabled');
      expect($firstWorkflow.find('.field-edit-mode')).to.exist;
      expect($firstWorkflow.find('.btn-save').text().trim()).to.equal('Save');
      expect($firstWorkflow.find('.btn-cancel').text().trim()).to.equal('Cancel');
      expect($secondWorkflow.find('.field-edit-mode')).to.not.exist;
      expect($secondWorkflow.find('.btn')).to.not.exist;
    });

    it('allows to modify workflow', async function () {
      const workflowActions = lookupService(this, 'workflow-actions');
      const createModifyAtmWorkflowSchemaActionStub =
        sinon.stub(workflowActions, 'createModifyAtmWorkflowSchemaAction')
        .returns({
          execute: () => resolve({
            status: 'done',
          }),
        });
      await render(this);
      const $workflows = this.$('.atm-workflow-schemas-list-entry');
      const $firstWorkflow = $workflows.eq(0);

      await click($firstWorkflow.find('.workflow-actions-trigger')[0]);
      await click($('body .webui-popover.in .change-details-action-trigger')[0]);
      await fillIn('.name-field .form-control', 'newName');
      await fillIn('.description-field .form-control', 'newDescription');
      await click('.btn-save');

      expect(createModifyAtmWorkflowSchemaActionStub).to.be.calledOnce
        .and.to.be.calledWith({
          atmWorkflowSchema: this.get('collection.1'),
          atmWorkflowSchemaDiff: sinon.match({
            name: 'newName',
            description: 'newDescription',
          }),
        });
      expect($firstWorkflow.find('.form-control')).to.not.exist;
    });

    it('stays in edition mode when workflow modification failed', async function () {
      const workflowActions = lookupService(this, 'workflow-actions');
      sinon.stub(workflowActions, 'createModifyAtmWorkflowSchemaAction')
        .returns({
          execute: () => resolve({
            status: 'failed',
          }),
        });
      await render(this);
      const $workflows = this.$('.atm-workflow-schemas-list-entry');
      const $firstWorkflow = $workflows.eq(0);

      await click($firstWorkflow.find('.workflow-actions-trigger')[0]);
      await click($('body .webui-popover.in .change-details-action-trigger')[0]);
      await click('.btn-save');

      expect($firstWorkflow.find('.form-control')).to.exist;
    });

    it('allows to cancel workflow modification', async function () {
      await render(this);
      const $workflows = this.$('.atm-workflow-schemas-list-entry');
      const $firstWorkflow = $workflows.eq(0);

      await click($firstWorkflow.find('.workflow-actions-trigger')[0]);
      await click($('body .webui-popover.in .change-details-action-trigger')[0]);
      await fillIn('.name-field .form-control', 'newName');
      await fillIn('.description-field .form-control', 'newDescription');
      await click('.btn-cancel');

      expect($firstWorkflow.find('.name-field').text()).to.contain('w0');
      expect($firstWorkflow.find('.description-field').text())
        .to.contain('w0 description');
    });

    it('blocks saving modifications when form is invalid', async function () {
      await render(this);
      const $workflows = this.$('.atm-workflow-schemas-list-entry');
      const $firstWorkflow = $workflows.eq(0);
      await click($firstWorkflow.find('.workflow-actions-trigger')[0]);
      await click($('body .webui-popover.in .change-details-action-trigger')[0]);
      const $saveBtn = this.$('.btn-save');

      expect($saveBtn).to.not.have.attr('disabled');

      await fillIn('.name-field .form-control', '');

      expect($saveBtn).to.have.attr('disabled');
    });

    it('allows to remove workflow', async function () {
      const workflowActions = lookupService(this, 'workflow-actions');
      let removeCalled = false;
      const createRemoveAtmWorkflowSchemaActionStub =
        sinon.stub(workflowActions, 'createRemoveAtmWorkflowSchemaAction')
        .returns(RemoveAtmWorkflowSchemaAction.create({
          ownerSource: this,
          onExecute() {
            removeCalled = true;
            return resolve({
              status: 'done',
            });
          },
        }));

      await render(this);
      const $workflows = this.$('.atm-workflow-schemas-list-entry');
      const $firstWorkflow = $workflows.eq(0);

      await click($firstWorkflow.find('.workflow-actions-trigger')[0]);
      await click(
        $('body .webui-popover.in .remove-atm-workflow-schema-action-trigger')[0]
      );

      expect(createRemoveAtmWorkflowSchemaActionStub).to.be.calledWith({
        atmWorkflowSchema: this.get('collection.1'),
      });
      expect(removeCalled).to.be.true;
    });

    it('has empty search input on init', async function () {
      await render(this);

      expect(this.$('.search-bar')).to.have.value('');
    });

    it('filters workflows by name when search input is not empty', async function () {
      await render(this);

      await fillIn('.search-bar', 'w1');

      const $workflows = this.$('.atm-workflow-schemas-list-entry');
      expect($workflows).to.have.length(1);
      expect($workflows.text()).to.contain('w1');
    });

    it('notifies about workflow click', async function () {
      await render(this);

      await click('.atm-workflow-schemas-list-entry');

      expect(this.get('workflowClickedSpy')).to.be.calledOnce
        .and.to.be.calledWith(this.get('collection.1'));
    });

    it('does not notify about workflow click, when workflow actions were clicked',
      async function () {
        await render(this);

        await click('.workflow-actions-trigger');

        expect(this.get('workflowClickedSpy')).to.not.be.called;
      });

    it('does not notify about workflow click, when workflow is being edited',
      async function () {
        await render(this);

        await click('.workflow-actions-trigger');
        await click($('body .webui-popover.in .change-details-action-trigger')[0]);
        await click('.atm-workflow-schemas-list-entry');

        expect(this.get('workflowClickedSpy')).to.not.be.called;
      });
  });

async function render(testCase) {
  testCase.render(hbs `{{content-atm-inventories-workflows/atm-workflow-schemas-list
    collection=collection
    onAtmWorkflowSchemaClick=workflowClickedSpy
  }}`);
  await wait();
}
