import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import OneDropdownHelper from '../../../../helpers/one-dropdown';

const componentClass = 'operation-form';
const targetAtmRecordDropdown = new OneDropdownHelper('.targetAtmRecord-field');

describe('Integration | Component | modals/apply-atm-record-dump-modal/operation-form',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      this.setProperties({
        dump: {
          revision: {
            originalRevisionNumber: 2,
          },
        },
        targetAtmRecords: generateTargetAtmRecords(1),
        onValueChange: sinon.spy((fieldName, newValue) => this.set(fieldName, newValue)),
        isDisabled: false,
      });
    });

    it(`has class "${componentClass}"`, async function () {
      await renderComponent();

      expect(this.element.children).to.have.length(1);
      expect(this.element.children[0]).to.have.class(componentClass);
    });

    it('disables controls when isDisabled is true', async function () {
      this.setProperties({
        isDisabled: true,
        targetAtmRecords: generateTargetAtmRecords('atmWorkflowSchema', 1),
      });

      await renderComponent();

      expect(find('.one-way-radio-group')).to.have.class('disabled');
      expect(find('.targetAtmRecord-field .dropdown-field-trigger'))
        .to.have.attr('aria-disabled');
      expect(find('.newAtmRecordName-field .form-control')).to.have.attr('disabled');
    });

    context('when atmModelName is "atmLambda"', function () {
      beforeEach(function () {
        this.setProperties({
          atmModelName: 'atmLambda',
          targetAtmRecords: generateTargetAtmRecords('atmLambda', 1),
        });
      });

      itShowsOperationsAndInputs();
      itHasSelectedOperationAccordingToSelectedOperationProp();
      itAllowsChangingOperation();
      itHasWorkingTargetAtmRecordDropdown();
      itHasWorkingNewAtmRecordNameField();
      itShowsConflictWarningWhenThereIsConflict([{
        dumpSourceType: 'upload',
        noTargetWarning: 'This operation is available if there already is a duplicate of the uploaded lambda in this inventory. It can be used to update the existing duplicate with a newer version of the original.',
        conflictWarning: 'Selected lambda already has revision #2. As lambda revisions cannot be replaced, the revision from the uploaded file will be inserted as the last (newest) revision.',
      }, {
        dumpSourceType: 'duplication',
        noTargetWarning: 'This operation is available if there already is a duplicate of the source lambda in this inventory. It can be used to update the existing duplicate with a newer version of the original.',
        conflictWarning: 'Selected lambda already has revision #2. As lambda revisions cannot be replaced, the revision from the source lambda will be inserted as the last (newest) revision.',
      }]);
      itDoesNotShowOverrideWarningForNoConflict();
    });

    context('when atmModelName is "atmWorkflowSchema"', function () {
      beforeEach(function () {
        this.setProperties({
          atmModelName: 'atmWorkflowSchema',
          targetAtmRecords: generateTargetAtmRecords('atmWorkflowSchema', 1),
        });
      });

      itShowsOperationsAndInputs();
      itHasSelectedOperationAccordingToSelectedOperationProp();
      itAllowsChangingOperation();
      itHasWorkingTargetAtmRecordDropdown();
      itHasWorkingNewAtmRecordNameField();
      itShowsConflictWarningWhenThereIsConflict([{
        dumpSourceType: 'upload',
        noTargetWarning: 'This operation is available if there already is a duplicate of the uploaded workflow in this inventory. It can be used to update the existing duplicate with a newer version of the original.',
        conflictWarning: 'Selected workflow already has revision #2. It will be irreversibly replaced by the revision from the uploaded file.',
      }, {
        dumpSourceType: 'duplication',
        noTargetWarning: 'This operation is available if there already is a duplicate of the source workflow in this inventory. It can be used to update the existing duplicate with a newer version of the original.',
        conflictWarning: 'Selected workflow already has revision #2. It will be irreversibly replaced by the revision from the source workflow.',
      }]);
      itDoesNotShowOverrideWarningForNoConflict();
    });

  });

async function renderComponent() {
  await render(hbs `{{modals/apply-atm-record-dump-modal/operation-form
    atmModelName=atmModelName
    dumpSourceType=dumpSourceType
    selectedOperation=selectedOperation
    targetAtmRecords=targetAtmRecords
    selectedTargetAtmRecord=selectedTargetAtmRecord
    newAtmRecordName=newAtmRecordName
    dump=dump
    onValueChange=onValueChange
    isDisabled=isDisabled
  }}`);
}

function generateTargetAtmRecords(atmModelName, count, reversedOrder) {
  const atmRecords = [];
  for (let i = 0; i < count; i++) {
    atmRecords.push(atmModelName === 'atmLambda' ? {
      revisionRegistry: {
        1: {
          name: `r${i}`,
        },
      },
      latestRevision: {
        name: `r${i}`,
      },
    } : {
      name: `r${i}`,
      revisionRegistry: { 1: {} },
    });
  }
  return reversedOrder ? atmRecords.reverse() : atmRecords;
}

function itShowsOperationsAndInputs() {
  it('shows "merge" operation with workflows dropdown and "create" operation with name input',
    async function () {
      const atmModelName = this.get('atmModelName');
      const readableModel = atmModelName === 'atmLambda' ? 'lambda' : 'workflow';
      await renderComponent();

      const options = findAll('.radio-inline');
      expect(options[0]).to.have.class('option-merge');
      expect(options[0]).to.have.trimmed.text(`Merge into existing ${readableModel}`);
      expect(options[0].querySelector('input')).to.have.property('checked', false);
      expect(options[1]).to.have.class('option-create');
      expect(options[1]).to.have.trimmed.text(`Persist as new ${readableModel}`);
      expect(options[1].querySelector('input')).to.have.property('checked', false);

      expect(find('.no-target-atm-record-warning')).to.not.exist;
      expect(find('.targetAtmRecord-field .control-label'))
        .to.have.trimmed.text('Target:');
      expect(find('.targetAtmRecord-field .dropdown-field-trigger'))
        .to.have.trimmed.text(`Select target ${readableModel}...`);
      expect(find('.targetAtmRecord-field .dropdown-field-trigger'))
        .to.have.attr('aria-disabled');

      expect(find('.newAtmRecordName-field .control-label'))
        .to.have.trimmed.text('Name:');
      expect(find('.newAtmRecordName-field .form-control')).to.have.attr('disabled');
      expect(find('.newAtmRecordName-field .form-control'))
        .to.have.attr('placeholder', `Enter name for new ${readableModel}...`);
    }
  );
}

function itHasSelectedOperationAccordingToSelectedOperationProp() {
  it('has selected "merge" operation and enabled records dropdown when selectedOperation is "merge"',
    async function () {
      this.set('selectedOperation', 'merge');

      await renderComponent();

      expect(find('.option-merge input')).to.have.property('checked', true);
      expect(find('.option-create input')).to.have.property('checked', false);

      expect(find('.targetAtmRecord-field .dropdown-field-trigger'))
        .to.not.have.attr('aria-disabled');
      expect(find('.newAtmRecordName-field .form-control')).to.have.attr('disabled');
    }
  );

  it('has selected "create" operation and enabled name input when selectedOperation is "create"',
    async function () {
      this.set('selectedOperation', 'create');

      await renderComponent();

      expect(find('.option-merge input')).to.have.property('checked', false);
      expect(find('.option-create input')).to.have.property('checked', true);

      expect(find('.targetAtmRecord-field .dropdown-field-trigger'))
        .to.have.attr('aria-disabled');
      expect(find('.newAtmRecordName-field .form-control'))
        .to.not.have.attr('disabled');
    }
  );
}

function itAllowsChangingOperation() {
  it('allows changing operation', async function () {
    this.set('selectedOperation', 'create');
    await renderComponent();

    await click('.option-merge');

    expect(this.get('onValueChange')).to.be.calledOnce
      .and.to.be.calledWith('selectedOperation', 'merge');
    expect(find('.option-merge input')).to.have.property('checked', true);
  });
}

function itHasWorkingTargetAtmRecordDropdown() {
  it('shows target records to choose in dropdown', async function () {
    const targetAtmRecords =
      generateTargetAtmRecords(this.get('atmModelName'), 2, true);
    this.setProperties({
      selectedOperation: 'merge',
      targetAtmRecords,
    });

    await renderComponent();

    const recordNames = targetAtmRecords.map((record) =>
      record.name ?? record.latestRevision.name
    ).sort();
    expect(await targetAtmRecordDropdown.getOptionsText())
      .to.deep.equal(recordNames);
  });

  it('shows selected target workflow', async function () {
    const targetAtmRecords = generateTargetAtmRecords(this.get('atmModelName'), 2);
    this.setProperties({
      selectedOperation: 'merge',
      targetAtmRecords,
      selectedTargetAtmRecord: targetAtmRecords[0],
    });
    await renderComponent();

    expect(targetAtmRecordDropdown.getSelectedOptionText()).to.equal(
      targetAtmRecords[0].name ?? targetAtmRecords[0].latestRevision.name
    );
  });

  it('allows changing selected target workflow', async function () {
    const targetAtmRecords = generateTargetAtmRecords(this.get('atmModelName'), 2);
    this.setProperties({
      selectedOperation: 'merge',
      targetAtmRecords,
      selectedTargetAtmRecord: targetAtmRecords[0],
    });
    await renderComponent();
    const nameToSelect = targetAtmRecords[1].name ??
      targetAtmRecords[1].latestRevision.name;

    await targetAtmRecordDropdown.selectOptionByText(nameToSelect);

    expect(this.get('onValueChange')).to.be.calledOnce
      .and.to.be.calledWith('selectedTargetAtmRecord', targetAtmRecords[1]);
    expect(targetAtmRecordDropdown.getSelectedOptionText()).to.equal(nameToSelect);
  });
}

function itHasWorkingNewAtmRecordNameField() {
  it('shows provided new workflow name', async function () {
    this.setProperties({
      selectedOperation: 'create',
      newAtmRecordName: 'abc',
    });
    await renderComponent();

    expect(find('.newAtmRecordName-field .form-control')).to.have.value('abc');
  });

  it('allows changing new workflow name', async function () {
    this.setProperties({
      selectedOperation: 'create',
      newAtmRecordName: 'xyz',
    });
    await renderComponent();

    await fillIn('.newAtmRecordName-field .form-control', 'abc');

    expect(this.get('onValueChange')).to.be.calledOnce
      .and.to.be.calledWith('newAtmRecordName', 'abc');
    expect(find('.newAtmRecordName-field .form-control'))
      .to.have.value('abc');
  });
}

function itShowsConflictWarningWhenThereIsConflict(warningsPerSourceType) {
  warningsPerSourceType.forEach(({
    dumpSourceType,
    noTargetWarning,
    conflictWarning,
  }) => {
    it(`makes option "merge" disabled when there is no target record available - ${dumpSourceType} scanario`,
      async function () {
        this.setProperties({
          dumpSourceType,
          targetAtmRecords: [],
        });

        await renderComponent();

        expect(find('.option-merge')).to.have.class('disabled');
        expect(find('.targetAtmRecord-field')).to.not.exist;
        const noTargetWorkflowWarning = find('.no-target-atm-record-warning');
        expect(noTargetWorkflowWarning).to.exist;
        expect(noTargetWorkflowWarning).to.have.trimmed.text(noTargetWarning);
      }
    );

    it(`shows "override" warning when selected target record has conflicting revision and selectedOperation is "merge" - ${dumpSourceType} scanario`,
      async function () {
        const targetAtmRecords =
          generateTargetAtmRecords(this.get('atmModelName'), 1);
        targetAtmRecords[0].revisionRegistry[2] = {};
        this.setProperties({
          dumpSourceType,
          selectedOperation: 'merge',
          targetAtmRecords,
          selectedTargetAtmRecord: targetAtmRecords[0],
        });

        await renderComponent();

        const warning = find('.revision-conflict-warning');
        expect(warning).to.exist;
        expect(warning).to.have.trimmed.text(conflictWarning);
      }
    );
  });
}

function itDoesNotShowOverrideWarningForNoConflict() {
  it('does not show "conflict" warning when selected target record has no conflicting revision and selectedOperation is "merge"',
    async function () {
      const targetAtmRecords =
        generateTargetAtmRecords(this.get('atmModelName'), 1);
      this.setProperties({
        selectedOperation: 'merge',
        targetAtmRecords,
        selectedTargetAtmRecord: targetAtmRecords[0],
      });

      await renderComponent();

      expect(find('.revision-conflict-warning')).to.not.exist;
    }
  );

  it('does not show "conflict" warning when selected target record has conflicting revision and selectedOperation is "create"',
    async function () {
      const targetAtmRecords = generateTargetAtmRecords(this.get('atmModelName'), 1);
      targetAtmRecords[0].revisionRegistry[2] = {};
      this.setProperties({
        selectedOperation: 'create',
        targetAtmRecords,
        selectedTargetAtmRecord: targetAtmRecords[0],
      });

      await renderComponent();

      expect(find('.revision-conflict-warning')).to.not.exist;
    }
  );
}
