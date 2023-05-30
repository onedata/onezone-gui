import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, fillIn, focus, blur, click, find, findAll, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import { registerService } from '../../../helpers/stub-service';
import Service from '@ember/service';
import globals from 'onedata-gui-common/utils/globals';

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

// Types which does not take any additional parameters and are easy to convert
// to dataSpec object.
const testConvenientTypes = [
  'Boolean',
  'String',
  'Object',
  'Dataset',
  'Range',
];

const resultTypes = [
  'Number',
  'Boolean',
  'String',
  'Object',
  'File',
  'Dataset',
  'Range',
  'Array',
  'Time series measurement',
];

describe(
  'Integration | Component | content-atm-inventories-lambdas/atm-lambda-form',
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

    it('has class "atm-lambda-form"', async function () {
      await render(hbs `{{content-atm-inventories-lambdas/atm-lambda-form}}`);

      expect(this.element.children).to.have.length(1);
      expect(this.element.children[0]).to.have.class('atm-lambda-form');
    });

    context('in "create" mode', function () {
      it('has class "mode-create"', async function () {
        await renderCreate(this);

        expect(find('.atm-lambda-form')).to.have.class('mode-create');
      });

      it('renders empty "name" field', async function () {
        await renderCreate(this);

        const label = find('.name-field .control-label');
        const field = find('.name-field .form-control');
        expect(label).to.have.trimmed.text('Name:');
        expect(field).to.have.attr('type', 'text');
        expect(field).to.have.value('');
      });

      it('marks "name" field as invalid when it is empty', async function () {
        await renderCreate(this);

        await focus('.name-field .form-control');
        await blur('.name-field .form-control');

        expect(find('.name-field')).to.have.class('has-error');
      });

      it('marks "name" field as valid when it is not empty', async function () {
        await renderCreate(this);

        await fillIn('.name-field .form-control', 'somename');

        expect(find('.name-field')).to.have.class('has-success');
      });

      it('renders "state" field with preselected "draft" option', async function () {
        await renderCreate(this);

        const label = find('.state-field .control-label');
        const field = find('.state-field .dropdown-field-trigger');
        expect(label).to.have.trimmed.text('State:');
        expect(field).to.have.trimmed.text('Draft');
      });

      it('allows to choose different state for "state" field', async function () {
        await renderCreate(this);

        await clickTrigger('.state-field');

        const options = globals.document.querySelectorAll('.ember-power-select-option');
        expect(options).to.have.length(3);
        states.forEach(({ label }, idx) =>
          expect(options[idx]).to.have.trimmed.text(label)
        );
      });

      it('renders empty "summary" field', async function () {
        await renderCreate(this);

        const label = find('.summary-field .control-label');
        const field = find('.summary-field .form-control');
        expect(label).to.have.trimmed.text('Summary (optional):');
        expect(field).to.have.attr('type', 'text');
        expect(field).to.have.value('');
      });

      it('marks "summary" field as valid when it is empty', async function () {
        await renderCreate(this);

        await focus('.summary-field .form-control');
        await blur('.summary-field .form-control');

        expect(find('.summary-field')).to.have.class('has-success');
      });

      it('renders "engine" field with preselected "openfaas" option',
        async function () {
          await renderCreate(this);

          const label = find('.engine-field .control-label');
          const field = find('.engine-field .dropdown-field-trigger');
          expect(label).to.have.trimmed.text('Engine:');
          expect(field).to.have.trimmed.text('OpenFaaS');
        });

      it('provides only "openfass" option for "engine" field', async function () {
        await renderCreate(this);

        await clickTrigger('.engine-field');

        const options = globals.document.querySelectorAll('.ember-power-select-option');
        expect(options).to.have.length(1);
        expect(options[0]).to.have.trimmed.text('OpenFaaS');
      });

      context('when selected engine is "openfaas"', function () {
        it('shows only openfaas-related fields', async function () {
          await renderCreate(this);

          expect(find('.openfaasOptions-collapse')).to.have.class('in');
          expect(find('.onedataFunctionOptions-collapse')).to.not.exist;
        });

        it('renders empty "docker image" field', async function () {
          await renderCreate(this);

          const label = find('.dockerImage-field .control-label');
          const field = find('.dockerImage-field .form-control');
          expect(label).to.have.trimmed.text('Docker image:');
          expect(field).to.have.attr('type', 'text');
          expect(field).to.have.value('');
        });

        it('marks "docker image" field as invalid when it is empty',
          async function () {
            await renderCreate(this);

            await focus('.dockerImage-field .form-control');
            await blur('.dockerImage-field .form-control');

            expect(find('.dockerImage-field')).to.have.class('has-error');
          });

        it('marks "docker image" field as valid when it is not empty',
          async function () {
            await renderCreate(this);

            await fillIn('.dockerImage-field .form-control', 'somename');

            expect(find('.dockerImage-field')).to.have.class('has-success');
          });

        it('renders checked "readonly" toggle', async function () {
          await renderCreate(this);

          const label = find('.readonly-field .control-label');
          const field = find('.readonly-field .form-control');
          expect(label).to.have.trimmed.text('Read-only:');
          expect(field).to.have.class('checked');
        });

        it('renders checked "mount space" toggle', async function () {
          await renderCreate(this);

          const label = find('.mountSpace-field .control-label');
          const field = find('.mountSpace-field .form-control');
          expect(label).to.have.trimmed.text('Mount space:');
          expect(field).to.have.class('checked');
        });

        context('when "mount space" is checked', function () {
          it('renders expanded mount space options',
            async function () {
              await renderCreate(this);

              await toggleMountSpace(true);

              expect(find('.mountSpaceOptions-collapse')).to.have.class('in');
            });

          it('renders "mount point" field with "/mnt/onedata" as a default value',
            async function () {
              await renderCreate(this);
              await toggleMountSpace(true);

              const fieldsGroup = find('.mountSpaceOptions-field');
              const label = fieldsGroup.querySelector('.mountPoint-field .control-label');
              const field = fieldsGroup.querySelector('.mountPoint-field .form-control');
              expect(label).to.have.trimmed.text('Mount point:');
              expect(field).to.have.attr('type', 'text');
              expect(field).to.have.value('/mnt/onedata');
            });

          it('marks "mount point" field as invalid when it is empty',
            async function () {
              await renderCreate(this);
              await toggleMountSpace(true);

              await fillIn('.mountPoint-field .form-control', '');

              expect(find('.mountPoint-field')).to.have.class('has-error');
            });

          it('renders empty "oneclient options" field', async function () {
            await renderCreate(this);
            await toggleMountSpace(true);

            const fieldsGroup = find('.mountSpaceOptions-field');
            const label =
              fieldsGroup.querySelector('.oneclientOptions-field .control-label');
            const field =
              fieldsGroup.querySelector('.oneclientOptions-field .form-control');
            expect(label).to.have.trimmed.text('Oneclient options:');
            expect(field).to.have.attr('type', 'text');
            expect(field).to.have.value('');
          });

          it('marks "oneclient options" field as valid when it is empty',
            async function () {
              await renderCreate(this);

              await focus('.oneclientOptions-field .form-control');
              await blur('.oneclientOptions-field .form-control');

              expect(find('.oneclientOptions-field')).to.have.class('has-success');
            });
        });

        context('when "mount space" is unchecked', function () {
          it('renders collapsed mount space options',
            async function () {
              await renderCreate(this);

              await toggleMountSpace(false);

              expect(find('.mountSpaceOptions-collapse')).to.not.have.class('in');
            });
        });
      });

      it('renders "config parameters" field with no params defined', async function () {
        await renderCreate(this);

        const label = find('.configParameters-field .control-label');
        const entries = findAll('.configParameters-field .entry-field');
        const addBtn = find('.configParameters-field .add-field-button');
        expect(label).to.have.trimmed.text('Configuration parameters:');
        expect(entries).to.have.length(0);
        expect(addBtn).to.have.trimmed.text('Add parameter');
      });

      it('renders "arguments" field with no argument defined', async function () {
        await renderCreate(this);

        const label = find('.arguments-field .control-label');
        const entries = findAll('.arguments-field .entry-field');
        const addBtn = find('.arguments-field .add-field-button');
        expect(label).to.have.trimmed.text('Arguments:');
        expect(entries).to.have.length(0);
        expect(addBtn).to.have.trimmed.text('Add argument');
      });

      it('renders "results" field with no result defined', async function () {
        await renderCreate(this);

        const label = find('.results-field .control-label');
        const entries = findAll('.results-field .entries-field');
        const addBtn = find('.results-field .add-field-button');
        expect(label).to.have.trimmed.text('Results:');
        expect(entries).to.have.length(0);
        expect(addBtn).to.have.trimmed.text('Add result');
      });

      it('allows to add new, empty result', async function () {
        await renderCreate(this);

        await addResult();

        const entries = findAll('.results-field .entry-field');
        expect(entries).to.have.length(1);
        const entry = entries[0];

        const entryNameField = entry.querySelector('.entryName-field .form-control');
        expect(entryNameField).to.have.attr('type', 'text');
        expect(entryNameField).to.have.attr('placeholder', 'Name');
        expect(entryNameField).to.have.value('');

        const entryTypeField = entry.querySelector('.data-spec-editor');
        expect(entryTypeField).to.have.trimmed.text('Select type...');
      });

      it('marks "result name" field as invalid when it is empty', async function () {
        await renderCreate(this);
        await addResult();

        await focus('.entryName-field .form-control');
        await blur('.entryName-field .form-control');

        expect(find('.entryName-field')).to.have.class('has-error');
      });

      it('marks "result name" field as invalid when it contains reserved name "exception"',
        async function () {
          await renderCreate(this);
          await addResult();

          await fillIn('.entryName-field .form-control', 'exception');

          expect(find('.entryName-field')).to.have.class('has-error');
        }
      );

      it('marks "result name" field as valid when it is not empty',
        async function () {
          await renderCreate(this);
          await addResult();

          await fillIn('.entryName-field .form-control', 'somename');

          expect(find('.entryName-field')).to.have.class('has-success');
        });

      it('marks "result name" field as invalid when there are two results with the same name',
        async function () {
          await renderCreate(this);
          await addResult();
          await addResult();

          const nthArgSelector = i => `.results-field .collection-item:nth-child(${i + 1})`;
          await fillIn(`${nthArgSelector(0)} .entryName-field .form-control`, 'somename');
          await fillIn(`${nthArgSelector(1)} .entryName-field .form-control`, 'somename');

          const fieldMessages = findAll('.results-field .collection-item .field-message');
          expect(fieldMessages).to.have.length(2);
          [0, 1].forEach(i =>
            expect(fieldMessages[i])
            .to.have.trimmed.text('This field must have a unique value')
          );
          expect(findAll('.entryName-field.has-error')).to.have.length(2);
        });

      it('provides result types options for "result type" field', async function () {
        await renderCreate(this);
        await addResult();

        await clickTrigger('.data-spec-editor');

        const options = globals.document.querySelectorAll('.ember-power-select-option');
        expect(options).to.have.length(resultTypes.length);
        resultTypes.forEach((type, i) =>
          expect(options[i]).to.have.trimmed.text(type)
        );
      });

      it('renders "resources" section with cpu, memory and storage fields groups',
        async function () {
          await renderCreate(this);

          const resourcesSection = find('.resources-field');
          expect(resourcesSection.querySelector('.control-label'))
            .to.have.trimmed.text('Resources');
          // Check if translations for resources fields are loaded
          expect(resourcesSection).to.contain.text('Limit');

          expect(resourcesSection.querySelector('.cpuRequested-field .form-control'))
            .to.have.value('0.1');
          expect(resourcesSection.querySelector('.cpuLimit-field .form-control'))
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
            const requestedField = find(`.${resourceName}Requested-field`);
            expect(requestedField.querySelector('input')).to.have.value(requested[0]);
            expect(requestedField.querySelector('.ember-power-select-trigger'))
              .to.contain.text(requested[1]);
            const limitField = find(`.${resourceName}Limit-field`);
            expect(limitField.querySelector('input')).to.have.value(limit[0]);
            expect(limitField.querySelector('.ember-power-select-trigger'))
              .to.contain.text(limit[1]);
          });
        });

      it('creates simple lambda on submit button click', async function () {
        await renderCreate(this);

        const revision = await fillWithMinimumData();
        await click('.btn-submit');

        expect(this.get('submitStub')).to.be.calledOnce
          .and.to.be.calledWith(revision);
      });

      it('resets form on successfull submission', async function () {
        await renderCreate(this);

        await fillWithMinimumData();
        await click('.btn-submit');

        expect(find('.name-field .form-control')).to.have.value('');
      });

      it('does not reset form on failed submission', async function () {
        await renderCreate(this);
        let rejectSubmit;
        this.get('submitStub').returns(
          new Promise((resolve, reject) => rejectSubmit = reject)
        );

        await fillWithMinimumData();
        await click('.btn-submit');
        rejectSubmit();
        await settled();

        expect(find('.name-field .form-control')).to.not.have.value('');
      });

      it('creates complex lambda on submit button click', async function () {
        await renderCreate(this);

        await fillIn('.name-field .form-control', 'myname');
        await selectChoose('.state-field', 'Stable');
        await fillIn('.summary-field .form-control', 'mysummary');
        await fillIn('.dockerImage-field .form-control', 'myimage');
        await fillIn('.preferredBatchSize-field .form-control', '250');

        for (let i = 0; i < 2; i++) {
          await addParameter();
          const nthParamSelector = `.configParameters-field .collection-item:nth-child(${i + 1})`;
          await fillIn(`${nthParamSelector} .entryName-field .form-control`, `param${i}`);
          await selectChoose(
            `${nthParamSelector} .data-spec-editor`,
            testConvenientTypes[i]
          );
          if (i === 1) {
            await click(`${nthParamSelector} .entryIsOptional-field .form-control`);
            await click(`${nthParamSelector} .entryDefaultValue-field .create-value-btn`);
            await fillIn(`${nthParamSelector} .entryDefaultValue-field .form-control`, 'abc');
          }

          await addArgument();
          const nthArgSelector = `.arguments-field .collection-item:nth-child(${i + 1})`;
          await fillIn(`${nthArgSelector} .entryName-field .form-control`, `arg${i}`);
          await selectChoose(
            `${nthArgSelector} .data-spec-editor`,
            testConvenientTypes[i]
          );
          if (i === 1) {
            await click(`${nthArgSelector} .entryIsOptional-field .form-control`);
            await click(`${nthArgSelector} .entryDefaultValue-field .create-value-btn`);
            await fillIn(`${nthArgSelector} .entryDefaultValue-field .form-control`, 'def');
          }

          await addResult();
          const nthResSelector = `.results-field .collection-item:nth-child(${i + 1})`;
          await fillIn(`${nthResSelector} .entryName-field .form-control`, `res${i}`);
          await selectChoose(
            `${nthResSelector} .data-spec-editor`,
            testConvenientTypes[i]
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
          argumentSpecs: testConvenientTypes.slice(0, 2)
            .map((type, idx) => {
              const arg = {
                name: `arg${idx}`,
                dataSpec: {
                  // It's very oversimplified to infer dataSpec from it's translation
                  // but it's good enough for test purposes.
                  type: type.toLowerCase(),
                },
                isOptional: idx === 1,
                defaultValue: idx === 1 ? 'def' : null,
              };
              return arg;
            }),
          resultSpecs: testConvenientTypes.slice(0, 2).map((type, idx) => ({
            name: `res${idx}`,
            dataSpec: {
              // It's very oversimplified to infer dataSpec from it's translation
              // but it's good enough for test purposes.
              type: type.toLowerCase(),
            },
            relayMethod: 'returnValue',
          })),
          configParameterSpecs: testConvenientTypes.slice(0, 2)
            .map((type, idx) => {
              const param = {
                name: `param${idx}`,
                dataSpec: {
                  // It's very oversimplified to infer dataSpec from it's translation
                  // but it's good enough for test purposes.
                  type: type.toLowerCase(),
                },
                isOptional: idx === 1,
                defaultValue: idx === 1 ? 'abc' : null,
              };
              return param;
            }),
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

      states.forEach(({ value, label }) => {
        it(`creates lambda in "${label}" state on submit button click`,
          async function () {
            await renderCreate(this);

            const revision = await fillWithMinimumData();
            await selectChoose('.state-field', label);
            await click('.btn-submit');

            expect(this.get('submitStub')).to.be.calledOnce
              .and.to.be.calledWith(Object.assign(revision, {
                state: value,
              }));
          });
      });

      it('creates lambda result "via file" on submit button click',
        async function () {
          await renderCreate(this);

          const revision = await fillWithMinimumData();
          await addResult();
          const resSelector = '.results-field .collection-item:first-child';
          await fillIn(`${resSelector} .entryName-field .form-control`, 'entry');
          await selectChoose(`${resSelector} .data-spec-editor`, 'String');
          await click(`${resSelector} .entryIsViaFile-field .one-way-toggle`);
          await click('.btn-submit');

          expect(this.get('submitStub')).to.be.calledOnce
            .and.to.be.calledWith(Object.assign(revision, {
              resultSpecs: [{
                name: 'entry',
                dataSpec: {
                  type: 'string',
                },
                relayMethod: 'filePipe',
              }],
            }));
        });

      it('disables sumbit button when one of fields is invalid', async function () {
        await renderCreate(this);

        await fillWithMinimumData();
        await fillIn('.name-field .form-control', '');

        expect(find('.btn-submit')).to.have.attr('disabled');
      });

      it('disables sumbit button when submission is pending', async function () {
        await renderCreate(this);
        this.set('submitStub', sinon.stub().returns(new Promise(() => {})));

        await fillWithMinimumData();
        await click('.btn-submit');

        expect(find('.btn-submit')).to.have.attr('disabled');
      });

      it('fills form fields with initial data taken from "revision"',
        async function () {
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
              dataSpec: { type: 'string' },
            }],
          });

          await renderCreate(this);

          expect(findAll('.field-disabled')).to.have.length(0);
          expect(find('.name-field .form-control')).to.have.value('myname');
          // In create mode state is always draft on init
          expect(find('.state-field .field-component')).to.have.trimmed.text('Draft');
          expect(find('.summary-field .form-control')).to.have.value('summary');
          expect(find('.engine-field .field-component')).to.have.trimmed.text('OpenFaaS');
          expect(find('.dockerImage-field .form-control')).to.to.have.value('myimage');
          expect(find('.preferredBatchSize-field .form-control')).to.have.value('150');
          const argument = find('.arguments-field .entry-field');
          expect(argument.querySelector('.entryName-field .form-control'))
            .to.have.value('arg');
          expect(argument.querySelector('.data-spec-editor'))
            .to.contain.text('String');
          expect(argument.querySelector('.entryIsOptional-field .form-control'))
            .to.have.class('checked');
          expect(argument.querySelector('.entryDefaultValue-field .form-control'))
            .to.have.value('default');
          const result = find('.results-field .entry-field');
          expect(result.querySelector('.entryName-field .form-control'))
            .to.have.value('res');
          expect(result.querySelector('.data-spec-editor'))
            .to.contain.text('String');
          expect(find('.readonly-field .form-control')).to.have.class('checked');
          expect(find('.mountSpace-field .form-control')).to.have.class('checked');
          expect(find('.mountPoint-field .form-control')).to.have.value('/some/path');
          expect(find('.oneclientOptions-field .form-control')).to.have.value('oc-options');
        });
    });

    context('in "view" mode', function () {
      it('has class "mode-view"', async function () {
        await renderView();

        expect(find('.atm-lambda-form')).to.have.class('mode-view');
      });

      it('does not show submit button', async function () {
        await renderView();

        expect(find('.btn-submit')).to.not.exist;
      });

      it('shows simple openfaas lambda with minimal resources spec',
        async function () {
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

          expect(find('.field-enabled')).to.not.exist;
          expect(find('.name-field .form-control')).to.have.value('myname');
          expect(find('.state-field .field-component')).to.have.trimmed.text('Draft');
          expect(find('.summary-field .form-control')).to.have.value('summary');
          expect(find('.engine-field .field-component')).to.have.trimmed.text('OpenFaaS');
          expect(find('.dockerImage-field .form-control')).to.to.have.value('myimage');
          expect(find('.onedataFunctionOptions-field')).to.not.exist;
          expect(find('.readonly-field .form-control')).to.have.class('checked');
          expect(find('.mountSpace-field .form-control')).to.exist
            .and.to.not.have.class('checked');
          expect(find('.mountSpaceOptions-collapse')).to.not.have.class('in');
          expect(find('.cpuRequested-field .form-control')).to.have.value('0.1');
          expect(find('.cpuLimit-field .form-control'))
            .to.have.value('');
          expect(find('.memoryRequested-field .form-control')).to.have.value('128');
          expect(find('.memoryLimit-field .form-control'))
            .to.have.value('');
          expect(find('.ephemeralStorageRequested-field .form-control'))
            .to.have.value('0');
          expect(
            find('.ephemeralStorageLimit-field .form-control')
          ).to.have.value('');
        });

      it('shows simple onedata function lambda with full resources spec',
        async function () {
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

          expect(find('.field-enabled')).to.not.exist;
          expect(find('.name-field .form-control')).to.have.value('myname');
          expect(find('.state-field .field-component')).to.have.trimmed.text('Draft');
          expect(find('.summary-field .form-control')).to.have.value('summary');
          expect(find('.summary-field .form-control')).to.have.value('summary');
          expect(find('.onedataFunctionName-field .form-control')).to.have.value('myfunc');
          expect(find('.openfaasOptions-field')).to.not.exist;
          expect(find('.cpuRequested-field .form-control')).to.have.value('0.1');
          expect(find('.cpuLimit-field .form-control')).to.have.value('1');
          expect(find('.memoryRequested-field .form-control')).to.have.value('128');
          expect(find('.memoryLimit-field .form-control')).to.have.value('256');
          expect(find('.ephemeralStorageRequested-field .form-control')).to.have.value('1');
          expect(find('.ephemeralStorageLimit-field .form-control')).to.have.value('10');
        });

      it('shows mount space options when passed lambda has "mount space" enabled',
        async function () {
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

          expect(find('.field-enabled')).to.not.exist;
          expect(find('.mountSpaceOptions-collapse')).to.have.class('in');
          expect(find('.mountPoint-field .form-control')).to.have.value('/some/path');
          expect(find('.oneclientOptions-field .form-control'))
            .to.have.value('oc-options');
        });

      it('shows parameters of passed lambda', async function () {
        const parameterTypesToCheck = testConvenientTypes.slice(0, 2);
        this.set('revision', {
          operationSpec: {
            engine: 'openfaas',
          },
          configParameterSpecs: parameterTypesToCheck.map((type, idx) => ({
            name: `entry${idx}`,
            dataSpec: {
              type: type.toLocaleLowerCase(),
            },
            isOptional: idx === 1,
            defaultValue: idx === 1 ? 'abc' : null,
          })),
        });

        await renderView();

        expect(find('.field-enabled')).to.not.exist;
        const entries = findAll('.configParameters-field .entry-field');
        expect(entries).to.have.length(parameterTypesToCheck.length);
        parameterTypesToCheck.forEach((type, idx) => {
          const entry = entries[idx];
          expect(entry.querySelector('.entryName-field .form-control'))
            .to.have.value(`entry${idx}`);
          expect(entry.querySelector('.data-spec-editor')).to.contain.text(type);
          const optionalToggle =
            entry.querySelector('.entryIsOptional-field .form-control');
          const defaultValueField =
            entry.querySelector('.entryDefaultValue-field');
          if (idx === 1) {
            expect(optionalToggle).to.have.class('checked');
            expect(defaultValueField.querySelector('textarea')).to.have.value('abc');
          } else {
            expect(optionalToggle).to.not.have.class('checked');
            expect(defaultValueField.querySelector('.full-value-editor')).to.not.exist;
          }
        });
      });

      it('shows arguments of passed lambda', async function () {
        const argumentTypesToCheck = testConvenientTypes.slice(0, 2);
        this.set('revision', {
          operationSpec: {
            engine: 'openfaas',
          },
          argumentSpecs: argumentTypesToCheck.map((type, idx) => ({
            name: `entry${idx}`,
            dataSpec: {
              type: type.toLocaleLowerCase(),
            },
            isOptional: idx === 1,
            defaultValue: idx === 1 ? 'abc' : null,
          })),
        });

        await renderView();

        expect(find('.field-enabled')).to.not.exist;
        const entries = findAll('.arguments-field .entry-field');
        expect(entries).to.have.length(argumentTypesToCheck.length);
        argumentTypesToCheck.forEach((type, idx) => {
          const entry = entries[idx];
          expect(entry.querySelector('.entryName-field .form-control'))
            .to.have.value(`entry${idx}`);
          expect(entry.querySelector('.data-spec-editor')).to.contain.text(type);
          const optionalToggle =
            entry.querySelector('.entryIsOptional-field .form-control');
          const defaultValueField =
            entry.querySelector('.entryDefaultValue-field');
          if (idx === 1) {
            expect(optionalToggle).to.have.class('checked');
            expect(defaultValueField.querySelector('textarea')).to.have.value('abc');
          } else {
            expect(optionalToggle).to.not.have.class('checked');
            expect(defaultValueField.querySelector('.full-value-editor')).to.not.exist;
          }
        });
      });

      it('shows results of passed lambda', async function () {
        const resultTypesToCheck = testConvenientTypes.slice(0, 2);
        this.set('revision', {
          operationSpec: {
            engine: 'openfaas',
          },
          resultSpecs: resultTypesToCheck.map((type, idx) => ({
            name: `entry${idx}`,
            dataSpec: {
              type: type.toLocaleLowerCase(),
            },
            relayMethod: idx === 0 ? 'filePipe' : 'returnValue',
          })),
        });

        await renderView();

        expect(find('.field-enabled')).to.not.exist;
        expect(find('.results-field')).to.exist;
        const entries = findAll('.results-field .entry-field');
        expect(entries).to.have.length(resultTypesToCheck.length);

        resultTypesToCheck.forEach((type, idx) => {
          const entry = entries[idx];
          expect(entry.querySelector('.entryName-field .form-control'))
            .to.have.value(`entry${idx}`);
          expect(entry.querySelector('.data-spec-editor')).to.contain.text(type);
          const isViaFileToggle =
            entry.querySelector('.entryIsViaFile-field .form-control');
          if (idx === 0) {
            expect(isViaFileToggle).to.have.class('checked');
          } else {
            expect(isViaFileToggle).to.not.have.class('checked');
          }
        });
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

      it('has class "mode-edit"', async function () {
        await renderEdit(this);

        expect(find('.atm-lambda-form')).to.have.class('mode-edit');
      });

      it('renders two buttons - save and cancel', async function () {
        await renderEdit(this);

        const saveBtn = find('.btn-submit');
        const cancelBtn = find('.btn-cancel');
        expect(saveBtn).to.exist;
        expect(saveBtn).to.have.trimmed.text('Save');
        expect(cancelBtn).to.exist;
        expect(cancelBtn).to.have.trimmed.text('Cancel');
      });

      it('shows lambda values and only one field enabled - state',
        async function () {
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
              dataSpec: { type: 'string' },
            }],
            configParameterSpecs: [{
              name: 'param',
              dataSpec: { type: 'string' },
              isOptional: false,
              defaultValue: 'defaultParam',
            }],
          });

          await renderEdit(this);

          const enabledFields =
            findAll('.field-enabled:not(.form-fields-group-renderer)');
          expect(enabledFields).to.have.length(1);
          expect(enabledFields[0]).to.have.class('state-field');

          expect(find('.name-field .form-control')).to.have.value('myname');
          expect(find('.state-field .field-component')).to.have.trimmed.text('Stable');
          expect(find('.summary-field .form-control')).to.have.value('summary');
          expect(find('.engine-field .field-component')).to.have.trimmed.text('OpenFaaS');
          expect(find('.dockerImage-field .form-control')).to.to.have.value('myimage');
          expect(find('.preferredBatchSize-field .form-control')).to.have.value('150');
          const parameter = find('.configParameters-field .entry-field');
          expect(parameter.querySelector('.entryName-field .form-control'))
            .to.have.value('param');
          expect(parameter.querySelector('.data-spec-editor'))
            .to.contain.text('String');
          expect(parameter.querySelector('.entryIsOptional-field .form-control'))
            .to.not.have.class('checked');
          expect(parameter.querySelector('.entryDefaultValue-field .form-control'))
            .to.have.value('defaultParam');
          const argument = find('.arguments-field .entry-field');
          expect(argument.querySelector('.entryName-field .form-control'))
            .to.have.value('arg');
          expect(argument.querySelector('.data-spec-editor'))
            .to.contain.text('String');
          expect(argument.querySelector('.entryIsOptional-field .form-control'))
            .to.have.class('checked');
          expect(argument.querySelector('.entryDefaultValue-field .form-control'))
            .to.have.value('default');
          const result = find('.results-field .entry-field');
          expect(result.querySelector('.entryName-field .form-control'))
            .to.have.value('res');
          expect(result.querySelector('.data-spec-editor'))
            .to.contain.text('String');
          expect(find('.readonly-field .form-control')).to.have.class('checked');
          expect(find('.mountSpace-field .form-control')).to.have.class('checked');
          expect(find('.mountPoint-field .form-control')).to.have.value('/some/path');
          expect(find('.oneclientOptions-field .form-control'))
            .to.have.value('oc-options');
        });

      it('modifies lambda on submit button click (all enabled fields modified)',
        async function () {
          await renderEdit(this);

          await selectChoose('.state-field', 'Stable');
          await click('.btn-submit');

          expect(this.get('submitStub')).to.be.calledOnce
            .and.to.be.calledWith({ state: 'stable' });
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

          expect(find('.btn-submit')).to.have.attr('disabled');
          expect(find('.btn-cancel')).to.have.attr('disabled');
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

async function toggleMountSpace(toggleChecked) {
  const mountToggle = find('.mountSpace-field .form-control');
  if (mountToggle.matches('.checked') !== toggleChecked) {
    await click(mountToggle);
  }
}

async function addParameter() {
  await click('.configParameters-field .add-field-button');
}

async function addArgument() {
  await click('.arguments-field .add-field-button');
}

async function addResult() {
  await click('.results-field .add-field-button');
}

async function fillWithMinimumData() {
  await fillIn('.name-field .form-control', 'myname');
  await fillIn('.dockerImage-field .form-control', 'myimage');
  await toggleMountSpace(false);

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
    configParameterSpecs: [],
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
