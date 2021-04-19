import { expect } from 'chai';
import { describe, it, context } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { fillIn, focus, blur, click } from 'ember-native-dom-helpers';
import wait from 'ember-test-helpers/wait';
import { clickTrigger, selectChoose } from '../../../helpers/ember-power-select';
import $ from 'jquery';
import sinon from 'sinon';
import { Promise } from 'rsvp';

const argumentTypes = [{
  value: 'string',
  label: 'String',
}, {
  value: 'object',
  label: 'Object',
}, {
  value: 'listStream',
  label: 'List stream',
}, {
  value: 'mapStream',
  label: 'Map stream',
}, {
  value: 'filesTreeStream',
  label: 'Files tree stream',
}, {
  value: 'histogram',
  label: 'Histogram',
}, {
  value: 'onedatafsOptions',
  label: 'OnedataFS options',
}];

const resultTypes = [{
  value: 'string',
  label: 'String',
}, {
  value: 'object',
  label: 'Object',
}, {
  value: 'listStreamOperation',
  label: 'List stream operation',
}, {
  value: 'mapStreamOperation',
  label: 'Map stream operation',
}, {
  value: 'filesTreeStreamOperation',
  label: 'Files tree stream operation',
}, {
  value: 'dataReadStats',
  label: 'Data read stats',
}, {
  value: 'dataWriteStats',
  label: 'Data write stats',
}, {
  value: 'networkTransferStats',
  label: 'Network transfer stats',
}, {
  value: 'auditLogRecord',
  label: 'Audit log record',
}];

describe(
  'Integration | Component | content workflows functions/lambda function form',
  function () {
    setupComponentTest('content-workflows-functions/lambda-function-form', {
      integration: true,
    });

    it('has class "lambda-function-form"', async function () {
      this.render(hbs `{{content-workflows-functions/lambda-function-form}}`);

      expect(this.$().children()).to.have.class('lambda-function-form')
        .and.to.have.length(1);
    });

    context('in "create" mode', function () {
      it('has class "mode-create', async function () {
        await renderCreate(this);

        expect(this.$('.lambda-function-form')).to.have.class('mode-create');
      });

      it('renders empty "name" field', async function () {
        await renderCreate(this);

        const $label = this.$('.name-field .control-label');
        const $field = this.$('.name-field .form-control');
        expect($label.text().trim()).to.equal('Name:');
        expect($field).to.have.attr('type', 'text');
        expect($field).to.have.value('');
      });

      it('marks "name" field as invalid when it is empty', async function () {
        await renderCreate(this);

        await focus('.name-field .form-control');
        await blur('.name-field .form-control');

        expect(this.$('.name-field')).to.have.class('has-error');
      });

      it('marks "name" field as valid when it is not empty', async function () {
        await renderCreate(this);

        await fillIn('.name-field .form-control', 'somename');

        expect(this.$('.name-field')).to.have.class('has-success');
      });

      it('renders empty "summary" field', async function () {
        await renderCreate(this);

        const $label = this.$('.summary-field .control-label');
        const $field = this.$('.summary-field .form-control');
        expect($label.text().trim()).to.equal('Summary (optional):');
        expect($field).to.match('textarea');
        expect($field).to.have.value('');
      });

      it('marks "summary" field as valid when it is empty', async function () {
        await renderCreate(this);

        await focus('.summary-field .form-control');
        await blur('.summary-field .form-control');

        expect(this.$('.summary-field')).to.have.class('has-success');
      });

      it('renders "engine" field with preselected "openfaas" option', async function () {
        await renderCreate(this);

        const $label = this.$('.engine-field .control-label');
        const $field = this.$('.engine-field .dropdown-field-trigger');
        expect($label.text().trim()).to.equal('Engine:');
        expect($field.text().trim()).to.equal('OpenFaaS');
      });

      it('provides only "openfass" option for "engine" field', async function () {
        await renderCreate(this);

        await clickTrigger('.engine-field');

        const $options = $('.ember-power-select-option');
        expect($options).to.have.length(1);
        expect($options.eq(0).text().trim()).to.equal('OpenFaaS');
      });

      it('renders empty "docker image" field', async function () {
        await renderCreate(this);

        const $label = this.$('.dockerImage-field .control-label');
        const $field = this.$('.dockerImage-field .form-control');
        expect($label.text().trim()).to.equal('Docker image:');
        expect($field).to.have.attr('type', 'text');
        expect($field).to.have.value('');
      });

      it('marks "docker image" field as invalid when it is empty', async function () {
        await renderCreate(this);

        await focus('.dockerImage-field .form-control');
        await blur('.dockerImage-field .form-control');

        expect(this.$('.dockerImage-field')).to.have.class('has-error');
      });

      it('marks "docker image" field as valid when it is not empty', async function () {
        await renderCreate(this);

        await fillIn('.dockerImage-field .form-control', 'somename');

        expect(this.$('.dockerImage-field')).to.have.class('has-success');
      });

      it('renders "arguments" field with no argument defined', async function () {
        await renderCreate(this);

        const $label = this.$('.arguments-field .control-label');
        const $entries = this.$('.arguments-field .entry-field');
        const $addBtn = this.$('.arguments-field .add-field-button');
        expect($label.text().trim()).to.equal('Arguments:');
        expect($entries).to.have.length(0);
        expect($addBtn.text().trim()).to.equal('Add');
      });

      it('allows to add new, empty argument', async function () {
        await renderCreate(this);

        await addArgument();

        const $entries = this.$('.arguments-field .entry-field');
        expect($entries).to.have.length(1);
        const $entry = $entries.eq(0);

        const $entryNameLabel = $entry.find('.entryName-field .control-label');
        const $entryNameField = $entry.find('.entryName-field .form-control');
        expect($entryNameLabel).to.not.exist;
        expect($entryNameField).to.have.attr('type', 'text');
        expect($entryNameField).to.have.attr('placeholder', 'Name');
        expect($entryNameField).to.have.value('');

        const $entryTypeLabel = $entry.find('.entryType-field .control-label');
        const $entryTypeField = $entry.find('.entryType-field .dropdown-field-trigger');
        expect($entryTypeLabel).to.not.exist;
        expect($entryTypeField.text().trim()).to.equal('String');

        const $entryArrayLabel = $entry.find('.entryArray-field .control-label');
        const $entryArrayField = $entry.find('.entryArray-field .form-control');
        expect($entryArrayLabel.text().trim()).to.equal('Array:');
        expect($entryArrayField).to.not.have.class('checked');

        const $entryOptionalLabel = $entry.find('.entryOptional-field .control-label');
        const $entryOptionalField = $entry.find('.entryOptional-field .form-control');
        expect($entryOptionalLabel.text().trim()).to.equal('Optional:');
        expect($entryOptionalField).to.not.have.class('checked');

        const $entryDefaultValueLabel = $entry.find('.entryDefaultValue-field .control-label');
        const $entryDefaultValueField = $entry.find('.entryDefaultValue-field .form-control');
        expect($entryDefaultValueLabel).to.not.exist;
        expect($entryDefaultValueField).to.have.attr('type', 'text');
        expect($entryDefaultValueField).to.have.attr('placeholder', 'Default value (optional)');
        expect($entryDefaultValueField).to.have.value('');
      });

      it('marks "argument name" field as invalid when it is empty', async function () {
        await renderCreate(this);
        await addArgument();

        await focus('.entryName-field .form-control');
        await blur('.entryName-field .form-control');

        expect(this.$('.entryName-field')).to.have.class('has-error');
      });

      it('marks "argument name" field as valid when it is not empty', async function () {
        await renderCreate(this);
        await addArgument();

        await fillIn('.entryName-field .form-control', 'somename');

        expect(this.$('.entryName-field')).to.have.class('has-success');
      });

      it('provides argument types options for "argument type" field', async function () {
        await renderCreate(this);
        await addArgument();

        await clickTrigger('.entryType-field');

        const $options = $('.ember-power-select-option');
        expect($options).to.have.length(argumentTypes.length);
        argumentTypes.forEach(({ label }, i) =>
          expect($options.eq(i).text().trim()).to.equal(label)
        );
      });

      it('marks "argument default value" field as valid when it is empty',
        async function () {
          await renderCreate(this);
          await addArgument();

          await focus('.entryDefaultValue-field .form-control');
          await blur('.entryDefaultValue-field .form-control');

          expect(this.$('.entryDefaultValue-field')).to.have.class('has-success');
        });

      it('renders "results" field with no result defined', async function () {
        await renderCreate(this);

        const $label = this.$('.results-field .control-label');
        const $entries = this.$('.results-field .entries-field');
        const $addBtn = this.$('.results-field .add-field-button');
        expect($label.text().trim()).to.equal('Results:');
        expect($entries).to.have.length(0);
        expect($addBtn.text().trim()).to.equal('Add');
      });

      it('allows to add new, empty result', async function () {
        await renderCreate(this);

        await addResult();

        const $entries = this.$('.results-field .entry-field');
        expect($entries).to.have.length(1);
        const $entry = $entries.eq(0);

        const $entryNameLabel = $entry.find('.entryName-field .control-label');
        const $entryNameField = $entry.find('.entryName-field .form-control');
        expect($entryNameLabel).to.not.exist;
        expect($entryNameField).to.have.attr('type', 'text');
        expect($entryNameField).to.have.attr('placeholder', 'Name');
        expect($entryNameField).to.have.value('');

        const $entryTypeLabel = $entry.find('.entryType-field .control-label');
        const $entryTypeField = $entry.find('.entryType-field .dropdown-field-trigger');
        expect($entryTypeLabel).to.not.exist;
        expect($entryTypeField.text().trim()).to.equal('String');

        const $entryArrayLabel = $entry.find('.entryArray-field .control-label');
        const $entryArrayField = $entry.find('.entryArray-field .form-control');
        expect($entryArrayLabel.text().trim()).to.equal('Array:');
        expect($entryArrayField).to.not.have.class('checked');

        const $entryOptionalLabel = $entry.find('.entryOptional-field .control-label');
        const $entryOptionalField = $entry.find('.entryOptional-field .form-control');
        expect($entryOptionalLabel.text().trim()).to.equal('Optional:');
        expect($entryOptionalField).to.not.have.class('checked');
      });

      it('marks "result name" field as invalid when it is empty', async function () {
        await renderCreate(this);
        await addResult();

        await focus('.entryName-field .form-control');
        await blur('.entryName-field .form-control');

        expect(this.$('.entryName-field')).to.have.class('has-error');
      });

      it('marks "result name" field as valid when it is not empty', async function () {
        await renderCreate(this);
        await addResult();

        await fillIn('.entryName-field .form-control', 'somename');

        expect(this.$('.entryName-field')).to.have.class('has-success');
      });

      it('provides result types options for "result type" field', async function () {
        await renderCreate(this);
        await addResult();

        await clickTrigger('.entryType-field');

        const $options = $('.ember-power-select-option');
        expect($options).to.have.length(resultTypes.length);
        resultTypes.forEach(({ label }, i) =>
          expect($options.eq(i).text().trim()).to.equal(label)
        );
      });

      it('renders checked "readonly" toggle', async function () {
        await renderCreate(this);

        const $label = this.$('.readonly-field .control-label');
        const $field = this.$('.readonly-field .form-control');
        expect($label.text().trim()).to.equal('Read-only:');
        expect($field).to.have.class('checked');
      });

      it('renders checked "mount space" toggle', async function () {
        await renderCreate(this);

        const $label = this.$('.mountSpace-field .control-label');
        const $field = this.$('.mountSpace-field .form-control');
        expect($label.text().trim()).to.equal('Mount space:');
        expect($field).to.have.class('checked');
      });

      context('when "mount space" is checked', function () {
        it('renders expanded mount space options',
          async function () {
            await renderCreate(this);

            await toggleMountSpace(this, true);

            expect(this.$('.mountSpaceOptions-collapse')).to.have.class('in');
          });

        it('renders "mount point" field with "/mnt/onedata" as a default value',
          async function () {
            await renderCreate(this);
            await toggleMountSpace(this, true);

            const $fieldsGroup = this.$('.mountSpaceOptions-field');
            const $label = $fieldsGroup.find('.mountPoint-field .control-label');
            const $field = $fieldsGroup.find('.mountPoint-field .form-control');
            expect($label.text().trim()).to.equal('Mount point:');
            expect($field).to.have.attr('type', 'text');
            expect($field).to.have.value('/mnt/onedata');
          });

        it('marks "mount point" field as invalid when it is empty', async function () {
          await renderCreate(this);
          await toggleMountSpace(this, true);

          await fillIn('.mountPoint-field .form-control', '');

          expect(this.$('.mountPoint-field')).to.have.class('has-error');
        });

        it('renders empty "oneclient options" field', async function () {
          await renderCreate(this);
          await toggleMountSpace(this, true);

          const $fieldsGroup = this.$('.mountSpaceOptions-field');
          const $label = $fieldsGroup.find('.oneclientOptions-field .control-label');
          const $field = $fieldsGroup.find('.oneclientOptions-field .form-control');
          expect($label.text().trim()).to.equal('Oneclient options:');
          expect($field).to.have.attr('type', 'text');
          expect($field).to.have.value('');
        });

        it('marks "oneclient options" field as valid when it is empty',
          async function () {
            await renderCreate(this);

            await focus('.oneclientOptions-field .form-control');
            await blur('.oneclientOptions-field .form-control');

            expect(this.$('.oneclientOptions-field')).to.have.class('has-success');
          });
      });

      context('when "mount space" is unchecked', function () {
        it('renders collapsed mount space options',
          async function () {
            await renderCreate(this);

            await toggleMountSpace(this, false);

            expect(this.$('.mountSpaceOptions-collapse')).to.not.have.class('in');
          });
      });

      it('creates simple lambda function on submit button click', async function () {
        await renderCreate(this);

        const lambdaFunction = await fillWithMinimumData(this);
        await click('.btn-submit');

        expect(this.get('submitStub')).to.be.calledOnce
          .and.to.be.calledWith(lambdaFunction);
      });

      it('resets form on successfull submission', async function () {
        await renderCreate(this);

        await fillWithMinimumData(this);
        await click('.btn-submit');

        expect(this.$('.name-field .form-control')).to.have.value('');
      });

      it('does not reset form on failed submission', async function () {
        await renderCreate(this);
        let rejectSubmit;
        this.get('submitStub').returns(
          new Promise((resolve, reject) => rejectSubmit = reject)
        );

        await fillWithMinimumData(this);
        await click('.btn-submit');
        rejectSubmit();
        await wait();

        expect(this.$('.name-field .form-control')).to.not.have.value('');
      });

      it('creates complex lambda function on submit button click', async function () {
        await renderCreate(this);

        await fillIn('.name-field .form-control', 'myname');
        await fillIn('.summary-field .form-control', 'mysummary');
        await fillIn('.dockerImage-field .form-control', 'myimage');

        for (let i = 0; i < 2; i++) {
          await addArgument();
          const nthArgSelector = `.arguments-field .collection-item:nth-child(${i + 1})`;
          await fillIn(`${nthArgSelector} .entryName-field .form-control`, `arg${i}`);
          await selectChoose(
            `${nthArgSelector} .entryType-field`,
            argumentTypes[i].label
          );
          if (i === 0) {
            await click(`${nthArgSelector} .entryArray-field .form-control`);
            await click(`${nthArgSelector} .entryOptional-field .form-control`);
            await fillIn(`${nthArgSelector} .entryDefaultValue-field .form-control`, 'val0');
          }

          await addResult();
          const nthResSelector = `.results-field .collection-item:nth-child(${i + 1})`;
          await fillIn(`${nthResSelector} .entryName-field .form-control`, `res${i}`);
          await selectChoose(`${nthResSelector} .entryType-field`, resultTypes[i].label);
          if (i === 1) {
            await click(`${nthResSelector} .entryArray-field .form-control`);
            await click(`${nthResSelector} .entryOptional-field .form-control`);
          }
        }

        await fillIn('.mountPoint-field .form-control', '/mount/point');
        await fillIn('.oneclientOptions-field .form-control', 'oc-options');
        await click('.btn-submit');

        expect(this.get('submitStub')).to.be.calledOnce.and.to.be.calledWith({
          name: 'myname',
          summary: 'mysummary',
          description: '',
          engine: 'openfaas',
          operationRef: 'myimage',
          executionOptions: {
            readonly: true,
            mountSpaceOptions: {
              mountOneclient: true,
              mountPoint: '/mount/point',
              oneclientOptions: 'oc-options',
            },
          },
          arguments: argumentTypes.slice(0, 2).map(({ value: type }, idx) => ({
            name: `arg${idx}`,
            type,
            array: idx === 0,
            optional: idx === 0,
            defaultValue: idx === 0 ? 'val0' : '',
          })),
          results: resultTypes.slice(0, 2).map(({ value: type }, idx) => ({
            name: `res${idx}`,
            type,
            array: idx === 1,
            optional: idx === 1,
          })),
        });
      });

      argumentTypes.forEach(({ value: typeValue, label: typeLabel }) => {
        it(`creates lambda function with "${typeLabel}"-typed argument on submit button click`,
          async function () {
            await renderCreate(this);

            const lambdaFunction = await fillWithMinimumData(this);
            await addArgument();
            const argSelector = '.arguments-field .collection-item:first-child';
            await fillIn(`${argSelector} .entryName-field .form-control`, 'entry');
            await selectChoose(`${argSelector} .entryType-field`, typeLabel);
            await click('.btn-submit');

            expect(this.get('submitStub')).to.be.calledOnce
              .and.to.be.calledWith(Object.assign(lambdaFunction, {
                arguments: [{
                  name: 'entry',
                  type: typeValue,
                  array: false,
                  optional: false,
                  defaultValue: '',
                }],
              }));
          });
      });

      resultTypes.forEach(({ value: typeValue, label: typeLabel }) => {
        it(`creates lambda function with "${typeLabel}"-typed result on submit button click`,
          async function () {
            await renderCreate(this);

            const lambdaFunction = await fillWithMinimumData(this);
            await addResult();
            const resSelector = '.results-field .collection-item:first-child';
            await fillIn(`${resSelector} .entryName-field .form-control`, 'entry');
            await selectChoose(`${resSelector} .entryType-field`, typeLabel);
            await click('.btn-submit');

            expect(this.get('submitStub')).to.be.calledOnce
              .and.to.be.calledWith(Object.assign(lambdaFunction, {
                results: [{
                  name: 'entry',
                  type: typeValue,
                  array: false,
                  optional: false,
                }],
              }));
          });
      });

      it('disables sumbit button when one of fields is invalid', async function () {
        await renderCreate(this);

        await fillWithMinimumData(this);
        await fillIn('.name-field .form-control', '');

        expect(this.$('.btn-submit')).to.have.attr('disabled');
      });

      it('disables sumbit button when submission is pending', async function () {
        await renderCreate(this);
        this.set('submitStub', sinon.stub().returns(new Promise(() => {})));

        await fillWithMinimumData(this);
        await click('.btn-submit');

        expect(this.$('.btn-submit')).to.have.attr('disabled');
      });
    });

    context('in "view" mode', function () {
      it('has class "mode-view', async function () {
        await renderView(this);

        expect(this.$('.lambda-function-form')).to.have.class('mode-view');
      });

      it('does not show submit button', async function () {
        await renderView(this);

        expect(this.$('.btn-submit')).to.not.exist;
      });

      it('shows simple openfaas function', async function () {
        this.set('lambdaFunction', {
          name: 'myname',
          summary: 'summary',
          description: '',
          engine: 'openfaas',
          operationRef: 'myimage',
          executionOptions: {
            readonly: true,
            mountSpaceOptions: {
              mountOneclient: false,
            },
          },
          arguments: [],
          results: [],
        });

        await renderView(this);

        expect(this.$('.field-edit-mode')).to.not.exist;
        expect(this.$('.name-field')).to.not.exist;
        expect(this.$('.summary-field')).to.not.exist;
        expect(this.$('.engine-field .field-component').text().trim()).to.equal('OpenFaaS');
        expect(this.$('.dockerImage-field .field-component').text().trim()).to.equal('myimage');
        expect(this.$('.onedataFunctionOptions-field')).to.not.exist;
        expect(this.$('.arguments-field')).to.not.exist;
        expect(this.$('.results-field')).to.not.exist;
        expect(this.$('.readonly-field .form-control')).to.have.class('checked');
        expect(this.$('.mountSpace-field .form-control')).to.exist
          .and.to.not.have.class('checked');
        expect(this.$('.mountSpaceOptions-collapse')).to.not.have.class('in');
      });

      it('shows simple onedata function', async function () {
        this.set('lambdaFunction', {
          name: 'myname',
          summary: 'summary',
          description: '',
          engine: 'onedataFunction',
          operationRef: 'myfunc',
          executionOptions: {
            readonly: true,
            mountSpaceOptions: {
              mountOneclient: false,
            },
          },
          arguments: [],
          results: [],
        });

        await renderView(this);

        expect(this.$('.field-edit-mode')).to.not.exist;
        expect(this.$('.name-field')).to.not.exist;
        expect(this.$('.summary-field')).to.not.exist;
        expect(this.$('.engine-field .field-component').text().trim()).to.equal('Onedata function');
        expect(this.$('.onedataFunctionName-field .field-component').text().trim()).to.equal('myfunc');
        expect(this.$('.openfaasOptions-field')).to.not.exist;
        expect(this.$('.arguments-field')).to.not.exist;
        expect(this.$('.results-field')).to.not.exist;
        expect(this.$('.readonly-field .form-control')).to.have.class('checked');
        expect(this.$('.mountSpace-field')).to.not.exist;
        expect(this.$('.mountSpaceOptions-field')).to.not.exist;
      });

      it('shows mount space options when passed function has "mount space" enabled',
        async function () {
          this.set('lambdaFunction', {
            engine: 'openfaas',
            executionOptions: {
              mountSpaceOptions: {
                mountOneclient: true,
                mountPoint: '/some/path',
                oneclientOptions: 'oc-options',
              },
            },
          });

          await renderView(this);

          expect(this.$('.field-edit-mode')).to.not.exist;
          expect(this.$('.mountSpaceOptions-collapse')).to.have.class('in');
          expect(this.$('.mountPoint-field .field-component').text().trim()).to.equal('/some/path');
          expect(this.$('.oneclientOptions-field .field-component').text().trim()).to.equal('oc-options');
        });

      it('shows arguments of passed function', async function () {
        this.set('lambdaFunction', {
          engine: 'openfaas',
          arguments: argumentTypes.map(({ value: type }, idx) => ({
            name: `arg${idx}`,
            type,
            array: idx === 0,
            optional: idx === 0,
            defaultValue: idx === 0 ? 'val0' : '',
          })),
        });

        await renderView(this);

        expect(this.$('.field-edit-mode')).to.not.exist;
        expect(this.$('.arguments-field')).to.exist;
        const $entries = this.$('.arguments-field .entry-field');
        expect($entries).to.have.length(argumentTypes.length);
        argumentTypes.forEach(({ label: type }, idx) => {
          const $entry = $entries.eq(idx);
          expect($entry.find('.entryName-field .field-component').text().trim())
            .to.equal(`arg${idx}`);
          expect($entry.find('.entryType-field .field-component').text().trim())
            .to.equal(type);
          const $arrayToggle = $entry.find('.entryArray-field .form-control');
          const $optionalToggle = $entry.find('.entryOptional-field .form-control');
          const $defaultValueField = $entry.find('.entryDefaultValue-field .field-component');
          if (idx === 0) {
            expect($arrayToggle).to.have.class('checked');
            expect($optionalToggle).to.have.class('checked');
            expect($defaultValueField.text().trim()).to.equal('val0');
          } else {
            expect($arrayToggle).to.not.have.class('checked');
            expect($optionalToggle).to.not.have.class('checked');
            expect($defaultValueField).to.not.exist;
          }
        });
      });

      it('shows results of passed function', async function () {
        this.set('lambdaFunction', {
          engine: 'openfaas',
          results: resultTypes.map(({ value: type }, idx) => ({
            name: `entry${idx}`,
            type,
            array: idx === 1,
            optional: idx === 1,
          })),
        });

        await renderView(this);

        expect(this.$('.field-edit-mode')).to.not.exist;
        expect(this.$('.results-field')).to.exist;
        const $entries = this.$('.results-field .entry-field');
        expect($entries).to.have.length(resultTypes.length);

        resultTypes.forEach(({ label: type }, idx) => {
          const $entry = $entries.eq(idx);
          expect($entry.find('.entryName-field .field-component').text().trim())
            .to.equal(`entry${idx}`);
          expect($entry.find('.entryType-field .field-component').text().trim())
            .to.equal(type);
          const $arrayToggle = $entry.find('.entryArray-field .form-control');
          const $optionalToggle = $entry.find('.entryOptional-field .form-control');
          if (idx === 1) {
            expect($arrayToggle).to.have.class('checked');
            expect($optionalToggle).to.have.class('checked');
          } else {
            expect($arrayToggle).to.not.have.class('checked');
            expect($optionalToggle).to.not.have.class('checked');
          }
        });
      });
    });
  }
);

async function renderCreate(testCase) {
  testCase.set('submitStub', sinon.stub().resolves());
  testCase.render(hbs `{{content-workflows-functions/lambda-function-form
    mode="create"
    onSubmit=submitStub
  }}`);
  await wait();
}

async function renderView(testCase) {
  testCase.set('submitStub', sinon.stub().resolves());
  testCase.render(hbs `{{content-workflows-functions/lambda-function-form
    mode="view"
    lambdaFunction=lambdaFunction
  }}`);
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

async function fillWithMinimumData(testCase) {
  await fillIn('.name-field .form-control', 'myname');
  await fillIn('.dockerImage-field .form-control', 'myimage');
  await toggleMountSpace(testCase, false);

  return {
    name: 'myname',
    summary: '',
    description: '',
    engine: 'openfaas',
    operationRef: 'myimage',
    executionOptions: {
      readonly: true,
      mountSpaceOptions: {
        mountOneclient: false,
      },
    },
    arguments: [],
    results: [],
  };
}
