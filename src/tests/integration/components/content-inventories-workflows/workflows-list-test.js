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
  className: 'remove-atm-workflow-schema-action-trigger',
  label: 'Remove',
  icon: 'x',
}];

describe('Integration | Component | content inventories workflows/workflows list',
  function () {
    setupComponentTest('content-inventories-workflows/workflows-list', {
      integration: true,
    });

    beforeEach(function () {
      this.set('collection', [{
        name: 'w1',
        description: 'w1 description',
      }, {
        name: 'w0',
        description: 'w0 description',
      }]);
    });

    it('has class "workflows-list"', function () {
      this.render(hbs `{{content-inventories-workflows/workflows-list}}`);

      expect(this.$().children()).to.have.class('workflows-list')
        .and.to.have.length(1);
    });

    it('shows list of workflows entries', async function () {
      await render(this);

      const $workflows = this.$('.workflows-list-entry');
      expect($workflows).to.have.length(2);
      [0, 1].forEach(idx => {
        expect($workflows.eq(idx).find('.name-field').text().trim()).to.equal(`w${idx}`);
        expect($workflows.eq(idx).find('.description-field').text().trim())
          .to.equal(`w${idx} description`);
      });
    });

    it('does not show description when workflow does not have any', async function () {
      this.get('collection').setEach('description', '');

      await render(this);

      expect(this.$('.description-field')).to.not.exist;
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
      const $workflows = this.$('.workflows-list-entry');
      const $firstWorkflow = $workflows.eq(0);
      const $secondWorkflow = $workflows.eq(1);

      await click($firstWorkflow.find('.workflow-actions-trigger')[0]);
      await click($('body .webui-popover.in .change-details-action-trigger')[0]);
      await click($firstWorkflow.find('.workflow-actions-trigger')[0]);

      expect($('body .webui-popover.in .change-details-action-trigger').parent())
        .to.have.class('disabled');
      const $nameInput = $firstWorkflow.find('.name-field .form-control');
      const $descriptionInput = $firstWorkflow.find('.description-field .form-control');
      expect($nameInput).to.exist;
      expect($nameInput).to.have.attr('placeholder', 'Name');
      expect($nameInput).to.have.value('w0');
      expect($descriptionInput).to.exist;
      expect($descriptionInput).to.have.attr('placeholder', 'Description');
      expect($descriptionInput).to.have.value('w0 description');
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
      const $workflows = this.$('.workflows-list-entry');
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
      const $workflows = this.$('.workflows-list-entry');
      const $firstWorkflow = $workflows.eq(0);

      await click($firstWorkflow.find('.workflow-actions-trigger')[0]);
      await click($('body .webui-popover.in .change-details-action-trigger')[0]);
      await click('.btn-save');

      expect($firstWorkflow.find('.form-control')).to.exist;
    });

    it('allows to cancel workflow modification', async function () {
      await render(this);
      const $workflows = this.$('.workflows-list-entry');
      const $firstWorkflow = $workflows.eq(0);

      await click($firstWorkflow.find('.workflow-actions-trigger')[0]);
      await click($('body .webui-popover.in .change-details-action-trigger')[0]);
      await fillIn('.name-field .form-control', 'newName');
      await fillIn('.description-field .form-control', 'newDescription');
      await click('.btn-cancel');

      expect($firstWorkflow.find('.name-field').text().trim()).to.equal('w0');
      expect($firstWorkflow.find('.description-field').text().trim())
        .to.equal('w0 description');
    });

    it('validates user input in modification form', async function () {
      await render(this);
      const $workflows = this.$('.workflows-list-entry');
      const $firstWorkflow = $workflows.eq(0);
      await click($firstWorkflow.find('.workflow-actions-trigger')[0]);
      await click($('body .webui-popover.in .change-details-action-trigger')[0]);
      const $saveBtn = this.$('.btn-save');

      expect(this.$('.has-error')).to.not.exist;
      expect($saveBtn).to.not.have.attr('disabled');

      await fillIn('.name-field .form-control', '');

      expect(this.$('.has-error')).to.have.class('name-field');
      expect($saveBtn).to.have.attr('disabled');

      await fillIn('.name-field .form-control', 'someName');
      await fillIn('.description-field .form-control', '');

      expect(this.$('.has-error')).to.not.exist;
      expect($saveBtn).to.not.have.attr('disabled');
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
      const $workflows = this.$('.workflows-list-entry');
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

      const $workflows = this.$('.workflows-list-entry');
      expect($workflows).to.have.length(1);
      expect($workflows.text()).to.contain('w1');
    });
  });

async function render(testCase) {
  testCase.render(hbs `{{content-inventories-workflows/workflows-list
    collection=collection
  }}`);
  await wait();
}
