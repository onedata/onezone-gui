import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { clickTrigger, selectChoose } from '../../../../helpers/ember-power-select';
import $ from 'jquery';
import sinon from 'sinon';
import { click, fillIn } from 'ember-native-dom-helpers';

const componentClass = 'operation-form';

describe('Integration | Component | modals/upload atm workflow schema modal/operation form',
  function () {
    setupComponentTest('modals/upload-atm-workflow-schema-modal/operation-form', {
      integration: true,
    });

    beforeEach(function () {
      this.setProperties({
        dump: {
          initialRevision: {
            originalRevisionNumber: 2,
          },
        },
        targetWorkflows: generateTargetWorkflows(1),
        onValueChange: sinon.spy((fieldName, newValue) => this.set(fieldName, newValue)),
      });
    });

    it(`has class "${componentClass}"`, async function () {
      await render(this);

      expect(this.$().children()).to.have.class(componentClass)
        .and.to.have.length(1);
    });

    it('shows "merge" operation with workflows dropdown and "create" operation with name input',
      async function () {
        await render(this);

        const $options = this.$('.radio-inline');
        expect($options.eq(0)).to.have.class('option-merge');
        expect($options.eq(0).text().trim()).to.equal('Merge into existing workflow');
        expect($options.eq(0).find('input').prop('checked')).to.equal(false);
        expect($options.eq(1)).to.have.class('option-create');
        expect($options.eq(1).text().trim()).to.equal('Persist as new workflow');
        expect($options.eq(1).find('input').prop('checked')).to.equal(false);

        expect(this.$('.no-target-workflow-warning')).to.not.exist;
        expect(this.$('.targetWorkflow-field .control-label').text().trim()).to.equal('Target:');
        expect(this.$('.targetWorkflow-field .dropdown-field-trigger').text().trim())
          .to.equal('Select target workflow...');
        expect(this.$('.targetWorkflow-field .dropdown-field-trigger')).to.have.attr('aria-disabled');

        expect(this.$('.newWorkflowName-field .control-label').text().trim()).to.equal('Name:');
        expect(this.$('.newWorkflowName-field .form-control')).to.be.disabled;
        expect(this.$('.newWorkflowName-field .form-control'))
          .to.have.attr('placeholder', 'Enter name for new workflow...');
      });

    it('has selected "merge" operation and enabled workflow dropdown when selectedOperation is "merge"',
      async function () {
        this.set('selectedOperation', 'merge');

        await render(this);

        expect(this.$('.option-merge input').prop('checked')).to.equal(true);
        expect(this.$('.option-create input').prop('checked')).to.equal(false);

        expect(this.$('.targetWorkflow-field .dropdown-field-trigger'))
          .to.not.have.attr('aria-disabled');
        expect(this.$('.newWorkflowName-field .form-control')).to.be.disabled;
      });

    it('has selected "create" operation and enabled name input when selectedOperation is "create"',
      async function () {
        this.set('selectedOperation', 'create');

        await render(this);

        expect(this.$('.option-merge input').prop('checked')).to.equal(false);
        expect(this.$('.option-create input').prop('checked')).to.equal(true);

        expect(this.$('.targetWorkflow-field .dropdown-field-trigger'))
          .to.have.attr('aria-disabled');
        expect(this.$('.newWorkflowName-field .form-control')).to.be.not.disabled;
      });

    it('allows changing operation', async function () {
      this.set('selectedOperation', 'create');
      await render(this);

      await click('.option-merge');

      expect(this.get('onValueChange')).to.be.calledOnce
        .and.to.be.calledWith('selectedOperation', 'merge');
      expect(this.$('.option-merge input').prop('checked')).to.equal(true);
    });

    it('shows target workflows to choose in dropdown', async function () {
      const targetWorkflows = generateTargetWorkflows(2, true);
      this.setProperties({
        selectedOperation: 'merge',
        targetWorkflows,
      });
      await render(this);

      await clickTrigger('.targetWorkflow-field');

      const $options = $('.ember-power-select-option');
      expect($options).to.have.length(targetWorkflows.length);
      targetWorkflows.sortBy('name').forEach(({ name }, idx) =>
        expect($options.eq(idx).text().trim()).to.equal(name)
      );
    });

    it('shows selected target workflow', async function () {
      const targetWorkflows = generateTargetWorkflows(2);
      this.setProperties({
        selectedOperation: 'merge',
        targetWorkflows,
        selectedTargetWorkflow: targetWorkflows[0],
      });
      await render(this);

      expect(this.$('.targetWorkflow-field .dropdown-field-trigger').text().trim())
        .to.equal(targetWorkflows[0].name);
    });

    it('allows changing selected target workflow', async function () {
      const targetWorkflows = generateTargetWorkflows(2);
      this.setProperties({
        selectedOperation: 'merge',
        targetWorkflows,
        selectedTargetWorkflow: targetWorkflows[0],
      });
      await render(this);

      await selectChoose('.targetWorkflow-field', targetWorkflows[1].name);

      expect(this.get('onValueChange')).to.be.calledOnce
        .and.to.be.calledWith('selectedTargetWorkflow', targetWorkflows[1]);
      expect(this.$('.targetWorkflow-field .dropdown-field-trigger').text().trim())
        .to.equal(targetWorkflows[1].name);
    });

    it('shows provided new workflow name', async function () {
      this.setProperties({
        selectedOperation: 'create',
        newWorkflowName: 'abc',
      });
      await render(this);

      expect(this.$('.newWorkflowName-field .form-control')).to.have.value('abc');
    });

    it('allows changing new workflow name', async function () {
      this.setProperties({
        selectedOperation: 'create',
        newWorkflowName: 'xyz',
      });
      await render(this);

      await fillIn('.newWorkflowName-field .form-control', 'abc');

      expect(this.get('onValueChange')).to.be.calledOnce
        .and.to.be.calledWith('newWorkflowName', 'abc');
      expect(this.$('.newWorkflowName-field .form-control'))
        .to.have.value('abc');
    });

    it('makes option "merge" disabled when there is no target workflow available',
      async function () {
        this.set('targetWorkflows', []);

        await render(this);

        expect(this.$('.option-merge')).to.have.class('disabled');
        expect(this.$('.targetWorkflow-field')).to.not.exist;
        const $noTargetWorkflowWarning = this.$('.no-target-workflow-warning');
        expect($noTargetWorkflowWarning).to.exist;
        expect($noTargetWorkflowWarning.text().trim()).to.equal(
          'There are no workflows, which were created based on the workflow from the uploaded file.'
        );
      });

    it('does not show "override" warning when selected target workflow has no conflicting revision and selectedOperation is "merge"',
      async function () {
        const targetWorkflows = generateTargetWorkflows(1);
        this.setProperties({
          selectedOperation: 'merge',
          targetWorkflows,
          selectedTargetWorkflow: targetWorkflows[0],
        });

        await render(this);

        expect(this.$('.revision-conflict-warning')).to.not.exist;
      });

    it('shows "override" warning when selected target workflow has conflicting revision and selectedOperation is "merge"',
      async function () {
        const targetWorkflows = generateTargetWorkflows(1);
        targetWorkflows[0].revisionRegistry[2] = {};
        this.setProperties({
          selectedOperation: 'merge',
          targetWorkflows,
          selectedTargetWorkflow: targetWorkflows[0],
        });

        await render(this);

        const $warning = this.$('.revision-conflict-warning');
        expect($warning).to.exist;
        expect($warning.text().trim()).to.equal(
          'Selected workflow already has revision 2. It will be irreversibly replaced by the revision from the uploaded file.'
        );
      });

    it('does not show "override" warning when selected target workflow has conflicting revision and selectedOperation is "create"',
      async function () {
        const targetWorkflows = generateTargetWorkflows(1);
        targetWorkflows[0].revisionRegistry[2] = {};
        this.setProperties({
          selectedOperation: 'create',
          targetWorkflows,
          selectedTargetWorkflow: targetWorkflows[0],
        });

        await render(this);

        expect(this.$('.revision-conflict-warning')).to.not.exist;
      });
  });

async function render(testCase) {
  testCase.render(hbs `{{modals/upload-atm-workflow-schema-modal/operation-form
    selectedOperation=selectedOperation
    targetWorkflows=targetWorkflows
    selectedTargetWorkflow=selectedTargetWorkflow
    newWorkflowName=newWorkflowName
    dump=dump
    onValueChange=onValueChange
  }}`);
  await wait();
}

function generateTargetWorkflows(count, reversedOrder) {
  const workflows = [];
  for (let i = 0; i < count; i++) {
    workflows.push({
      name: `w${i}`,
      revisionRegistry: { 1: {} },
    });
  }
  return reversedOrder ? workflows.reverse() : workflows;
}
