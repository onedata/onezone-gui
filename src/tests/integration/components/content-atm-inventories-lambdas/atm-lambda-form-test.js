import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { fillIn, focus, blur, click, find } from 'ember-native-dom-helpers';
import wait from 'ember-test-helpers/wait';
import { clickTrigger, selectChoose } from '../../../helpers/ember-power-select';
import $ from 'jquery';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import { registerService } from '../../../helpers/stub-service';
import Service from '@ember/service';

const states = [{
  value: 'draft',
  label: 'Draft',
}, {
  value: 'stable',
  label: 'Stable',
}, {
  value: 'deprecated',
  label: 'Deprecated',
}];

const argumentAndResultCommonTypes = [{
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
    type: 'range',
    valueConstraints: {},
  },
  label: 'Range',
}, {
  label: 'Time series measurement',
}];

const argumentTypes = [...argumentAndResultCommonTypes, {
  dataSpec: {
    type: 'onedatafsCredentials',
    valueConstraints: {},
  },
  label: 'OnedataFS credentials',
}];
const resultTypes = argumentAndResultCommonTypes;

describe(
  'Integration | Component | content atm inventories lambdas/atm lambda form',
  function () {
    setupRenderingTest();

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

    it('has class "atm-lambda-form"', async function (done) {
      await render(hbs `{{content-atm-inventories-lambdas/atm-lambda-form}}`);

      expect(this.$().children()).to.have.class('atm-lambda-form')
        .and.to.have.length(1);
      done();
    });

    context('in "create" mode', function () {
      it('has class "mode-create"', async function (done) {
        await renderCreate(this);

        expect(this.$('.atm-lambda-form')).to.have.class('mode-create');
        done();
      });

      it('renders empty "name" field', async function (done) {
        await renderCreate(this);

        const $label = this.$('.name-field .control-label');
        const $field = this.$('.name-field .form-control');
        expect($label.text().trim()).to.equal('Name:');
        expect($field).to.have.attr('type', 'text');
        expect($field).to.have.value('');
        done();
      });

      it('marks "name" field as invalid when it is empty', async function (done) {
        await renderCreate(this);

        await focus('.name-field .form-control');
        await blur('.name-field .form-control');

        expect(this.$('.name-field')).to.have.class('has-error');
        done();
      });

      it('marks "name" field as valid when it is not empty', async function (done) {
        await renderCreate(this);

        await fillIn('.name-field .form-control', 'somename');

        expect(this.$('.name-field')).to.have.class('has-success');
        done();
      });

      it('renders "state" field with preselected "draft" option', async function (done) {
        await renderCreate(this);

        const $label = this.$('.state-field .control-label');
        const $field = this.$('.state-field .dropdown-field-trigger');
        expect($label.text().trim()).to.equal('State:');
        expect($field.text().trim()).to.equal('Draft');
        done();
      });

      it('allows to choose different state for "state" field', async function (done) {
        await renderCreate(this);

        await clickTrigger('.state-field');

        const $options = $('.ember-power-select-option');
        expect($options).to.have.length(3);
        states.forEach(({ label }, idx) =>
          expect($options.eq(idx).text().trim()).to.equal(label)
        );
        done();
      });

      it('renders empty "summary" field', async function (done) {
        await renderCreate(this);

        const $label = this.$('.summary-field .control-label');
        const $field = this.$('.summary-field .form-control');
        expect($label.text().trim()).to.equal('Summary (optional):');
        expect($field).to.have.attr('type', 'text');
        expect($field).to.have.value('');
        done();
      });

      it('marks "summary" field as valid when it is empty', async function (done) {
        await renderCreate(this);

        await focus('.summary-field .form-control');
        await blur('.summary-field .form-control');

        expect(this.$('.summary-field')).to.have.class('has-success');
        done();
      });

      it('renders "engine" field with preselected "openfaas" option',
        async function (done) {
          await renderCreate(this);

          const $label = this.$('.engine-field .control-label');
          const $field = this.$('.engine-field .dropdown-field-trigger');
          expect($label.text().trim()).to.equal('Engine:');
          expect($field.text().trim()).to.equal('OpenFaaS');
          done();
        });

      it('provides only "openfass" option for "engine" field', async function (done) {
        await renderCreate(this);

        await clickTrigger('.engine-field');

        const $options = $('.ember-power-select-option');
        expect($options).to.have.length(1);
        expect($options.eq(0).text().trim()).to.equal('OpenFaaS');
        done();
      });

      context('when selected engine is "openfaas"', function () {
        it('shows only openfaas-related fields', async function (done) {
          await renderCreate(this);

          expect(this.$('.openfaasOptions-collapse')).to.have.class('in');
          expect(this.$('.onedataFunctionOptions-collapse')).to.not.have.class('in');
          done();
        });

        it('renders empty "docker image" field', async function (done) {
          await renderCreate(this);

          const $label = this.$('.dockerImage-field .control-label');
          const $field = this.$('.dockerImage-field .form-control');
          expect($label.text().trim()).to.equal('Docker image:');
          expect($field).to.have.attr('type', 'text');
          expect($field).to.have.value('');
          done();
        });

        it('marks "docker image" field as invalid when it is empty',
          async function (done) {
            await renderCreate(this);

            await focus('.dockerImage-field .form-control');
            await blur('.dockerImage-field .form-control');

            expect(this.$('.dockerImage-field')).to.have.class('has-error');
            done();
          });

        it('marks "docker image" field as valid when it is not empty',
          async function (done) {
            await renderCreate(this);

            await fillIn('.dockerImage-field .form-control', 'somename');

            expect(this.$('.dockerImage-field')).to.have.class('has-success');
            done();
          });

        it('renders checked "readonly" toggle', async function (done) {
          await renderCreate(this);

          const $label = this.$('.readonly-field .control-label');
          const $field = this.$('.readonly-field .form-control');
          expect($label.text().trim()).to.equal('Read-only:');
          expect($field).to.have.class('checked');
          done();
        });

        it('renders checked "mount space" toggle', async function (done) {
          await renderCreate(this);

          const $label = this.$('.mountSpace-field .control-label');
          const $field = this.$('.mountSpace-field .form-control');
          expect($label.text().trim()).to.equal('Mount space:');
          expect($field).to.have.class('checked');
          done();
        });

        context('when "mount space" is checked', function () {
          it('renders expanded mount space options',
            async function (done) {
              await renderCreate(this);

              await toggleMountSpace(this, true);

              expect(this.$('.mountSpaceOptions-collapse')).to.have.class('in');
              done();
            });

          it('renders "mount point" field with "/mnt/onedata" as a default value',
            async function (done) {
              await renderCreate(this);
              await toggleMountSpace(this, true);

              const $fieldsGroup = this.$('.mountSpaceOptions-field');
              const $label = $fieldsGroup.find('.mountPoint-field .control-label');
              const $field = $fieldsGroup.find('.mountPoint-field .form-control');
              expect($label.text().trim()).to.equal('Mount point:');
              expect($field).to.have.attr('type', 'text');
              expect($field).to.have.value('/mnt/onedata');
              done();
            });

          it('marks "mount point" field as invalid when it is empty',
            async function (done) {
              await renderCreate(this);
              await toggleMountSpace(this, true);

              await fillIn('.mountPoint-field .form-control', '');

              expect(this.$('.mountPoint-field')).to.have.class('has-error');
              done();
            });

          it('renders empty "oneclient options" field', async function (done) {
            await renderCreate(this);
            await toggleMountSpace(this, true);

            const $fieldsGroup = this.$('.mountSpaceOptions-field');
            const $label = $fieldsGroup.find('.oneclientOptions-field .control-label');
            const $field = $fieldsGroup.find('.oneclientOptions-field .form-control');
            expect($label.text().trim()).to.equal('Oneclient options:');
            expect($field).to.have.attr('type', 'text');
            expect($field).to.have.value('');
            done();
          });

          it('marks "oneclient options" field as valid when it is empty',
            async function (done) {
              await renderCreate(this);

              await focus('.oneclientOptions-field .form-control');
              await blur('.oneclientOptions-field .form-control');

              expect(this.$('.oneclientOptions-field')).to.have.class('has-success');
              done();
            });
        });

        context('when "mount space" is unchecked', function () {
          it('renders collapsed mount space options',
            async function (done) {
              await renderCreate(this);

              await toggleMountSpace(this, false);

              expect(this.$('.mountSpaceOptions-collapse')).to.not.have.class('in');
              done();
            });
        });
      });

      it('renders "arguments" field with no argument defined', async function (done) {
        await renderCreate(this);

        const $label = this.$('.arguments-field .control-label');
        const $entries = this.$('.arguments-field .entry-field');
        const $addBtn = this.$('.arguments-field .add-field-button');
        expect($label.text().trim()).to.equal('Arguments:');
        expect($entries).to.have.length(0);
        expect($addBtn.text().trim()).to.equal('Add argument');
        done();
      });

      it('allows to add new, empty argument', async function (done) {
        await renderCreate(this);

        await addArgument();

        const $entries = this.$('.arguments-field .entry-field');
        expect($entries).to.have.length(1);
        const $entry = $entries.eq(0);

        const $entryNameField = $entry.find('.entryName-field .form-control');
        expect($entryNameField).to.have.attr('type', 'text');
        expect($entryNameField).to.have.attr('placeholder', 'Name');
        expect($entryNameField).to.have.value('');

        const $entryTypeField = $entry.find('.type-field .dropdown-field-trigger');
        expect($entryTypeField.text().trim()).to.equal('Integer');

        const $entryIsOptionalLabel = $entry.find('.entryIsOptional-field .control-label');
        const $entryIsOptionalField = $entry.find('.entryIsOptional-field .form-control');
        expect($entryIsOptionalLabel.text().trim()).to.equal('Optional');
        expect($entryIsOptionalField).to.not.have.class('checked');

        const $entryDefaultValueLabel = $entry.find('.entryDefaultValue-field .control-label');
        const $entryDefaultValueField = $entry.find('.entryDefaultValue-field .form-control');
        expect($entryDefaultValueLabel.text().trim()).to.equal('Default value:');
        expect($entryDefaultValueField).to.have.attr('placeholder', 'Default value (optional)');
        expect($entryDefaultValueField).to.have.value('');
        done();
      });

      it('marks "argument name" field as invalid when it is empty',
        async function (done) {
          await renderCreate(this);
          await addArgument();

          await focus('.entryName-field .form-control');
          await blur('.entryName-field .form-control');

          expect(this.$('.entryName-field')).to.have.class('has-error');
          done();
        });

      it('marks "argument name" field as valid when it is not empty',
        async function (done) {
          await renderCreate(this);
          await addArgument();

          await fillIn('.entryName-field .form-control', 'somename');
          await wait();

          expect(this.$('.entryName-field')).to.have.class('has-success');
          done();
        });

      it('marks "argument name" field as invalid when there are two arguments with the same name',
        async function (done) {
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
          done();
        });

      it('provides argument types options for "argument type" field',
        async function (done) {
          await renderCreate(this);
          await addArgument();

          await clickTrigger('.type-field');

          const $options = $('.ember-power-select-option');
          expect($options).to.have.length(argumentTypes.length);
          argumentTypes.forEach(({ label }, i) =>
            expect($options.eq(i).text().trim()).to.equal(label)
          );
          done();
        });

      it('marks "argument default value" field as valid when it is empty',
        async function (done) {
          await renderCreate(this);
          await addArgument();

          await focus('.entryDefaultValue-field .form-control');
          await blur('.entryDefaultValue-field .form-control');

          expect(this.$('.entryDefaultValue-field')).to.have.class('has-success');
          done();
        });

      it('renders "results" field with no result defined', async function (done) {
        await renderCreate(this);

        const $label = this.$('.results-field .control-label');
        const $entries = this.$('.results-field .entries-field');
        const $addBtn = this.$('.results-field .add-field-button');
        expect($label.text().trim()).to.equal('Results:');
        expect($entries).to.have.length(0);
        expect($addBtn.text().trim()).to.equal('Add result');
        done();
      });

      it('allows to add new, empty result', async function (done) {
        await renderCreate(this);

        await addResult();

        const $entries = this.$('.results-field .entry-field');
        expect($entries).to.have.length(1);
        const $entry = $entries.eq(0);

        const $entryNameField = $entry.find('.entryName-field .form-control');
        expect($entryNameField).to.have.attr('type', 'text');
        expect($entryNameField).to.have.attr('placeholder', 'Name');
        expect($entryNameField).to.have.value('');

        const $entryTypeField = $entry.find('.type-field .dropdown-field-trigger');
        expect($entryTypeField.text().trim()).to.equal('Integer');
        done();
      });

      it('marks "result name" field as invalid when it is empty', async function (done) {
        await renderCreate(this);
        await addResult();

        await focus('.entryName-field .form-control');
        await blur('.entryName-field .form-control');

        expect(this.$('.entryName-field')).to.have.class('has-error');
        done();
      });

      it('marks "result name" field as invalid when it contains reserved name "exception"',
        async function (done) {
          await renderCreate(this);
          await addResult();

          await fillIn('.entryName-field .form-control', 'exception');

          expect(this.$('.entryName-field')).to.have.class('has-error');
          done();
        }
      );

      it('marks "result name" field as valid when it is not empty',
        async function (done) {
          await renderCreate(this);
          await addResult();

          await fillIn('.entryName-field .form-control', 'somename');

          expect(this.$('.entryName-field')).to.have.class('has-success');
          done();
        });

      it('marks "result name" field as invalid when there are two results with the same name',
        async function (done) {
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
          done();
        });

      it('provides result types options for "result type" field', async function (done) {
        await renderCreate(this);
        await addResult();

        await clickTrigger('.type-field');

        const $options = $('.ember-power-select-option');
        expect($options).to.have.length(resultTypes.length);
        resultTypes.forEach(({ label }, i) =>
          expect($options.eq(i).text().trim()).to.equal(label)
        );
        done();
      });

      it('renders "resources" section with cpu, memory and storage fields groups',
        async function (done) {
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
          done();
        });

      it('creates simple lambda on submit button click', async function (done) {
        await renderCreate(this);

        const revision = await fillWithMinimumData(this);
        await click('.btn-submit');

        expect(this.get('submitStub')).to.be.calledOnce
          .and.to.be.calledWith(revision);
        done();
      });

      it('resets form on successfull submission', async function (done) {
        await renderCreate(this);

        await fillWithMinimumData(this);
        await click('.btn-submit');

        expect(this.$('.name-field .form-control')).to.have.value('');
        done();
      });

      it('does not reset form on failed submission', async function (done) {
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
        done();
      });

      it('creates complex lambda on submit button click', async function (done) {
        await renderCreate(this);

        await fillIn('.name-field .form-control', 'myname');
        await selectChoose('.state-field', 'Stable');
        await fillIn('.summary-field .form-control', 'mysummary');
        await fillIn('.dockerImage-field .form-control', 'myimage');
        await fillIn('.preferredBatchSize-field .form-control', '250');

        for (let i = 0; i < 2; i++) {
          await addArgument();
          const nthArgSelector = `.arguments-field .collection-item:nth-child(${i + 1})`;
          await fillIn(`${nthArgSelector} .entryName-field .form-control`, `arg${i}`);
          await selectChoose(
            `${nthArgSelector} .type-field`,
            argumentTypes[i].label
          );
          if (i === 0) {
            await click(`${nthArgSelector} .entryIsOptional-field .form-control`);
            await fillIn(`${nthArgSelector} .entryDefaultValue-field .form-control`, '"val0"');
          }

          await addResult();
          const nthResSelector = `.results-field .collection-item:nth-child(${i + 1})`;
          await fillIn(`${nthResSelector} .entryName-field .form-control`, `res${i}`);
          await selectChoose(
            `${nthResSelector} .type-field`,
            argumentTypes[i].label
          );
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
          state: 'stable',
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
          preferredBatchSize: 250,
          argumentSpecs: argumentTypes.slice(0, 2)
            .map(({ dataSpec }, idx) => {
              const arg = {
                name: `arg${idx}`,
                dataSpec,
                isOptional: idx === 0,
              };
              if (idx === 0) {
                arg.defaultValue = 'val0';
              }
              return arg;
            }),
          resultSpecs: resultTypes.slice(0, 2).map(({ dataSpec }, idx) => ({
            name: `res${idx}`,
            dataSpec,
            relayMethod: 'returnValue',
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
        done();
      });

      states.forEach(({ value, label }) => {
        it(`creates lambda in "${label}" state on submit button click`,
          async function (done) {
            await renderCreate(this);

            const revision = await fillWithMinimumData(this);
            await selectChoose('.state-field', label);
            await click('.btn-submit');

            expect(this.get('submitStub')).to.be.calledOnce
              .and.to.be.calledWith(Object.assign(revision, {
                state: value,
              }));
            done();
          });
      });

      argumentTypes.rejectBy('label', 'Time series measurement')
        .forEach(({ dataSpec, label }) => {
          it(`creates lambda with "${label}"-typed argument on submit button click`,
            async function (done) {
              await renderCreate(this);

              const revision = await fillWithMinimumData(this);
              await addArgument();
              const argSelector = '.arguments-field .collection-item:first-child';
              await fillIn(`${argSelector} .entryName-field .form-control`, 'entry');
              await selectChoose(`${argSelector} .type-field`, label);
              await click('.btn-submit');

              expect(this.get('submitStub')).to.be.calledOnce
                .and.to.be.calledWith(Object.assign(revision, {
                  argumentSpecs: [{
                    name: 'entry',
                    dataSpec,
                    isOptional: false,
                  }],
                }));
              done();
            });
        });

      it('creates lambda with "Time series measurement"-typed argument on submit button click',
        async function (done) {
          await renderCreate(this);

          const revision = await fillWithMinimumData(this);
          await addArgument();
          const argSelector = '.arguments-field .collection-item:first-child';
          await fillIn(`${argSelector} .entryName-field .form-control`, 'entry');
          await selectChoose(`${argSelector} .type-field`, 'Time series measurement');
          await click(
            `${argSelector} .timeSeriesMeasurementValueConstraints-field .add-field-button`
          );
          await selectChoose(`${argSelector} .nameMatcherType-field`, 'Has prefix');
          await fillIn(`${argSelector} .nameMatcher-field .form-control`, 'file_');
          await selectChoose(`${argSelector} .unit-field`, 'Custom');
          await fillIn(`${argSelector} .customUnit-field .form-control`, 'liters');
          await click('.btn-submit');

          expect(this.get('submitStub')).to.be.calledOnce
            .and.to.be.calledWith(Object.assign(revision, {
              argumentSpecs: [{
                name: 'entry',
                dataSpec: {
                  type: 'timeSeriesMeasurement',
                  valueConstraints: {
                    specs: [{
                      nameMatcherType: 'hasPrefix',
                      nameMatcher: 'file_',
                      unit: 'custom:liters',
                    }],
                  },
                },
                isOptional: false,
              }],
            }));
          done();
        });

      resultTypes.rejectBy('label', 'Time series measurement')
        .forEach(({ dataSpec, label }) => {
          it(`creates lambda with "${label}"-typed result on submit button click`,
            async function (done) {
              await renderCreate(this);

              const revision = await fillWithMinimumData(this);
              await addResult();
              const resSelector = '.results-field .collection-item:first-child';
              await fillIn(`${resSelector} .entryName-field .form-control`, 'entry');
              await selectChoose(`${resSelector} .type-field`, label);
              await click('.btn-submit');

              expect(this.get('submitStub')).to.be.calledOnce
                .and.to.be.calledWith(Object.assign(revision, {
                  resultSpecs: [{
                    name: 'entry',
                    dataSpec,
                    relayMethod: 'returnValue',
                  }],
                }));
              done();
            });
        });

      it('creates lambda with "Time series measurement"-typed result on submit button click',
        async function (done) {
          await renderCreate(this);

          const revision = await fillWithMinimumData(this);
          await addResult();
          const resSelector = '.results-field .collection-item:first-child';
          await fillIn(`${resSelector} .entryName-field .form-control`, 'entry');
          await selectChoose(`${resSelector} .type-field`, 'Time series measurement');
          await click(
            `${resSelector} .timeSeriesMeasurementValueConstraints-field .add-field-button`
          );
          await selectChoose(`${resSelector} .nameMatcherType-field`, 'Has prefix');
          await fillIn(`${resSelector} .nameMatcher-field .form-control`, 'file_');
          await selectChoose(`${resSelector} .unit-field`, 'Custom');
          await fillIn(`${resSelector} .customUnit-field .form-control`, 'liters');
          await click('.btn-submit');

          expect(this.get('submitStub')).to.be.calledOnce
            .and.to.be.calledWith(Object.assign(revision, {
              resultSpecs: [{
                name: 'entry',
                dataSpec: {
                  type: 'timeSeriesMeasurement',
                  valueConstraints: {
                    specs: [{
                      nameMatcherType: 'hasPrefix',
                      nameMatcher: 'file_',
                      unit: 'custom:liters',
                    }],
                  },
                },
                relayMethod: 'returnValue',
              }],
            }));
          done();
        });

      it('disables sumbit button when one of fields is invalid', async function (done) {
        await renderCreate(this);

        await fillWithMinimumData(this);
        await fillIn('.name-field .form-control', '');

        expect(this.$('.btn-submit')).to.have.attr('disabled');
        done();
      });

      it('disables sumbit button when submission is pending', async function (done) {
        await renderCreate(this);
        this.set('submitStub', sinon.stub().returns(new Promise(() => {})));

        await fillWithMinimumData(this);
        await click('.btn-submit');

        expect(this.$('.btn-submit')).to.have.attr('disabled');
        done();
      });

      it('fills form fields with initial data taken from "revision"',
        async function (done) {
          this.set('revision', {
            name: 'myname',
            state: 'stable',
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
            preferredBatchSize: 150,
            argumentSpecs: [{
              name: 'arg',
              dataSpec: { type: 'string' },
              isOptional: true,
              defaultValue: 'default',
            }],
            resultSpecs: [{
              name: 'res',
              dataSpec: { type: 'integer' },
            }],
          });

          await renderCreate(this);

          expect(this.$('.field-disabled')).to.have.length(0);
          expect(this.$('.name-field .form-control')).to.have.value('myname');
          // In create mode state is always draft on init
          expect(this.$('.state-field .field-component').text().trim()).to.equal('Draft');
          expect(this.$('.summary-field .form-control')).to.have.value('summary');
          expect(this.$('.engine-field .field-component').text().trim()).to.equal('OpenFaaS');
          expect(this.$('.dockerImage-field .form-control')).to.to.have.value('myimage');
          expect(this.$('.preferredBatchSize-field .form-control')).to.have.value('150');
          const $argument = this.$('.arguments-field .entry-field');
          expect($argument.find('.entryName-field .form-control')).to.have.value('arg');
          expect($argument.find('.type-field .field-component').text().trim())
            .to.equal('String');
          expect($argument.find('.entryIsOptional-field .form-control'))
            .to.have.class('checked');
          expect($argument.find('.entryDefaultValue-field .form-control'))
            .to.have.value('"default"');
          const $result = this.$('.results-field .entry-field');
          expect($result.find('.entryName-field .form-control')).to.have.value('res');
          expect($result.find('.type-field .field-component').text().trim())
            .to.equal('Integer');
          expect(this.$('.readonly-field .form-control')).to.have.class('checked');
          expect(this.$('.mountSpace-field .form-control')).to.have.class('checked');
          expect(this.$('.mountPoint-field .form-control')).to.have.value('/some/path');
          expect(this.$('.oneclientOptions-field .form-control')).to.have.value('oc-options');
          done();
        });
    });

    context('in "view" mode', function () {
      it('has class "mode-view"', async function (done) {
        await renderView();

        expect(this.$('.atm-lambda-form')).to.have.class('mode-view');
        done();
      });

      it('does not show submit button', async function (done) {
        await renderView();

        expect(this.$('.btn-submit')).to.not.exist;
        done();
      });

      it('shows simple openfaas lambda with minimal resources spec',
        async function (done) {
          this.set('revision', {
            name: 'myname',
            state: 'draft',
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

          await renderView();

          expect(this.$('.field-enabled')).to.not.exist;
          expect(this.$('.name-field .form-control')).to.have.value('myname');
          expect(this.$('.state-field .field-component').text().trim()).to.equal('Draft');
          expect(this.$('.summary-field .form-control')).to.have.value('summary');
          expect(this.$('.engine-field .field-component').text().trim()).to.equal('OpenFaaS');
          expect(this.$('.dockerImage-field .form-control')).to.to.have.value('myimage');
          expect(this.$('.onedataFunctionOptions-field')).to.not.exist;
          expect(this.$('.readonly-field .form-control')).to.have.class('checked');
          expect(this.$('.mountSpace-field .form-control')).to.exist
            .and.to.not.have.class('checked');
          expect(this.$('.mountSpaceOptions-collapse')).to.not.have.class('in');
          expect(this.$('.cpuRequested-field .form-control')).to.have.value('0.1');
          expect(this.$('.cpuLimitUnlimitedDesc-field .form-control'))
            .to.have.value(undefined);
          expect(this.$('.memoryRequested-field .form-control')).to.have.value('128');
          expect(this.$('.memoryLimitUnlimitedDesc-field .form-control'))
            .to.have.value(undefined);
          expect(this.$('.ephemeralStorageRequested-field .form-control'))
            .to.have.value('0');
          expect(
            this.$('.ephemeralStorageLimitUnlimitedDesc-field .form-control')
          ).to.have.value(undefined);
          done();
        });

      it('shows simple onedata function lambda with full resources spec',
        async function (done) {
          this.set('revision', {
            name: 'myname',
            state: 'draft',
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

          await renderView();

          expect(this.$('.field-enabled')).to.not.exist;
          expect(this.$('.name-field .form-control')).to.have.value('myname');
          expect(this.$('.state-field .field-component').text().trim()).to.equal('Draft');
          expect(this.$('.summary-field .form-control')).to.have.value('summary');
          expect(this.$('.summary-field .form-control')).to.have.value('summary');
          expect(this.$('.onedataFunctionName-field .form-control')).to.have.value('myfunc');
          expect(this.$('.openfaasOptions-field')).to.not.exist;
          expect(this.$('.cpuRequested-field .form-control')).to.have.value('0.1');
          expect(this.$('.cpuLimit-field .form-control')).to.have.value('1');
          expect(this.$('.memoryRequested-field .form-control')).to.have.value('128');
          expect(this.$('.memoryLimit-field .form-control')).to.have.value('256');
          expect(this.$('.ephemeralStorageRequested-field .form-control')).to.have.value('1');
          expect(this.$('.ephemeralStorageLimit-field .form-control')).to.have.value('10');
          done();
        });

      it('shows mount space options when passed lambda has "mount space" enabled',
        async function (done) {
          this.set('revision', {
            operationSpec: {
              engine: 'openfaas',
              dockerExecutionOptions: {
                mountOneclient: true,
                oneclientMountPoint: '/some/path',
                oneclientOptions: 'oc-options',
              },
            },
          });

          await renderView();

          expect(this.$('.field-enabled')).to.not.exist;
          expect(this.$('.mountSpaceOptions-collapse')).to.have.class('in');
          expect(this.$('.mountPoint-field .form-control')).to.have.value('/some/path');
          expect(this.$('.oneclientOptions-field .form-control')).to.have.value('oc-options');
          done();
        });

      it('shows arguments of passed lambda', async function (done) {
        const argumentTypesToCheck =
          argumentTypes.rejectBy('label', 'Time series measurement');
        this.set('revision', {
          operationSpec: {
            engine: 'openfaas',
          },
          argumentSpecs: argumentTypesToCheck.map(({ dataSpec }, idx) => ({
            name: `entry${idx}`,
            dataSpec,
            isOptional: idx === 0,
            defaultValue: idx === 0 ? 'val0' : null,
          })),
        });

        await renderView();

        expect(this.$('.field-enabled')).to.not.exist;
        const $entries = this.$('.arguments-field .entry-field');
        expect($entries).to.have.length(argumentTypesToCheck.length);
        argumentTypesToCheck.forEach(({ label: type }, idx) => {
          const $entry = $entries.eq(idx);
          expect($entry.find('.entryName-field .form-control')).to.have.value(`entry${idx}`);
          expect($entry.find('.type-field .field-component').text().trim())
            .to.equal(type);
          const $optionalToggle = $entry.find('.entryIsOptional-field .form-control');
          const $defaultValueField = $entry.find('.entryDefaultValue-field .form-control');
          if (idx === 0) {
            expect($optionalToggle).to.have.class('checked');
            expect($defaultValueField).to.have.value('"val0"');
          } else {
            expect($optionalToggle).to.not.have.class('checked');
            if ($defaultValueField.length) {
              expect($defaultValueField).to.have.value('');
            }
          }
        });
        done();
      });

      it('shows time series measurement argument of passed lambda', async function (done) {
        this.set('revision', {
          operationSpec: {
            engine: 'openfaas',
          },
          argumentSpecs: [{
            name: 'entry1',
            dataSpec: {
              type: 'timeSeriesMeasurement',
              valueConstraints: {
                specs: [{
                  nameMatcherType: 'hasPrefix',
                  nameMatcher: 'file_',
                  unit: 'custom:liters',
                }],
              },
            },
            isOptional: false,
            defaultValue: null,
          }],
        });

        await renderView();

        expect(find('.arguments-field .nameMatcherType-field').textContent).to.contain('Has prefix');
        expect(find('.arguments-field .nameMatcher-field input').value).to.equal('file_');
        expect(find('.arguments-field .unit-field').textContent).to.contain('Custom');
        expect(find('.arguments-field .customUnit-field input').value).to.equal('liters');
        done();
      });

      it('shows results of passed lambda', async function (done) {
        const resultTypesToCheck = resultTypes.rejectBy('label', 'Time series measurement');
        this.set('revision', {
          operationSpec: {
            engine: 'openfaas',
          },
          resultSpecs: resultTypesToCheck.map(({ dataSpec }, idx) => ({
            name: `entry${idx}`,
            dataSpec,
          })),
        });

        await renderView();

        expect(this.$('.field-enabled')).to.not.exist;
        expect(this.$('.results-field')).to.exist;
        const $entries = this.$('.results-field .entry-field');
        expect($entries).to.have.length(resultTypesToCheck.length);

        resultTypesToCheck.forEach(({ label: type }, idx) => {
          const $entry = $entries.eq(idx);
          expect($entry.find('.entryName-field .form-control')).to.have.value(`entry${idx}`);
          expect($entry.find('.type-field .field-component').text().trim())
            .to.equal(type);
        });
        done();
      });

      it('shows time series measurement result of passed lambda', async function (done) {
        this.set('revision', {
          operationSpec: {
            engine: 'openfaas',
          },
          resultSpecs: [{
            name: 'entry1',
            dataSpec: {
              type: 'timeSeriesMeasurement',
              valueConstraints: {
                specs: [{
                  nameMatcherType: 'hasPrefix',
                  nameMatcher: 'file_',
                  unit: 'custom:liters',
                }],
              },
            },
          }],
        });

        await renderView();

        expect(find('.results-field .nameMatcherType-field').textContent).to.contain('Has prefix');
        expect(find('.results-field .nameMatcher-field input').value).to.equal('file_');
        expect(find('.results-field .unit-field').textContent).to.contain('Custom');
        expect(find('.results-field .customUnit-field input').value).to.equal('liters');
        done();
      });
    });

    context('in "edit" mode', function () {
      beforeEach(function () {
        this.set('revision', {
          name: 'someName',
          summary: 'someSummary',
          state: 'draft',
        });
      });

      it('has class "mode-edit"', async function (done) {
        await renderEdit(this);

        expect(this.$('.atm-lambda-form')).to.have.class('mode-edit');
        done();
      });

      it('renders two buttons - save and cancel', async function (done) {
        await renderEdit(this);

        const $saveBtn = this.$('.btn-submit');
        const $cancelBtn = this.$('.btn-cancel');
        expect($saveBtn).to.exist;
        expect($saveBtn.text().trim()).to.equal('Save');
        expect($cancelBtn).to.exist;
        expect($cancelBtn.text().trim()).to.equal('Cancel');
        done();
      });

      it('shows lambda values and only one field enabled - state',
        async function (done) {
          this.set('revision', {
            name: 'myname',
            state: 'stable',
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
            preferredBatchSize: 150,
            argumentSpecs: [{
              name: 'arg',
              dataSpec: { type: 'string' },
              isOptional: true,
              defaultValue: 'default',
            }],
            resultSpecs: [{
              name: 'res',
              dataSpec: { type: 'integer' },
            }],
          });

          await renderEdit(this);

          const $enabledFields =
            this.$('.field-enabled:not(.form-fields-group-renderer)');
          expect($enabledFields).to.have.length(1);
          expect($enabledFields).to.have.class('state-field');

          expect(this.$('.name-field .form-control')).to.have.value('myname');
          expect(this.$('.state-field .field-component').text().trim()).to.equal('Stable');
          expect(this.$('.summary-field .form-control')).to.have.value('summary');
          expect(this.$('.engine-field .field-component').text().trim()).to.equal('OpenFaaS');
          expect(this.$('.dockerImage-field .form-control')).to.to.have.value('myimage');
          expect(this.$('.preferredBatchSize-field .form-control')).to.have.value('150');
          const $argument = this.$('.arguments-field .entry-field');
          expect($argument.find('.entryName-field .form-control')).to.have.value('arg');
          expect($argument.find('.type-field .field-component').text().trim())
            .to.equal('String');
          expect($argument.find('.entryIsOptional-field .form-control'))
            .to.have.class('checked');
          expect($argument.find('.entryDefaultValue-field .form-control'))
            .to.have.value('"default"');
          const $result = this.$('.results-field .entry-field');
          expect($result.find('.entryName-field .form-control')).to.have.value('res');
          expect($result.find('.type-field .field-component').text().trim())
            .to.equal('Integer');
          expect(this.$('.readonly-field .form-control')).to.have.class('checked');
          expect(this.$('.mountSpace-field .form-control')).to.have.class('checked');
          expect(this.$('.mountPoint-field .form-control')).to.have.value('/some/path');
          expect(this.$('.oneclientOptions-field .form-control')).to.have.value('oc-options');
          done();
        });

      it('modifies lambda on submit button click (all enabled fields modified)',
        async function (done) {
          await renderEdit(this);

          await selectChoose('.state-field', 'Stable');
          await click('.btn-submit');

          expect(this.get('submitStub')).to.be.calledOnce
            .and.to.be.calledWith({ state: 'stable' });
          done();
        });

      it('modifies lambda on submit button click (no fields modified)',
        async function (done) {
          await renderEdit(this);

          await click('.btn-submit');

          expect(this.get('submitStub')).to.be.calledOnce
            .and.to.be.calledWith({});
          done();
        });

      it('calls onCancel on "cancel" click', async function (done) {
        await renderEdit(this);

        await click('.btn-cancel');

        expect(this.get('cancelSpy')).to.be.calledOnce;
        done();
      });

      it('disables sumbit and cancel buttons when submission is pending',
        async function (done) {
          await renderEdit(this);
          this.set('submitStub', sinon.stub().returns(new Promise(() => {})));

          await click('.btn-submit');

          expect(this.$('.btn-submit')).to.have.attr('disabled');
          expect(this.$('.btn-cancel')).to.have.attr('disabled');
          done();
        });
    });
  }
);

async function renderCreate(testCase) {
  testCase.set('submitStub', sinon.stub().resolves());
  await render(hbs `{{content-atm-inventories-lambdas/atm-lambda-form
    mode="create"
    revision=revision
    onSubmit=submitStub
    defaultAtmResourceSpec=defaultAtmResourceSpec
  }}`);
}

async function renderView() {
  await render(hbs `{{content-atm-inventories-lambdas/atm-lambda-form
    mode="view"
    revision=revision
  }}`);
}

async function renderEdit(testCase) {
  testCase.setProperties({
    submitStub: sinon.stub().resolves(),
    cancelSpy: sinon.spy(),
  });
  await render(hbs `{{content-atm-inventories-lambdas/atm-lambda-form
    mode="edit"
    revision=revision
    onSubmit=submitStub
    onCancel=cancelSpy
  }}`);
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
    state: 'draft',
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
    preferredBatchSize: 100,
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
