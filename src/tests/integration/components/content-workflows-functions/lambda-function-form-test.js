import { expect } from 'chai';
import { describe, it, context } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { fillIn, focus, blur, click } from 'ember-native-dom-helpers';
import wait from 'ember-test-helpers/wait';
import { clickTrigger } from '../../../helpers/ember-power-select';
import $ from 'jquery';

const argumentTypes = [
  'String',
  'Object',
  'List stream',
  'Map stream',
  'Files tree stream',
  'Histogram',
];

const resultTypes = [
  'String',
  'Object',
  'List stream operation',
  'Map stream operation',
  'Files tree stream operation',
  'Data read stats',
  'Data write stats',
  'Network transfer stats',
  'Audit log record',
];

describe(
  'Integration | Component | content workflows functions/lambda function form',
  function () {
    setupComponentTest('content-workflows-functions/lambda-function-form', {
      integration: true,
    });

    it('has class "lambda-function-form"', async function () {
      await render(this);

      expect(this.$().children()).to.have.class('lambda-function-form')
        .and.to.have.length(1);
    });

    it('renders empty "name" field', async function () {
      await render(this);

      const $label = this.$('.name-field .control-label');
      const $field = this.$('.name-field .form-control');
      expect($label.text().trim()).to.equal('Name:');
      expect($field).to.have.attr('type', 'text');
      expect($field).to.have.value('');
    });

    it('marks "name" field as invalid when it is empty', async function () {
      await render(this);

      await focus('.name-field .form-control');
      await blur('.name-field .form-control');

      expect(this.$('.name-field')).to.have.class('has-error');
    });

    it('marks "name" field as valid when it is not empty', async function () {
      await render(this);

      await fillIn('.name-field .form-control', 'somename');

      expect(this.$('.name-field')).to.have.class('has-success');
    });

    it('renders empty "short description" field', async function () {
      await render(this);

      const $label = this.$('.shortDescription-field .control-label');
      const $field = this.$('.shortDescription-field .form-control');
      expect($label.text().trim()).to.equal('Short description (optional):');
      expect($field).to.match('textarea');
      expect($field).to.have.value('');
    });

    it('marks "short description" field as valid when it is empty', async function () {
      await render(this);

      await focus('.shortDescription-field .form-control');
      await blur('.shortDescription-field .form-control');

      expect(this.$('.shortDescription-field')).to.have.class('has-success');
    });

    it('renders "engine" field with preselected "openfaas" option', async function () {
      await render(this);

      const $label = this.$('.engine-field .control-label');
      const $field = this.$('.engine-field .dropdown-field-trigger');
      expect($label.text().trim()).to.equal('Engine:');
      expect($field.text().trim()).to.equal('OpenFaaS');
    });

    it('provides only "openfass" option for "engine" field', async function () {
      await render(this);

      await clickTrigger('.engine-field');

      const $options = $('.ember-power-select-option');
      expect($options).to.have.length(1);
      expect($options.eq(0).text().trim()).to.equal('OpenFaaS');
    });

    it('renders empty "docker image" field', async function () {
      await render(this);

      const $label = this.$('.dockerImage-field .control-label');
      const $field = this.$('.dockerImage-field .form-control');
      expect($label.text().trim()).to.equal('Docker image:');
      expect($field).to.have.attr('type', 'text');
      expect($field).to.have.value('');
    });

    it('marks "docker image" field as invalid when it is empty', async function () {
      await render(this);

      await focus('.dockerImage-field .form-control');
      await blur('.dockerImage-field .form-control');

      expect(this.$('.dockerImage-field')).to.have.class('has-error');
    });

    it('marks "docker image" field as valid when it is not empty', async function () {
      await render(this);

      await fillIn('.dockerImage-field .form-control', 'somename');

      expect(this.$('.dockerImage-field')).to.have.class('has-success');
    });

    it('renders "arguments" field with no argument defined', async function () {
      await render(this);

      const $label = this.$('.arguments-field .control-label');
      const $arguments = this.$('.arguments-field .argument-field');
      const $addBtn = this.$('.arguments-field .add-field-button');
      expect($label.text().trim()).to.equal('Arguments:');
      expect($arguments).to.have.length(0);
      expect($addBtn.text().trim()).to.equal('Add');
    });

    it('allows to add new, empty argument', async function () {
      await render(this);

      await addArgument();

      const $arguments = this.$('.arguments-field .argument-field');
      expect($arguments).to.have.length(1);
      const $argument = $arguments.eq(0);

      const $argumentNameLabel = $argument.find('.argumentName-field .control-label');
      const $argumentNameField = $argument.find('.argumentName-field .form-control');
      expect($argumentNameLabel).to.not.exist;
      expect($argumentNameField).to.have.attr('type', 'text');
      expect($argumentNameField).to.have.attr('placeholder', 'Name');
      expect($argumentNameField).to.have.value('');

      const $argumentTypeLabel = $argument.find('.argumentType-field .control-label');
      const $argumentTypeField = $argument.find('.argumentType-field .dropdown-field-trigger');
      expect($argumentTypeLabel).to.not.exist;
      expect($argumentTypeField.text().trim()).to.equal('String');

      const $argumentArrayLabel = $argument.find('.argumentArray-field .control-label');
      const $argumentArrayField = $argument.find('.argumentArray-field .form-control');
      expect($argumentArrayLabel.text().trim()).to.equal('Array:');
      expect($argumentArrayField).to.not.have.class('checked');

      const $argumentOptionalLabel = $argument.find('.argumentOptional-field .control-label');
      const $argumentOptionalField = $argument.find('.argumentOptional-field .form-control');
      expect($argumentOptionalLabel.text().trim()).to.equal('Optional:');
      expect($argumentOptionalField).to.not.have.class('checked');

      const $argumentDefaultValueLabel = $argument.find('.argumentDefaultValue-field .control-label');
      const $argumentDefaultValueField = $argument.find('.argumentDefaultValue-field .form-control');
      expect($argumentDefaultValueLabel).to.not.exist;
      expect($argumentDefaultValueField).to.have.attr('type', 'text');
      expect($argumentDefaultValueField).to.have.attr('placeholder', 'Default value (optional)');
      expect($argumentDefaultValueField).to.have.value('');
    });

    it('marks "argument name" field as invalid when it is empty', async function () {
      await render(this);
      await addArgument();

      await focus('.argumentName-field .form-control');
      await blur('.argumentName-field .form-control');

      expect(this.$('.argumentName-field')).to.have.class('has-error');
    });

    it('marks "argument name" field as valid when it is not empty', async function () {
      await render(this);
      await addArgument();

      await fillIn('.argumentName-field .form-control', 'somename');

      expect(this.$('.argumentName-field')).to.have.class('has-success');
    });

    it('provides argument types options for "argument type" field', async function () {
      await render(this);
      await addArgument();

      await clickTrigger('.argumentType-field');

      const $options = $('.ember-power-select-option');
      expect($options).to.have.length(argumentTypes.length);
      argumentTypes.forEach((type, i) =>
        expect($options.eq(i).text().trim()).to.equal(type)
      );
    });

    it('marks "argument default value" field as valid when it is empty',
      async function () {
        await render(this);
        await addArgument();

        await focus('.argumentDefaultValue-field .form-control');
        await blur('.argumentDefaultValue-field .form-control');

        expect(this.$('.argumentDefaultValue-field')).to.have.class('has-success');
      });

    it('renders "results" field with no result defined', async function () {
      await render(this);

      const $label = this.$('.results-field .control-label');
      const $results = this.$('.results-field .result-field');
      const $addBtn = this.$('.results-field .add-field-button');
      expect($label.text().trim()).to.equal('Results:');
      expect($results).to.have.length(0);
      expect($addBtn.text().trim()).to.equal('Add');
    });

    it('allows to add new, empty result', async function () {
      await render(this);

      await addResult();

      const $results = this.$('.results-field .result-field');
      expect($results).to.have.length(1);
      const $result = $results.eq(0);

      const $resultNameLabel = $result.find('.resultName-field .control-label');
      const $resultNameField = $result.find('.resultName-field .form-control');
      expect($resultNameLabel).to.not.exist;
      expect($resultNameField).to.have.attr('type', 'text');
      expect($resultNameField).to.have.attr('placeholder', 'Name');
      expect($resultNameField).to.have.value('');

      const $resultTypeLabel = $result.find('.resultType-field .control-label');
      const $resultTypeField = $result.find('.resultType-field .dropdown-field-trigger');
      expect($resultTypeLabel).to.not.exist;
      expect($resultTypeField.text().trim()).to.equal('String');

      const $resultArrayLabel = $result.find('.resultArray-field .control-label');
      const $resultArrayField = $result.find('.resultArray-field .form-control');
      expect($resultArrayLabel.text().trim()).to.equal('Array:');
      expect($resultArrayField).to.not.have.class('checked');

      const $resultOptionalLabel = $result.find('.resultOptional-field .control-label');
      const $resultOptionalField = $result.find('.resultOptional-field .form-control');
      expect($resultOptionalLabel.text().trim()).to.equal('Optional:');
      expect($resultOptionalField).to.not.have.class('checked');
    });

    it('marks "result name" field as invalid when it is empty', async function () {
      await render(this);
      await addResult();

      await focus('.resultName-field .form-control');
      await blur('.resultName-field .form-control');

      expect(this.$('.resultName-field')).to.have.class('has-error');
    });

    it('marks "result name" field as valid when it is not empty', async function () {
      await render(this);
      await addResult();

      await fillIn('.resultName-field .form-control', 'somename');

      expect(this.$('.resultName-field')).to.have.class('has-success');
    });

    it('provides result types options for "result type" field', async function () {
      await render(this);
      await addResult();

      await clickTrigger('.resultType-field');

      const $options = $('.ember-power-select-option');
      expect($options).to.have.length(resultTypes.length);
      resultTypes.forEach((type, i) =>
        expect($options.eq(i).text().trim()).to.equal(type)
      );
    });

    it('renders checked "mount space" toggle', async function () {
      await render(this);

      const $label = this.$('.mountSpace-field .control-label');
      const $field = this.$('.mountSpace-field .form-control');
      expect($label.text().trim()).to.equal('Mount space:');
      expect($field).to.have.class('checked');
    });

    context('when "mount space" is checked', function () {
      it('renders expanded mount space options',
        async function () {
          await render(this);

          await toggleMountSpace(this, true);

          expect(this.$('.mountSpaceOptions-collapse')).to.have.class('in');
        });

      it('renders "mount point" field with "/mnt/onedata" as a default value',
        async function () {
          await render(this);
          await toggleMountSpace(this, true);

          const $fieldsGroup = this.$('.mountSpaceOptions-field');
          const $label = $fieldsGroup.find('.mountPoint-field .control-label');
          const $field = $fieldsGroup.find('.mountPoint-field .form-control');
          expect($label.text().trim()).to.equal('Mount point:');
          expect($field).to.have.attr('type', 'text');
          expect($field).to.have.value('/mnt/onedata');
        });

      it('marks "mount point" field as invalid when it is empty', async function () {
        await render(this);
        await toggleMountSpace(this, true);

        await fillIn('.mountPoint-field .form-control', '');

        expect(this.$('.mountPoint-field')).to.have.class('has-error');
      });

      it('renders empty "oneclient options" field', async function () {
        await render(this);
        await toggleMountSpace(this, true);

        const $fieldsGroup = this.$('.mountSpaceOptions-field');
        const $label = $fieldsGroup.find('.oneclientOptions-field .control-label');
        const $field = $fieldsGroup.find('.oneclientOptions-field .form-control');
        expect($label.text().trim()).to.equal('Oneclient options:');
        expect($field).to.have.attr('type', 'text');
        expect($field).to.have.value('');
      });

      it('marks "oneclient options" field as valid when it is empty', async function () {
        await render(this);

        await focus('.oneclientOptions-field .form-control');
        await blur('.oneclientOptions-field .form-control');

        expect(this.$('.oneclientOptions-field')).to.have.class('has-success');
      });

      it('renders checked "read only" toggle', async function () {
        await render(this);

        const $fieldsGroup = this.$('.mountSpaceOptions-field');
        const $label = $fieldsGroup.find('.readOnly-field .control-label');
        const $field = $fieldsGroup.find('.readOnly-field .form-control');
        expect($label.text().trim()).to.equal('Read-only:');
        expect($field).to.have.class('checked');
      });
    });

    context('when "mount space" is unchecked', function () {
      it('renders collapsed mount space options',
        async function () {
          await render(this);

          await toggleMountSpace(this, false);

          expect(this.$('.mountSpaceOptions-collapse')).to.not.have.class('in');
        });
    });
  }
);

async function render(testCase) {
  testCase.render(hbs `{{content-workflows-functions/lambda-function-form}}`);
  await wait();
}

async function toggleMountSpace(testCase, toggleChecked) {
  const $mountToggle = testCase.$('.mountSpace-field .form-control');
  if ($mountToggle.is('.checked') !== toggleChecked) {
    await click($mountToggle[0]);
  }
}

async function addArgument() {
  await click('.arguments-field .add-field-button');
}

async function addResult() {
  await click('.results-field .add-field-button');
}
