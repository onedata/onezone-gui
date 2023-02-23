import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';
import sinon from 'sinon';

const componentClass = 'operation-form';

describe('Integration | Component | modals/apply-atm-workflow-schema-dump-modal/operation-form',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      this.setProperties({
        dump: {
          revision: {
            originalRevisionNumber: 2,
          },
        },
        targetWorkflows: generateTargetWorkflows(1),
        onValueChange: sinon.spy((fieldName, newValue) => this.set(fieldName, newValue)),
        isDisabled: false,
      });
    });

    it(`has class "${componentClass}"`, async function () {
      await renderComponent();

      expect(this.element.children).to.have.length(1);
      expect(this.element.children[0]).to.have.class(componentClass);
    });

    it('shows "merge" operation with workflows dropdown and "create" operation with name input',
      async function () {
        await renderComponent();

        const options = findAll('.radio-inline');
        expect(options[0]).to.have.class('option-merge');
        expect(options[0]).to.have.trimmed.text('Merge into existing workflow');
        expect(options[0].querySelector('input')).to.have.property('checked', false);
        expect(options[1]).to.have.class('option-create');
        expect(options[1]).to.have.trimmed.text('Persist as new workflow');
        expect(options[1].querySelector('input')).to.have.property('checked', false);

        expect(find('.no-target-workflow-warning')).to.not.exist;
        expect(find('.targetWorkflow-field .control-label'))
          .to.have.trimmed.text('Target:');
        expect(find('.targetWorkflow-field .dropdown-field-trigger'))
          .to.have.trimmed.text('Select target workflow...');
        expect(find('.targetWorkflow-field .dropdown-field-trigger'))
          .to.have.attr('aria-disabled');

        expect(find('.newWorkflowName-field .control-label'))
          .to.have.trimmed.text('Name:');
        expect(find('.newWorkflowName-field .form-control')).to.have.attr('disabled');
        expect(find('.newWorkflowName-field .form-control'))
          .to.have.attr('placeholder', 'Enter name for new workflow...');
      });

    it('has selected "merge" operation and enabled workflow dropdown when selectedOperation is "merge"',
      async function () {
        this.set('selectedOperation', 'merge');

        await renderComponent();

        expect(find('.option-merge input')).to.have.property('checked', true);
        expect(find('.option-create input')).to.have.property('checked', false);

        expect(find('.targetWorkflow-field .dropdown-field-trigger'))
          .to.not.have.attr('aria-disabled');
        expect(find('.newWorkflowName-field .form-control')).to.have.attr('disabled');
      });

    it('has selected "create" operation and enabled name input when selectedOperation is "create"',
      async function () {
        this.set('selectedOperation', 'create');

        await renderComponent();

        expect(find('.option-merge input')).to.have.property('checked', false);
        expect(find('.option-create input')).to.have.property('checked', true);

        expect(find('.targetWorkflow-field .dropdown-field-trigger'))
          .to.have.attr('aria-disabled');
        expect(find('.newWorkflowName-field .form-control'))
          .to.not.have.attr('disabled');
      });

    it('allows changing operation', async function () {
      this.set('selectedOperation', 'create');
      await renderComponent();

      await click('.option-merge');

      expect(this.get('onValueChange')).to.be.calledOnce
        .and.to.be.calledWith('selectedOperation', 'merge');
      expect(find('.option-merge input')).to.have.property('checked', true);
    });

    it('shows target workflows to choose in dropdown', async function () {
      const targetWorkflows = generateTargetWorkflows(2, true);
      this.setProperties({
        selectedOperation: 'merge',
        targetWorkflows,
      });
      await renderComponent();

      await clickTrigger('.targetWorkflow-field');

      const options = document.querySelectorAll('.ember-power-select-option');
      expect(options).to.have.length(targetWorkflows.length);
      targetWorkflows.sortBy('name').forEach(({ name }, idx) =>
        expect(options[idx]).to.have.trimmed.text(name)
      );
    });

    it('shows selected target workflow', async function () {
      const targetWorkflows = generateTargetWorkflows(2);
      this.setProperties({
        selectedOperation: 'merge',
        targetWorkflows,
        selectedTargetWorkflow: targetWorkflows[0],
      });
      await renderComponent();

      expect(find('.targetWorkflow-field .dropdown-field-trigger'))
        .to.have.trimmed.text(targetWorkflows[0].name);
    });

    it('allows changing selected target workflow', async function () {
      const targetWorkflows = generateTargetWorkflows(2);
      this.setProperties({
        selectedOperation: 'merge',
        targetWorkflows,
        selectedTargetWorkflow: targetWorkflows[0],
      });
      await renderComponent();

      await selectChoose('.targetWorkflow-field', targetWorkflows[1].name);

      expect(this.get('onValueChange')).to.be.calledOnce
        .and.to.be.calledWith('selectedTargetWorkflow', targetWorkflows[1]);
      expect(find('.targetWorkflow-field .dropdown-field-trigger'))
        .to.have.trimmed.text(targetWorkflows[1].name);
    });

    it('shows provided new workflow name', async function () {
      this.setProperties({
        selectedOperation: 'create',
        newWorkflowName: 'abc',
      });
      await renderComponent();

      expect(find('.newWorkflowName-field .form-control')).to.have.value('abc');
    });

    it('allows changing new workflow name', async function () {
      this.setProperties({
        selectedOperation: 'create',
        newWorkflowName: 'xyz',
      });
      await renderComponent();

      await fillIn('.newWorkflowName-field .form-control', 'abc');

      expect(this.get('onValueChange')).to.be.calledOnce
        .and.to.be.calledWith('newWorkflowName', 'abc');
      expect(find('.newWorkflowName-field .form-control'))
        .to.have.value('abc');
    });

    [{
      dumpSourceType: 'upload',
      noTargetWarning: 'This operation is available if there already is a duplicate of the uploaded workflow in this inventory. It can be used to update the existing duplicate with a newer version of the original.',
      overrideWarning: 'Selected workflow already has revision #2. It will be irreversibly replaced by the revision from the uploaded file.',
    }, {
      dumpSourceType: 'duplication',
      noTargetWarning: 'This operation is available if there already is a duplicate of the source workflow in this inventory. It can be used to update the existing duplicate with a newer version of the original.',
      overrideWarning: 'Selected workflow already has revision #2. It will be irreversibly replaced by the revision from the source workflow.',
    }].forEach(({ dumpSourceType, noTargetWarning, overrideWarning }) => {
      it(`makes option "merge" disabled when there is no target workflow available - ${dumpSourceType} scanario`,
        async function () {
          this.setProperties({
            dumpSourceType,
            targetWorkflows: [],
          });

          await renderComponent();

          expect(find('.option-merge')).to.have.class('disabled');
          expect(find('.targetWorkflow-field')).to.not.exist;
          const noTargetWorkflowWarning = find('.no-target-workflow-warning');
          expect(noTargetWorkflowWarning).to.exist;
          expect(noTargetWorkflowWarning).to.have.trimmed.text(noTargetWarning);
        });

      it(`shows "override" warning when selected target workflow has conflicting revision and selectedOperation is "merge" - ${dumpSourceType} scanario`,
        async function () {
          const targetWorkflows = generateTargetWorkflows(1);
          targetWorkflows[0].revisionRegistry[2] = {};
          this.setProperties({
            dumpSourceType,
            selectedOperation: 'merge',
            targetWorkflows,
            selectedTargetWorkflow: targetWorkflows[0],
          });

          await renderComponent();

          const warning = find('.revision-conflict-warning');
          expect(warning).to.exist;
          expect(warning).to.have.trimmed.text(overrideWarning);
        });
    });

    it('does not show "override" warning when selected target workflow has no conflicting revision and selectedOperation is "merge"',
      async function () {
        const targetWorkflows = generateTargetWorkflows(1);
        this.setProperties({
          selectedOperation: 'merge',
          targetWorkflows,
          selectedTargetWorkflow: targetWorkflows[0],
        });

        await renderComponent();

        expect(find('.revision-conflict-warning')).to.not.exist;
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

        await renderComponent();

        expect(find('.revision-conflict-warning')).to.not.exist;
      });

    it('disables controls when isDisabled is true', async function () {
      this.set('isDisabled', true);

      await renderComponent();

      expect(find('.one-way-radio-group')).to.have.class('disabled');
      expect(find('.targetWorkflow-field .dropdown-field-trigger'))
        .to.have.attr('aria-disabled');
      expect(find('.newWorkflowName-field .form-control')).to.have.attr('disabled');
    });
  });

async function renderComponent() {
  await render(hbs `{{modals/apply-atm-workflow-schema-dump-modal/operation-form
    dumpSourceType=dumpSourceType
    selectedOperation=selectedOperation
    targetWorkflows=targetWorkflows
    selectedTargetWorkflow=selectedTargetWorkflow
    newWorkflowName=newWorkflowName
    dump=dump
    onValueChange=onValueChange
    isDisabled=isDisabled
  }}`);
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
