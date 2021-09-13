import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { fillIn, focus, blur, click } from 'ember-native-dom-helpers';
import wait from 'ember-test-helpers/wait';
import { clickTrigger, selectChoose } from '../../../helpers/ember-power-select';
import $ from 'jquery';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import { registerService } from '../../../helpers/stub-service';
import Service from '@ember/service';

const argumentAndResultTypes = [{
  dataSpec: {
    type: 'integer',
    valueConstraints: {},
  },
  label: 'Integer',
}, {
  dataSpec: {
    type: 'string',
    valueConstraints: {},
  },
  label: 'String',
}, {
  dataSpec: {
    type: 'object',
    valueConstraints: {},
  },
  label: 'Object',
  // TODO: VFS-7816 uncomment or remove future code
  // }, {
  //   dataSpec: {
  //     type: 'histogram',
  //     valueConstraints: {},
  //   },
  //   label: 'Histogram',
}, {
  dataSpec: {
    type: 'file',
    valueConstraints: {
      fileType: 'ANY',
    },
  },
  label: 'Any file',
}, {
  dataSpec: {
    type: 'file',
    valueConstraints: {
      fileType: 'REG',
    },
  },
  label: 'Regular file',
}, {
  dataSpec: {
    type: 'file',
    valueConstraints: {
      fileType: 'DIR',
    },
  },
  label: 'Directory',
}, {
  dataSpec: {
    type: 'file',
    valueConstraints: {
      fileType: 'SYMLNK',
    },
  },
  label: 'Symbolic link',
}, {
  dataSpec: {
    type: 'dataset',
    valueConstraints: {},
  },
  label: 'Dataset',
}, {
  // TODO: VFS-7816 uncomment or remove future code
  //   dataSpec: {
  //     type: 'archive',
  //     valueConstraints: {},
  //   },
  //   label: 'Archive',
  // }, {
  //   dataSpec: {
  //     type: 'storeCredentials',
  //     valueConstraints: {
  //       storeType: 'singleValue',
  //     },
  //   },
  //   label: 'Single value store',
  // }, {
  //   dataSpec: {
  //     type: 'storeCredentials',
  //     valueConstraints: {
  //       storeType: 'list',
  //     },
  //   },
  //   label: 'List store',
  // }, {
  //   dataSpec: {
  //     type: 'storeCredentials',
  //     valueConstraints: {
  //       storeType: 'map',
  //     },
  //   },
  //   label: 'Map store',
  // }, {
  //   dataSpec: {
  //     type: 'storeCredentials',
  //     valueConstraints: {
  //       storeType: 'treeForest',
  //     },
  //   },
  //   label: 'Tree forest store',
  // }, {
  //   dataSpec: {
  //     type: 'storeCredentials',
  //     valueConstraints: {
  //       storeType: 'range',
  //     },
  //   },
  //   label: 'Range store',
  // }, {
  //   dataSpec: {
  //     type: 'storeCredentials',
  //     valueConstraints: {
  //       storeType: 'histogram',
  //     },
  //   },
  //   label: 'Histogram store',
  // }, {
  dataSpec: {
    type: 'onedatafsCredentials',
    valueConstraints: {},
  },
  label: 'OnedataFS credentials',
}];

describe(
  'Integration | Component | content atm inventories lambdas/atm lambda form',
  function () {
    setupComponentTest('content-atm-inventories-lambdas/atm-lambda-form', {
      integration: true,
    });

    beforeEach(function () {
      registerService(this, 'media', Service.extend({
        isMobile: false,
        isTablet: false,
      }));
      this.set('defaultAtmResourceSpec', {
        cpuRequested: 0.1,
        cpuLimit: null,
        memoryRequested: 128 * 1024 * 1024,
        memoryLimit: null,
        ephemeralStorageRequested: 0,
        ephemeralStorageLimit: null,
      });
    });

    it('has class "atm-lambda-form"', async function () {
      this.render(hbs `{{content-atm-inventories-lambdas/atm-lambda-form}}`);

      expect(this.$().children()).to.have.class('atm-lambda-form')
        .and.to.have.length(1);
    });

    context('in "create" mode', function () {
      it('has class "mode-create"', async function () {
        await renderCreate(this);

        expect(this.$('.atm-lambda-form')).to.have.class('mode-create');
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
        expect($field).to.have.attr('type', 'text');
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

      context('when selected engine is "openfaas"', function () {
        it('shows only openfaas-related fields', async function () {
          await renderCreate(this);

          expect(this.$('.openfaasOptions-collapse')).to.have.class('in');
          expect(this.$('.onedataFunctionOptions-collapse')).to.not.have.class('in');
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
      });

      it('renders "arguments" field with no argument defined', async function () {
        await renderCreate(this);

        const $label = this.$('.arguments-field .control-label');
        const $entries = this.$('.arguments-field .entry-field');
        const $addBtn = this.$('.arguments-field .add-field-button');
        expect($label.text().trim()).to.equal('Arguments:');
        expect($entries).to.have.length(0);
        expect($addBtn.text().trim()).to.equal('Add argument');
      });

      it('allows to add new, empty argument', async function () {
        await renderCreate(this);

        await addArgument();

        const $entries = this.$('.arguments-field .entry-field');
        expect($entries).to.have.length(1);
        const $entry = $entries.eq(0);

        const $entryNameLabel = $entry.find('.entryName-field .control-label');
        const $entryNameField = $entry.find('.entryName-field .form-control');
        expect($entryNameLabel.text().trim()).to.equal('Name:');
        expect($entryNameField).to.have.attr('type', 'text');
        expect($entryNameField).to.have.attr('placeholder', 'Name');
        expect($entryNameField).to.have.value('');

        const $entryTypeLabel = $entry.find('.entryType-field .control-label');
        const $entryTypeField = $entry.find('.entryType-field .dropdown-field-trigger');
        expect($entryTypeLabel.text().trim()).to.equal('Type:');
        expect($entryTypeField.text().trim()).to.equal('Integer');

        const $entryBatchLabel = $entry.find('.entryBatch-field .control-label');
        const $entryBatchField = $entry.find('.entryBatch-field .form-control');
        expect($entryBatchLabel.text().trim()).to.equal('Batch');
        expect($entryBatchField).to.not.have.class('checked');

        const $entryOptionalLabel = $entry.find('.entryOptional-field .control-label');
        const $entryOptionalField = $entry.find('.entryOptional-field .form-control');
        expect($entryOptionalLabel.text().trim()).to.equal('Optional');
        expect($entryOptionalField).to.not.have.class('checked');

        const $entryDefaultValueLabel = $entry.find('.entryDefaultValue-field .control-label');
        const $entryDefaultValueField = $entry.find('.entryDefaultValue-field .form-control');
        expect($entryDefaultValueLabel.text().trim()).to.equal('Default value:');
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
        await wait();

        expect(this.$('.entryName-field')).to.have.class('has-success');
      });

      it('marks "argument name" field as invalid when there are two arguments with the same name',
        async function () {
          await renderCreate(this);
          await addArgument();
          await addArgument();

          const nthArgSelector = i => `.arguments-field .collection-item:nth-child(${i + 1})`;
          await fillIn(`${nthArgSelector(0)} .entryName-field .form-control`, 'somename');
          await fillIn(`${nthArgSelector(1)} .entryName-field .form-control`, 'somename');

          const $fieldMessages = this.$('.arguments-field .collection-item .field-message');
          expect($fieldMessages).to.have.length(2);
          [0, 1].forEach(i =>
            expect($fieldMessages.eq(i).text().trim())
            .to.equal('This field must have a unique value')
          );
          expect(this.$('.entryName-field.has-error')).to.have.length(2);
        });

      it('provides argument types options for "argument type" field', async function () {
        await renderCreate(this);
        await addArgument();

        await clickTrigger('.entryType-field');

        const $options = $('.ember-power-select-option');
        expect($options).to.have.length(argumentAndResultTypes.length);
        argumentAndResultTypes.forEach(({ label }, i) =>
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
        expect($addBtn.text().trim()).to.equal('Add result');
      });

      it('allows to add new, empty result', async function () {
        await renderCreate(this);

        await addResult();

        const $entries = this.$('.results-field .entry-field');
        expect($entries).to.have.length(1);
        const $entry = $entries.eq(0);

        const $entryNameLabel = $entry.find('.entryName-field .control-label');
        const $entryNameField = $entry.find('.entryName-field .form-control');
        expect($entryNameLabel.text().trim()).to.equal('Name:');
        expect($entryNameField).to.have.attr('type', 'text');
        expect($entryNameField).to.have.attr('placeholder', 'Name');
        expect($entryNameField).to.have.value('');

        const $entryTypeLabel = $entry.find('.entryType-field .control-label');
        const $entryTypeField = $entry.find('.entryType-field .dropdown-field-trigger');
        expect($entryTypeLabel.text().trim()).to.equal('Type:');
        expect($entryTypeField.text().trim()).to.equal('Integer');

        const $entryBatchLabel = $entry.find('.entryBatch-field .control-label');
        const $entryBatchField = $entry.find('.entryBatch-field .form-control');
        expect($entryBatchLabel.text().trim()).to.equal('Batch');
        expect($entryBatchField).to.not.have.class('checked');
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

      it('marks "result name" field as invalid when there are two results with the same name',
        async function () {
          await renderCreate(this);
          await addResult();
          await addResult();

          const nthArgSelector = i => `.results-field .collection-item:nth-child(${i + 1})`;
          await fillIn(`${nthArgSelector(0)} .entryName-field .form-control`, 'somename');
          await fillIn(`${nthArgSelector(1)} .entryName-field .form-control`, 'somename');

          const $fieldMessages = this.$('.results-field .collection-item .field-message');
          expect($fieldMessages).to.have.length(2);
          [0, 1].forEach(i =>
            expect($fieldMessages.eq(i).text().trim())
            .to.equal('This field must have a unique value')
          );
          expect(this.$('.entryName-field.has-error')).to.have.length(2);
        });

      it('provides result types options for "result type" field', async function () {
        await renderCreate(this);
        await addResult();

        await clickTrigger('.entryType-field');

        const $options = $('.ember-power-select-option');
        expect($options).to.have.length(argumentAndResultTypes.length);
        argumentAndResultTypes.forEach(({ label }, i) =>
          expect($options.eq(i).text().trim()).to.equal(label)
        );
      });

      it('renders "resources" section with cpu, memory and storage fields groups',
        async function () {
          await renderCreate(this);

          const $resourcesSection = this.$('.resources-field');
          expect($resourcesSection.find('.control-label').eq(0).text().trim())
            .to.equal('Resources');
          // Check if translations for resources fields are loaded
          expect($resourcesSection.text()).to.contain('Limit');

          expect($resourcesSection.find('.cpuRequested-field .form-control'))
            .to.have.value('0.1');
          expect($resourcesSection.find('.cpuLimit-field .form-control'))
            .to.have.value('');
          [{
            resourceName: 'memory',
            requested: ['128', 'MiB'],
            limit: ['', 'MiB'],
          }, {
            resourceName: 'ephemeralStorage',
            requested: ['0', 'MiB'],
            limit: ['', 'MiB'],
          }].forEach(({ resourceName, requested, limit }) => {
            const $requested = this.$(`.${resourceName}Requested-field`);
            expect($requested.find('input')).to.have.value(requested[0]);
            expect($requested.find('.ember-power-select-trigger').text())
              .to.contain(requested[1]);
            const $limit = this.$(`.${resourceName}Limit-field`);
            expect($limit.find('input')).to.have.value(limit[0]);
            expect($limit.find('.ember-power-select-trigger').text())
              .to.contain(limit[1]);
          });
        });

      it('creates simple lambda on submit button click', async function () {
        await renderCreate(this);

        const atmLambda = await fillWithMinimumData(this);
        await click('.btn-submit');

        expect(this.get('submitStub')).to.be.calledOnce
          .and.to.be.calledWith(atmLambda);
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

      it('creates complex lambda on submit button click', async function () {
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
            argumentAndResultTypes[i].label
          );
          if (i === 0) {
            await click(`${nthArgSelector} .entryBatch-field .form-control`);
            await click(`${nthArgSelector} .entryOptional-field .form-control`);
            await fillIn(`${nthArgSelector} .entryDefaultValue-field .form-control`, '"val0"');
          }

          await addResult();
          const nthResSelector = `.results-field .collection-item:nth-child(${i + 1})`;
          await fillIn(`${nthResSelector} .entryName-field .form-control`, `res${i}`);
          await selectChoose(
            `${nthResSelector} .entryType-field`,
            argumentAndResultTypes[i].label
          );
          if (i === 1) {
            await click(`${nthResSelector} .entryBatch-field .form-control`);
          }
        }

        await fillIn('.mountPoint-field .form-control', '/mount/point');
        await fillIn('.oneclientOptions-field .form-control', 'oc-options');

        await fillIn('.cpuRequested-field .form-control', '2');
        await fillIn('.cpuLimit-field .form-control', '3');
        await fillIn('.memoryRequested-field .form-control', '20');
        await fillIn('.memoryLimit-field .form-control', '30');
        await fillIn('.ephemeralStorageRequested-field .form-control', '1');
        await fillIn('.ephemeralStorageLimit-field .form-control', '10');
        await click('.btn-submit');
        expect(this.get('submitStub')).to.be.calledOnce.and.to.be.calledWith({
          name: 'myname',
          summary: 'mysummary',
          description: '',
          operationSpec: {
            engine: 'openfaas',
            dockerImage: 'myimage',
            dockerExecutionOptions: {
              readonly: true,
              mountOneclient: true,
              oneclientMountPoint: '/mount/point',
              oneclientOptions: 'oc-options',
            },
          },
          argumentSpecs: argumentAndResultTypes.slice(0, 2)
            .map(({ dataSpec }, idx) => {
              const arg = {
                name: `arg${idx}`,
                dataSpec,
                isBatch: idx === 0,
                isOptional: idx === 0,
              };
              if (idx === 0) {
                arg.defaultValue = 'val0';
              }
              return arg;
            }),
          resultSpecs: argumentAndResultTypes.slice(0, 2).map(({ dataSpec }, idx) => ({
            name: `res${idx}`,
            dataSpec,
            isBatch: idx === 1,
          })),
          resourceSpec: {
            cpuRequested: 2,
            cpuLimit: 3,
            memoryRequested: 20 * 1024 * 1024,
            memoryLimit: 30 * 1024 * 1024,
            ephemeralStorageRequested: 1024 * 1024,
            ephemeralStorageLimit: 10 * 1024 * 1024,
          },
        });
      });

      argumentAndResultTypes.forEach(({ dataSpec, label }) => {
        it(`creates lambda with "${label}"-typed argument on submit button click`,
          async function () {
            await renderCreate(this);

            const atmLambda = await fillWithMinimumData(this);
            await addArgument();
            const argSelector = '.arguments-field .collection-item:first-child';
            await fillIn(`${argSelector} .entryName-field .form-control`, 'entry');
            await selectChoose(`${argSelector} .entryType-field`, label);
            await click('.btn-submit');

            expect(this.get('submitStub')).to.be.calledOnce
              .and.to.be.calledWith(Object.assign(atmLambda, {
                argumentSpecs: [{
                  name: 'entry',
                  dataSpec,
                  isBatch: false,
                  isOptional: false,
                }],
              }));
          });
      });

      argumentAndResultTypes.forEach(({ dataSpec, label }) => {
        it(`creates lambda with "${label}"-typed result on submit button click`,
          async function () {
            await renderCreate(this);

            const atmLambda = await fillWithMinimumData(this);
            await addResult();
            const resSelector = '.results-field .collection-item:first-child';
            await fillIn(`${resSelector} .entryName-field .form-control`, 'entry');
            await selectChoose(`${resSelector} .entryType-field`, label);
            await click('.btn-submit');

            expect(this.get('submitStub')).to.be.calledOnce
              .and.to.be.calledWith(Object.assign(atmLambda, {
                resultSpecs: [{
                  name: 'entry',
                  dataSpec,
                  isBatch: false,
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
      it('has class "mode-view"', async function () {
        await renderView(this);

        expect(this.$('.atm-lambda-form')).to.have.class('mode-view');
      });

      it('does not show submit button', async function () {
        await renderView(this);

        expect(this.$('.btn-submit')).to.not.exist;
      });

      it('shows simple openfaas lambda with minimal resources spec', async function () {
        this.set('atmLambda', {
          name: 'myname',
          summary: 'summary',
          description: '',
          operationSpec: {
            engine: 'openfaas',
            dockerImage: 'myimage',
            dockerExecutionOptions: {
              readonly: true,
              mountOneclient: false,
            },
          },
          argumentSpecs: [],
          resultSpecs: [],
          resourceSpec: {
            cpuRequested: 0.1,
            cpuLimit: null,
            memoryRequested: 128 * 1024 * 1024,
            memoryLimit: null,
            ephemeralStorageRequested: 0,
            ephemeralStorageLimit: null,
          },
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
        expect(this.$('.cpuRequested-field .field-component').text().trim()).to.equal('0.1');
        expect(this.$('.cpuLimitDesc-field .field-component').text().trim()).to.equal('unlimited');
        expect(this.$('.memoryRequested-field .field-component').text().trim()).to.equal('128 MiB');
        expect(this.$('.memoryLimitDesc-field .field-component').text().trim()).to.equal('unlimited');
        expect(this.$('.ephemeralStorageRequested-field .field-component').text().trim()).to.equal('0 B');
        expect(this.$('.ephemeralStorageLimitDesc-field .field-component').text().trim())
          .to.equal('unlimited');
      });

      it('shows simple onedata function lambda with full resources spec',
        async function () {
          this.set('atmLambda', {
            name: 'myname',
            summary: 'summary',
            description: '',
            operationSpec: {
              engine: 'onedataFunction',
              functionId: 'myfunc',
            },
            argumentSpecs: [],
            resultSpecs: [],
            resourceSpec: {
              cpuRequested: 0.1,
              cpuLimit: 1,
              memoryRequested: 128 * 1024 * 1024,
              memoryLimit: 256 * 1024 * 1024,
              ephemeralStorageRequested: 1024 * 1024,
              ephemeralStorageLimit: 10 * 1024 * 1024,
            },
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
          expect(this.$('.cpuRequested-field .field-component').text().trim()).to.equal('0.1');
          expect(this.$('.cpuLimit-field .field-component').text().trim()).to.equal('1');
          expect(this.$('.memoryRequested-field .field-component').text().trim()).to.equal('128 MiB');
          expect(this.$('.memoryLimit-field .field-component').text().trim()).to.equal('256 MiB');
          expect(this.$('.ephemeralStorageRequested-field .field-component').text().trim()).to.equal('1 MiB');
          expect(this.$('.ephemeralStorageLimit-field .field-component').text().trim()).to.equal('10 MiB');
        });

      it('shows mount space options when passed lambda has "mount space" enabled',
        async function () {
          this.set('atmLambda', {
            operationSpec: {
              engine: 'openfaas',
              dockerExecutionOptions: {
                mountOneclient: true,
                oneclientMountPoint: '/some/path',
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

      it('shows arguments of passed lambda', async function () {
        this.set('atmLambda', {
          operationSpec: {
            engine: 'openfaas',
          },
          argumentSpecs: argumentAndResultTypes.map(({ dataSpec }, idx) => ({
            name: `entry${idx}`,
            dataSpec,
            isBatch: idx === 0,
            isOptional: idx === 0,
            defaultValue: idx === 0 ? 'val0' : null,
          })),
        });

        await renderView(this);

        expect(this.$('.field-edit-mode')).to.not.exist;
        expect(this.$('.arguments-field')).to.exist;
        const $entries = this.$('.arguments-field .entry-field');
        expect($entries).to.have.length(argumentAndResultTypes.length);
        argumentAndResultTypes.forEach(({ label: type }, idx) => {
          const $entry = $entries.eq(idx);
          expect($entry.find('.entryName-field .field-component').text().trim())
            .to.equal(`entry${idx}`);
          expect($entry.find('.entryType-field .field-component').text().trim())
            .to.equal(type);
          const $batchToggle = $entry.find('.entryBatch-field .form-control');
          const $optionalToggle = $entry.find('.entryOptional-field .form-control');
          const $defaultValueField = $entry.find('.entryDefaultValue-field .form-control');
          if (idx === 0) {
            expect($batchToggle).to.have.class('checked');
            expect($optionalToggle).to.have.class('checked');
            expect($defaultValueField).to.have.value('"val0"');
          } else {
            expect($batchToggle).to.not.have.class('checked');
            expect($optionalToggle).to.not.have.class('checked');
            expect($defaultValueField).to.not.exist;
          }
        });
      });

      it('shows results of passed lambda', async function () {
        this.set('atmLambda', {
          operationSpec: {
            engine: 'openfaas',
          },
          resultSpecs: argumentAndResultTypes.map(({ dataSpec }, idx) => ({
            name: `entry${idx}`,
            dataSpec,
            isBatch: idx === 1,
          })),
        });

        await renderView(this);

        expect(this.$('.field-edit-mode')).to.not.exist;
        expect(this.$('.results-field')).to.exist;
        const $entries = this.$('.results-field .entry-field');
        expect($entries).to.have.length(argumentAndResultTypes.length);

        argumentAndResultTypes.forEach(({ label: type }, idx) => {
          const $entry = $entries.eq(idx);
          expect($entry.find('.entryName-field .field-component').text().trim())
            .to.equal(`entry${idx}`);
          expect($entry.find('.entryType-field .field-component').text().trim())
            .to.equal(type);
          const $batchToggle = $entry.find('.entryBatch-field .form-control');
          if (idx === 1) {
            expect($batchToggle).to.have.class('checked');
          } else {
            expect($batchToggle).to.not.have.class('checked');
          }
        });
      });
    });

    context('in "edit" mode', function () {
      beforeEach(function () {
        this.set('atmLambda', {
          name: 'someName',
          summary: 'someSummary',
        });
      });

      it('has class "mode-edit"', async function () {
        await renderEdit(this);

        expect(this.$('.atm-lambda-form')).to.have.class('mode-edit');
      });

      it('renders two buttons - save and cancel', async function () {
        await renderEdit(this);

        const $saveBtn = this.$('.btn-submit');
        const $cancelBtn = this.$('.btn-cancel');
        expect($saveBtn).to.exist;
        expect($saveBtn.text().trim()).to.equal('Save');
        expect($cancelBtn).to.exist;
        expect($cancelBtn.text().trim()).to.equal('Cancel');
      });

      it('shows lambda values and only two fields enabled - name and summary',
        async function () {
          this.set('atmLambda', {
            name: 'myname',
            summary: 'summary',
            description: '',
            operationSpec: {
              engine: 'openfaas',
              dockerImage: 'myimage',
              dockerExecutionOptions: {
                readonly: true,
                mountOneclient: true,
                oneclientMountPoint: '/some/path',
                oneclientOptions: 'oc-options',
              },
            },
            argumentSpecs: [{
              name: 'arg',
              dataSpec: { type: 'string' },
              isBatch: true,
              isOptional: true,
              defaultValue: 'default',
            }],
            resultSpecs: [{
              name: 'res',
              dataSpec: { type: 'integer' },
              isBatch: true,
            }],
          });

          await renderEdit(this);

          const $enabledFields =
            this.$('.field-enabled:not(.form-fields-group-renderer)');
          expect($enabledFields).to.have.length(2);
          expect($enabledFields.eq(0)).to.have.class('name-field');
          expect($enabledFields.eq(1)).to.have.class('summary-field');

          expect(this.$('.name-field .form-control')).to.have.value('myname');
          expect(this.$('.summary-field .form-control')).to.have.value('summary');
          expect(this.$('.engine-field .field-component').text().trim()).to.equal('OpenFaaS');
          expect(this.$('.dockerImage-field .form-control')).to.to.have.value('myimage');
          const $argument = this.$('.arguments-field .entry-field');
          expect($argument.find('.entryName-field .form-control')).to.have.value('arg');
          expect($argument.find('.entryType-field .field-component').text().trim())
            .to.equal('String');
          expect($argument.find('.entryBatch-field .form-control'))
            .to.have.class('checked');
          expect($argument.find('.entryOptional-field .form-control'))
            .to.have.class('checked');
          expect($argument.find('.entryDefaultValue-field .form-control'))
            .to.have.value('"default"');
          const $result = this.$('.results-field .entry-field');
          expect($result.find('.entryName-field .form-control')).to.have.value('res');
          expect($result.find('.entryType-field .field-component').text().trim())
            .to.equal('Integer');
          expect($result.find('.entryBatch-field .form-control'))
            .to.have.class('checked');
          expect(this.$('.readonly-field .form-control')).to.have.class('checked');
          expect(this.$('.mountSpace-field .form-control')).to.have.class('checked');
          expect(this.$('.mountPoint-field .form-control')).to.have.value('/some/path');
          expect(this.$('.oneclientOptions-field .form-control')).to.have.value('oc-options');
        });

      it('modifies lambda on submit button click (all enabled fields modified)',
        async function () {
          await renderEdit(this);

          await fillIn('.name-field .form-control', 'anothername');
          await fillIn('.summary-field .form-control', 'anothersummary');
          await click('.btn-submit');

          expect(this.get('submitStub')).to.be.calledOnce
            .and.to.be.calledWith({
              name: 'anothername',
              summary: 'anothersummary',
            });
        });

      it('modifies lambda on submit button click (no fields modified)',
        async function () {
          await renderEdit(this);

          await click('.btn-submit');

          expect(this.get('submitStub')).to.be.calledOnce
            .and.to.be.calledWith({});
        });

      it('calls onCancel on "cancel" click', async function () {
        await renderEdit(this);

        await click('.btn-cancel');

        expect(this.get('cancelSpy')).to.be.calledOnce;
      });

      it('disables sumbit and cancel buttons when submission is pending',
        async function () {
          await renderEdit(this);
          this.set('submitStub', sinon.stub().returns(new Promise(() => {})));

          await click('.btn-submit');

          expect(this.$('.btn-submit')).to.have.attr('disabled');
          expect(this.$('.btn-cancel')).to.have.attr('disabled');
        });
    });
  }
);

async function renderCreate(testCase) {
  testCase.set('submitStub', sinon.stub().resolves());
  testCase.render(hbs `{{content-atm-inventories-lambdas/atm-lambda-form
    mode="create"
    onSubmit=submitStub
    defaultAtmResourceSpec=defaultAtmResourceSpec
  }}`);
  await wait();
}

async function renderView(testCase) {
  testCase.render(hbs `{{content-atm-inventories-lambdas/atm-lambda-form
    mode="view"
    atmLambda=atmLambda
  }}`);
  await wait();
}

async function renderEdit(testCase) {
  testCase.setProperties({
    submitStub: sinon.stub().resolves(),
    cancelSpy: sinon.spy(),
  });
  testCase.render(hbs `{{content-atm-inventories-lambdas/atm-lambda-form
    mode="edit"
    atmLambda=atmLambda
    onSubmit=submitStub
    onCancel=cancelSpy
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
    operationSpec: {
      engine: 'openfaas',
      dockerImage: 'myimage',
      dockerExecutionOptions: {
        readonly: true,
        mountOneclient: false,
      },
    },
    argumentSpecs: [],
    resultSpecs: [],
    resourceSpec: {
      cpuRequested: 0.1,
      cpuLimit: null,
      memoryRequested: 128 * 1024 * 1024,
      memoryLimit: null,
      ephemeralStorageRequested: 0,
      ephemeralStorageLimit: null,
    },
  };
}
