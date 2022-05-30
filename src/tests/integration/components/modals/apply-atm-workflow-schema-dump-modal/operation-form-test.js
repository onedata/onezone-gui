import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { clickTrigger, selectChoose } from '../../../../helpers/ember-power-select';
import $ from 'jquery';
import sinon from 'sinon';

const componentClass = 'operation-form';

describe('Integration | Component | modals/apply atm workflow schema dump modal/operation form',
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

      expect(this.$().children()).to.have.class(componentClass)
        .and.to.have.length(1);
    });

    it('shows "merge" operation with workflows dropdown and "create" operation with name input',
      async function () {
        await renderComponent();

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

        await renderComponent();

        expect(this.$('.option-merge input').prop('checked')).to.equal(true);
        expect(this.$('.option-create input').prop('checked')).to.equal(false);

        expect(this.$('.targetWorkflow-field .dropdown-field-trigger'))
          .to.not.have.attr('aria-disabled');
        expect(this.$('.newWorkflowName-field .form-control')).to.be.disabled;
      });

    it('has selected "create" operation and enabled name input when selectedOperation is "create"',
      async function () {
        this.set('selectedOperation', 'create');

        await renderComponent();

        expect(this.$('.option-merge input').prop('checked')).to.equal(false);
        expect(this.$('.option-create input').prop('checked')).to.equal(true);

        expect(this.$('.targetWorkflow-field .dropdown-field-trigger'))
          .to.have.attr('aria-disabled');
        expect(this.$('.newWorkflowName-field .form-control')).to.be.not.disabled;
      });

    it('allows changing operation', async function () {
      this.set('selectedOperation', 'create');
      await renderComponent();

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
      await renderComponent();

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
      await renderComponent();

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
      await renderComponent();

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
      await renderComponent();

      expect(this.$('.newWorkflowName-field .form-control')).to.have.value('abc');
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
      expect(this.$('.newWorkflowName-field .form-control'))
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

          expect(this.$('.option-merge')).to.have.class('disabled');
          expect(this.$('.targetWorkflow-field')).to.not.exist;
          const $noTargetWorkflowWarning = this.$('.no-target-workflow-warning');
          expect($noTargetWorkflowWarning).to.exist;
          expect($noTargetWorkflowWarning.text().trim()).to.equal(noTargetWarning);
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

          const $warning = this.$('.revision-conflict-warning');
          expect($warning).to.exist;
          expect($warning.text().trim()).to.equal(overrideWarning);
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

        expect(this.$('.revision-conflict-warning')).to.not.exist;
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

        expect(this.$('.revision-conflict-warning')).to.not.exist;
      });

    it('disables controls when isDisabled is true', async function () {
      this.set('isDisabled', true);

      await renderComponent();

      expect(this.$('.one-way-radio-group')).to.have.class('disabled');
      expect(this.$('.targetWorkflow-field .dropdown-field-trigger'))
        .to.have.attr('aria-disabled');
      expect(this.$('.newWorkflowName-field .form-control')).to.be.disabled;
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
