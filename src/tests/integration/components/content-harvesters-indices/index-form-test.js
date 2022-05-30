import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, focus, blur, fillIn, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import {
  all as allFulfilled,
  resolve,
  Promise,
} from 'rsvp';
import _ from 'lodash';
import sinon from 'sinon';
import OneTooltipHelper from '../../../helpers/one-tooltip';

const metadataTypes = ['xattrs', 'json', 'rdf'];
const fileDetailsFields = [
  'fileName',
  'fileType',
  'spaceId',
  'datasetInfo',
  'archiveInfo',
  'metadataExistenceFlags',
];

describe('Integration | Component | content harvesters indices/index form', function () {
  setupRenderingTest();

  it('has class "content-harvesters-indices-index-form"', async function () {
    await render(hbs `{{content-harvesters-indices/index-form}}`);

    expect(this.$('.content-harvesters-indices-index-form')).to.have.length(1);
  });

  context('in create mode', function () {
    it('shows empty text input with "Name" label and no placeholder', async function (done) {
      await render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

      const $formGroup = this.$('.name-field');
      const $input = $formGroup.find('input');
      expect($formGroup).to.exist;
      expect($formGroup.find('.control-label').text().trim()).to.equal('Name:');
      expect($input).to.exist.and.to.have.attr('type', 'text');
      expect($input).to.have.value('');
      expect($input).to.not.have.attr('placeholder');
      done();
    });

    it('shows empty textearea with "Schema" label and no placeholder', async function (done) {
      await render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

      const $formGroup = this.$('.schema-field');
      const $textarea = $formGroup.find('textarea');
      expect($formGroup).to.exist;
      expect($formGroup.find('.control-label').text().trim()).to.equal('Schema:');
      expect($textarea).to.exist;
      expect($textarea).to.have.value('');
      expect($textarea).to.not.have.attr('placeholder');
      done();
    });

    it(
      'shows three preselected toggles: basic (with tooltip), JSON and RDF with "Include metadata" label and tooltip',
      async function (done) {
        await render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

        const $formGroup = this.$('.includeMetadata-field');
        const $toggleGroups = $formGroup.find('.toggle-field-renderer');
        expect($formGroup).to.exist;
        expect($formGroup.find('.control-label').eq(0).text().trim())
          .to.equal('Include metadata:');
        expect($toggleGroups).to.have.length(3);
        ['Basic', 'JSON', 'RDF'].forEach((metadataType, index) => {
          const $toggleGroup = $toggleGroups.eq(index);
          expect($toggleGroup.find('.control-label').text().trim())
            .to.equal(metadataType);
          expect($toggleGroup.find('.one-way-toggle')).to.have.class('checked');
        });

        const tooltip = new OneTooltipHelper(
          '.includeMetadata-field > .control-label .one-label-tip .oneicon'
        );
        const basicTooltip = new OneTooltipHelper(
          '.metadataXattrs-field .one-label-tip .oneicon'
        );
        expect(await tooltip.getText()).to.equal(
          'Specifies what types of file metadata should be harvested in this index. At least one type must be given.'
        );
        expect(await basicTooltip.getText()).to.equal(
          'Key-value pairs representing extended file attributes (xattrs).'
        );
        done();
      }
    );

    it(
      'shows 6 preselected toggles: "file name", "file type", "space id", "dataset info", "archive info" and "metadata existence flags" with "Include file details" label and tooltip',
      async function (done) {
        await render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

        const $formGroup = this.$('.includeFileDetails-field');
        const $toggleGroups = $formGroup.find('.toggle-field-renderer');
        expect($formGroup).to.exist;
        expect($formGroup.find('.control-label').eq(0).text().trim())
          .to.equal('Include file details:');
        expect($toggleGroups).to.have.length(6);
        [
          'File name',
          'File type',
          'Space ID',
          'Dataset info',
          'Archive info',
          'Metadata existence flags',
        ].forEach((fieldLabel, index) => {
          const $toggleGroup = $toggleGroups.eq(index);
          expect($toggleGroup.find('.control-label').text().trim())
            .to.equal(fieldLabel);
          expect($toggleGroup.find('.one-way-toggle')).to.have.class('checked');
        });

        const tooltip = new OneTooltipHelper(
          '.includeFileDetails-field > .control-label .one-label-tip .oneicon'
        );
        expect(await tooltip.getText()).to.equal(
          'Specifies what file details should be harvested alongside the metadata. Enabling "Metadata existence flags" will add boolean flags saying whether the file has any metadata of certain type. The "File name" field may be utilized by the GUI plugin to improve the browsing experience.'
        );
        done();
      }
    );

    it(
      'shows preselected toggle with "Include rejection reason" label and tooltip',
      async function (done) {
        await render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

        const $formGroup = this.$('.includeRejectionReason-field');
        expect($formGroup).to.exist;
        expect($formGroup.find('.control-label').text().trim())
          .to.equal('Include rejection reason:');
        expect($formGroup.find('.one-way-toggle')).to.have.class('checked');

        const tooltip = new OneTooltipHelper(
          '.includeRejectionReason-field .one-label-tip .oneicon'
        );
        expect(await tooltip.getText()).to.equal(
          'If enabled, all harvesting errors (e.g. when the index rejects a payload due to non-matching schema) are stored as text in the index, which may be useful for later analysis.'
        );
        done();
      }
    );

    it(
      'shows preselected toggle with "Retry on rejection" label and tooltip',
      async function (done) {
        await render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

        const $formGroup = this.$('.retryOnRejection-field');
        expect($formGroup).to.exist;
        expect($formGroup.find('.control-label').text().trim())
          .to.equal('Retry on rejection:');
        expect($formGroup.find('.one-way-toggle')).to.have.class('checked');

        const tooltip = new OneTooltipHelper(
          '.retryOnRejection-field .one-label-tip .oneicon'
        );
        expect(await tooltip.getText()).to.equal(
          'If enabled, all payloads rejected by the harvesting backend will be automatically analysed for offending data (e.g. fields that do not match the schema), pruned and submitted again. This might slow down the harvesting process and cause nonconformant metadata to be lost.'
        );
        done();
      }
    );

    [{
      fieldName: 'name',
      fieldGroupSelector: '.name-field',
      fieldInputSelector: '.name-field input',
    }, {
      fieldName: 'schema',
      fieldGroupSelector: '.schema-field',
      fieldInputSelector: '.schema-field textarea',
      isOptional: true,
    }].forEach(({ fieldName, fieldGroupSelector, fieldInputSelector, isOptional }) => {
      it(
        `${isOptional ? 'does not show any' : 'shows'} validation error when "${fieldName}" field is empty`,
        async function (done) {
          await render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

          await focus(fieldInputSelector);
          await blur(fieldInputSelector);
          if (isOptional) {
            expect(this.$(fieldGroupSelector)).to.not.have.class('has-error');
          } else {
            expect(this.$(fieldGroupSelector)).to.have.class('has-error');
          }
          done();
        }
      );

      it(
        `does not show any validation error when "${fieldName}" field is not empty`,
        async function (done) {
          await render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

          await fillIn(fieldInputSelector, 'abc');
          await blur(fieldInputSelector);
          expect(this.$(fieldInputSelector)).to.not.have.class('has-error');
          done();
        }
      );
    });

    [true, false].forEach(basicMetadataSelected => {
      [true, false].forEach(jsonMetadataSelected => {
        [true, false].forEach(rdfMetadataSelected => {
          const shouldBeInvalid = !basicMetadataSelected && !jsonMetadataSelected &&
            !rdfMetadataSelected;
          let testDescription = shouldBeInvalid ? 'shows' : 'does not show';
          testDescription +=
            ` validation error when basic metadata is ${basicMetadataSelected ? '' : 'un'}checked`;
          testDescription += ` and JSON metadata is ${jsonMetadataSelected ? '' : 'un'}checked`;
          testDescription += ` and RDF metadata is ${rdfMetadataSelected ? '' : 'un'}checked`;

          it(testDescription, async function (done) {
            await render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

            const $metadataToggles = this.$('.includeMetadata-field .one-way-toggle');
            // Uncheck all toggles to make sure, that the validation state will be visible
            // due to modification.
            await allFulfilled($metadataToggles.toArray().map(toggle => click(toggle)));
            if (basicMetadataSelected) {
              await click('.metadataXattrs-field .one-way-toggle');
            }
            if (jsonMetadataSelected) {
              await click('.metadataJson-field .one-way-toggle');
            }
            if (rdfMetadataSelected) {
              await click('.metadataRdf-field .one-way-toggle');
            }
            const $invalidToggleGroups =
              this.$('.includeMetadata-field .toggle-field-renderer.has-error');
            const $errorMessage = this.$('.includeMetadata-field .field-message');
            if (shouldBeInvalid) {
              expect($invalidToggleGroups).to.have.length(3);
              expect($errorMessage.text().trim())
                .to.equal('At least one type must be enabled');
            } else {
              expect($invalidToggleGroups).to.not.exist;
              expect($errorMessage).to.not.exist;
            }
            done();
          });
        });
      });
    });

    it('does not have any field in "view" mode', async function (done) {
      await render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

      expect(this.$('.field-view-mode')).to.not.exist;
      done();
    });

    it(
      'has enabled "Cancel" button and disabled "Create index" button on init',
      async function (done) {
        await render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

        const $cancel = this.$('button.cancel-btn');
        const $create = this.$('button.create-btn');
        expect($cancel).to.exist;
        expect($cancel).to.not.have.attr('disabled');
        expect($cancel.text().trim()).to.equal('Cancel');
        expect($create).to.exist;
        expect($create).to.have.attr('disabled');
        expect($create.text().trim()).to.equal('Create index');
        done();
      }
    );

    it(
      'has enabled "Create index" button when index name has been provided',
      async function (done) {
        await render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

        await fillIn('.name-field input', 'abc');
        expect(this.$('.create-btn')).to.not.have.attr('disabled');
        done();
      }
    );

    it(
      'disables "Create index" button when the whole form is correct except "include metadata" toggles',
      async function (done) {
        await render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

        const $metadataToggles = this.$('.includeMetadata-field .one-way-toggle');
        await fillIn('.name-field input', 'abc');
        await allFulfilled($metadataToggles.toArray().map(toggle => click(toggle)));
        expect(this.$('.create-btn')).to.have.attr('disabled');
        done();
      }
    );

    it('calls "onCancel" callback on "Cancel" button click', async function (done) {
      const cancelSpy = this.set('cancelSpy', sinon.spy());
      await render(hbs `{{content-harvesters-indices/index-form
        mode="create"
        onCancel=cancelSpy
      }}`);

      expect(cancelSpy).to.not.be.called;
      await click('.cancel-btn');
      expect(cancelSpy).to.be.calledOnce;
      done();
    });

    [{
      descriptionSuffix: '',
      extraSteps: resolve,
      alteredRecordProps: {},
    }, ...metadataTypes.map(metadataType => ({
      descriptionSuffix: ` and has disabled ${metadataType} metadata`,
      alteredRecordProps: {
        includeMetadata: metadataTypes.without(metadataType),
      },
      extraSteps: () =>
        click(`.metadata${_.upperFirst(metadataType)}-field .one-way-toggle`),
    })), ...fileDetailsFields.map(fieldName => ({
      descriptionSuffix: ` and has disabled ${_.snakeCase(fieldName).replace(new RegExp('_', 'g'), ' ')} detail`,
      extraSteps: () => click(`.${fieldName}-field .one-way-toggle`),
      alteredRecordProps: {
        includeFileDetails: fileDetailsFields.without(fieldName),
      },
    })), ...['includeRejectionReason', 'retryOnRejection'].map(fieldName => ({
      descriptionSuffix: ` and has disabled ${_.snakeCase(fieldName).replace(new RegExp('_', 'g'), ' ')}`,
      extraSteps: () => click(`.${fieldName}-field .one-way-toggle`),
      alteredRecordProps: {
        [fieldName]: false,
      },
    }))].forEach(({ descriptionSuffix, extraSteps, alteredRecordProps }) => {
      it(
        `calls "onCreate" callback with index data on "Create index" button click when form is completely filled in${descriptionSuffix}`,
        async function (done) {
          const createStub = this.set('createStub', sinon.stub().resolves());

          await render(hbs `{{content-harvesters-indices/index-form
            mode="create"
            onCreate=createStub
          }}`);

          await fillIn('.name-field input', 'abc');
          await fillIn('.schema-field textarea', 'someschema');
          await extraSteps();
          await click('.create-btn');
          expect(createStub).to.be.calledOnce.and.to.be.calledWith(
            sinon.match(Object.assign({
              name: 'abc',
              schema: 'someschema',
              includeMetadata: ['xattrs', 'json', 'rdf'],
              includeFileDetails: [
                'fileName',
                'fileType',
                'spaceId',
                'datasetInfo',
                'archiveInfo',
                'metadataExistenceFlags',
              ],
              includeRejectionReason: true,
              retryOnRejection: true,
            }, alteredRecordProps))
          );
          done();
        }
      );
    });

    it(
      'disables action buttons on "Create index" button click when creating promise is pending',
      async function (done) {
        this.set('onCreate', () => new Promise(() => {}));

        await render(hbs `{{content-harvesters-indices/index-form
          mode="create"
          onCreate=onCreate
        }}`);

        await fillIn('.name-field input', 'abc');
        await click('.create-btn');
        expect(this.$('.cancel-btn')).to.have.attr('disabled');
        expect(this.$('.create-btn')).to.have.attr('disabled');
        expect(this.$('.create-btn [role="progressbar"]')).to.exist;
        done();
      }
    );
  });

  context('in view mode', function () {
    beforeEach(function () {
      this.set('index', {
        schema: 'indexSchema',
        includeMetadata: ['xattrs', 'json', 'rdf'],
        includeFileDetails: [
          'fileName',
          'fileType',
          'spaceId',
          'datasetInfo',
          'archiveInfo',
          'metadataExistenceFlags',
        ],
        includeRejectionReason: true,
        retryOnRejection: true,
      });
    });

    it('does not have any field in "edit" mode', async function (done) {
      await render(hbs `{{content-harvesters-indices/index-form
        mode="view"
        index=index
      }}`);

      expect(this.$('.field-edit-mode')).to.not.exist;
      done();
    });

    it('does not show "name" field', async function (done) {
      await render(hbs `{{content-harvesters-indices/index-form
        mode="view"
        index=index
      }}`);

      expect(this.$('.name-field')).to.not.exist;
      done();
    });

    [{
      descriptionSuffix: '',
      alteredRecordProps: {},
      alteredChecks: {},
    }, ...metadataTypes.map(metadataType => ({
      descriptionSuffix: ` with disabled ${metadataType} metadata`,
      alteredRecordProps: {
        includeMetadata: metadataTypes.without(metadataType),
      },
      alteredChecks: {
        [`metadata${_.upperFirst(metadataType)}`]: testCase => expect(
          testCase.$(`.metadata${_.upperFirst(metadataType)}-field .one-way-toggle`)
        ).to.not.have.class('checked'),
      },
    })), ...fileDetailsFields.map(fieldName => ({
      descriptionSuffix: ` with disabled ${_.snakeCase(fieldName).replace(new RegExp('_', 'g'), ' ')} detail`,
      alteredRecordProps: {
        includeFileDetails: fileDetailsFields.without(fieldName),
      },
      alteredChecks: {
        [fieldName]: testCase => expect(
          testCase.$(`.${fieldName}-field .one-way-toggle`)
        ).to.not.have.class('checked'),
      },
    })), ...['includeRejectionReason', 'retryOnRejection'].map(fieldName => ({
      descriptionSuffix: ` with disabled ${_.snakeCase(fieldName).replace(new RegExp('_', 'g'), ' ')}`,
      alteredRecordProps: {
        [fieldName]: false,
      },
      alteredChecks: {
        [fieldName]: testCase => expect(
          testCase.$(`.${fieldName}-field .one-way-toggle`)
        ).to.not.have.class('checked'),
      },
    }))].forEach(({ descriptionSuffix, alteredRecordProps, alteredChecks }) => {
      it(`shows index full configuration${descriptionSuffix}`, async function (done) {
        Object.assign(this.get('index'), alteredRecordProps);

        const checks = {
          schema: testCase =>
            expect(testCase.$('.schema-field textarea')).to.have.value('indexSchema'),
        };
        [
          'metadataXattrs',
          'metadataJson',
          'metadataRdf',
          'fileName',
          'fileType',
          'spaceId',
          'datasetInfo',
          'archiveInfo',
          'metadataExistenceFlags',
          'includeRejectionReason',
          'retryOnRejection',
        ].forEach(fieldName =>
          checks[fieldName] = testCase =>
          expect(testCase.$(`.${fieldName}-field .one-way-toggle`))
          .to.have.class('checked')
        );
        Object.assign(checks, alteredChecks);

        await render(hbs `{{content-harvesters-indices/index-form
          mode="view"
          index=index
        }}`);

        Object.values(checks).forEach(check => check(this));
        done();
      });
    });

    it('does not show any action buttons', async function (done) {
      await render(hbs `{{content-harvesters-indices/index-form
        mode="view"
        index=index
      }}`);

      expect(this.$('button')).to.not.exist;
      done();
    });
  });
});
