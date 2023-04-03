import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, focus, blur, fillIn, click, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
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

describe('Integration | Component | content-harvesters-indices/index-form', function () {
  setupRenderingTest();

  it('has class "content-harvesters-indices-index-form"', async function () {
    await render(hbs `{{content-harvesters-indices/index-form}}`);

    expect(findAll('.content-harvesters-indices-index-form')).to.have.length(1);
  });

  context('in create mode', function () {
    it('shows empty text input with "Name" label and no placeholder', async function () {
      await render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

      const formGroup = find('.name-field');
      const input = formGroup.querySelector('input');
      expect(formGroup).to.exist;
      expect(formGroup.querySelector('.control-label')).to.have.trimmed.text('Name:');
      expect(input).to.exist.and.to.have.attr('type', 'text');
      expect(input).to.have.value('');
      expect(input).to.not.have.attr('placeholder');
    });

    it('shows empty textearea with "Schema" label and no placeholder', async function () {
      await render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

      const formGroup = find('.schema-field');
      const textarea = formGroup.querySelector('textarea');
      expect(formGroup).to.exist;
      expect(formGroup.querySelector('.control-label')).to.have.trimmed.text('Schema:');
      expect(textarea).to.exist;
      expect(textarea).to.have.value('');
      expect(textarea).to.not.have.attr('placeholder');
    });

    it(
      'shows three preselected toggles: basic (with tooltip), JSON and RDF with "Include metadata" label and tooltip',
      async function () {
        await render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

        const formGroup = find('.includeMetadata-field');
        const toggleGroups = formGroup.querySelectorAll('.toggle-field-renderer');
        expect(formGroup).to.exist;
        expect(formGroup.querySelector('.control-label'))
          .to.have.trimmed.text('Include metadata:');
        expect(toggleGroups).to.have.length(3);
        ['Basic', 'JSON', 'RDF'].forEach((metadataType, index) => {
          const toggleGroup = toggleGroups[index];
          expect(toggleGroup.querySelector('.control-label'))
            .to.have.trimmed.text(metadataType);
          expect(toggleGroup.querySelector('.one-way-toggle'))
            .to.have.class('checked');
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
      }
    );

    it(
      'shows 6 preselected toggles: "file name", "file type", "space id", "dataset info", "archive info" and "metadata existence flags" with "Include file details" label and tooltip',
      async function () {
        await render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

        const formGroup = find('.includeFileDetails-field');
        const toggleGroups = formGroup.querySelectorAll('.toggle-field-renderer');
        expect(formGroup).to.exist;
        expect(formGroup.querySelector('.control-label'))
          .to.have.trimmed.text('Include file details:');
        expect(toggleGroups).to.have.length(6);
        [
          'File name',
          'File type',
          'Space ID',
          'Dataset info',
          'Archive info',
          'Metadata existence flags',
        ].forEach((fieldLabel, index) => {
          const toggleGroup = toggleGroups[index];
          expect(toggleGroup.querySelector('.control-label'))
            .to.have.trimmed.text(fieldLabel);
          expect(toggleGroup.querySelector('.one-way-toggle'))
            .to.have.class('checked');
        });

        const tooltip = new OneTooltipHelper(
          '.includeFileDetails-field > .control-label .one-label-tip .oneicon'
        );
        expect(await tooltip.getText()).to.equal(
          'Specifies what file details should be harvested alongside the metadata. Enabling "Metadata existence flags" will add boolean flags saying whether the file has any metadata of certain type. The "File name" field may be utilized by the GUI plugin to improve the browsing experience.'
        );
      }
    );

    it(
      'shows preselected toggle with "Include rejection reason" label and tooltip',
      async function () {
        await render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

        const formGroup = find('.includeRejectionReason-field');
        expect(formGroup).to.exist;
        expect(formGroup.querySelector('.control-label'))
          .to.have.trimmed.text('Include rejection reason:');
        expect(formGroup.querySelector('.one-way-toggle')).to.have.class('checked');

        const tooltip = new OneTooltipHelper(
          '.includeRejectionReason-field .one-label-tip .oneicon'
        );
        expect(await tooltip.getText()).to.equal(
          'If enabled, all harvesting errors (e.g. when the index rejects a payload due to non-matching schema) are stored as text in the index, which may be useful for later analysis.'
        );
      }
    );

    it(
      'shows preselected toggle with "Retry on rejection" label and tooltip',
      async function () {
        await render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

        const formGroup = find('.retryOnRejection-field');
        expect(formGroup).to.exist;
        expect(formGroup.querySelector('.control-label'))
          .to.have.trimmed.text('Retry on rejection:');
        expect(formGroup.querySelector('.one-way-toggle')).to.have.class('checked');

        const tooltip = new OneTooltipHelper(
          '.retryOnRejection-field .one-label-tip .oneicon'
        );
        expect(await tooltip.getText()).to.equal(
          'If enabled, all payloads rejected by the harvesting backend will be automatically analysed for offending data (e.g. fields that do not match the schema), pruned and submitted again. This might slow down the harvesting process and cause nonconformant metadata to be lost.'
        );
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
        async function () {
          await render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

          await focus(fieldInputSelector);
          await blur(fieldInputSelector);
          if (isOptional) {
            expect(find(fieldGroupSelector)).to.not.have.class('has-error');
          } else {
            expect(find(fieldGroupSelector)).to.have.class('has-error');
          }
        }
      );

      it(
        `does not show any validation error when "${fieldName}" field is not empty`,
        async function () {
          await render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

          await fillIn(fieldInputSelector, 'abc');
          await blur(fieldInputSelector);
          expect(find(fieldInputSelector)).to.not.have.class('has-error');
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

          it(testDescription, async function () {
            await render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

            const metadataToggles = findAll('.includeMetadata-field .one-way-toggle');
            // Uncheck all toggles to make sure, that the validation state will be visible
            // due to modification.
            await allFulfilled(metadataToggles.map(toggle => click(toggle)));
            if (basicMetadataSelected) {
              await click('.metadataXattrs-field .one-way-toggle');
            }
            if (jsonMetadataSelected) {
              await click('.metadataJson-field .one-way-toggle');
            }
            if (rdfMetadataSelected) {
              await click('.metadataRdf-field .one-way-toggle');
            }
            const invalidToggleGroups =
              findAll('.includeMetadata-field .toggle-field-renderer.has-error');
            const errorMessage = find('.includeMetadata-field .field-message');
            if (shouldBeInvalid) {
              expect(invalidToggleGroups).to.have.length(3);
              expect(errorMessage)
                .to.have.trimmed.text('At least one type must be enabled');
            } else {
              expect(invalidToggleGroups).to.have.length(0);
              expect(errorMessage).to.not.exist;
            }
          });
        });
      });
    });

    it('does not have any field in "view" mode', async function () {
      await render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

      expect(find('.field-view-mode')).to.not.exist;
    });

    it(
      'has enabled "Cancel" button and disabled "Create index" button on init',
      async function () {
        await render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

        const cancel = find('button.cancel-btn');
        const create = find('button.create-btn');
        expect(cancel).to.exist;
        expect(cancel).to.not.have.attr('disabled');
        expect(cancel).to.have.trimmed.text('Cancel');
        expect(create).to.exist;
        expect(create).to.have.attr('disabled');
        expect(create).to.have.trimmed.text('Create index');
      }
    );

    it(
      'has enabled "Create index" button when index name has been provided',
      async function () {
        await render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

        await fillIn('.name-field input', 'abc');
        expect(find('.create-btn')).to.not.have.attr('disabled');
      }
    );

    it(
      'disables "Create index" button when the whole form is correct except "include metadata" toggles',
      async function () {
        await render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

        const metadataToggles = findAll('.includeMetadata-field .one-way-toggle');
        await fillIn('.name-field input', 'abc');
        await allFulfilled(metadataToggles.map(toggle => click(toggle)));
        expect(find('.create-btn')).to.have.attr('disabled');
      }
    );

    it('calls "onCancel" callback on "Cancel" button click', async function () {
      const cancelSpy = this.set('cancelSpy', sinon.spy());
      await render(hbs `{{content-harvesters-indices/index-form
        mode="create"
        onCancel=cancelSpy
      }}`);

      expect(cancelSpy).to.not.be.called;
      await click('.cancel-btn');
      expect(cancelSpy).to.be.calledOnce;
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
        async function () {
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
        }
      );
    });

    it(
      'disables action buttons on "Create index" button click when creating promise is pending',
      async function () {
        this.set('onCreate', () => new Promise(() => {}));

        await render(hbs `{{content-harvesters-indices/index-form
          mode="create"
          onCreate=onCreate
        }}`);

        await fillIn('.name-field input', 'abc');
        await click('.create-btn');
        expect(find('.cancel-btn')).to.have.attr('disabled');
        expect(find('.create-btn')).to.have.attr('disabled');
        expect(find('.create-btn [role="progressbar"]')).to.exist;
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

    it('does not have any field in "edit" mode', async function () {
      await render(hbs `{{content-harvesters-indices/index-form
        mode="view"
        index=index
      }}`);

      expect(find('.field-edit-mode')).to.not.exist;
    });

    it('does not show "name" field', async function () {
      await render(hbs `{{content-harvesters-indices/index-form
        mode="view"
        index=index
      }}`);

      expect(find('.name-field')).to.not.exist;
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
        [`metadata${_.upperFirst(metadataType)}`]: () => expect(
          find(`.metadata${_.upperFirst(metadataType)}-field .one-way-toggle`)
        ).to.not.have.class('checked'),
      },
    })), ...fileDetailsFields.map(fieldName => ({
      descriptionSuffix: ` with disabled ${_.snakeCase(fieldName).replace(new RegExp('_', 'g'), ' ')} detail`,
      alteredRecordProps: {
        includeFileDetails: fileDetailsFields.without(fieldName),
      },
      alteredChecks: {
        [fieldName]: () => expect(
          find(`.${fieldName}-field .one-way-toggle`)
        ).to.not.have.class('checked'),
      },
    })), ...['includeRejectionReason', 'retryOnRejection'].map(fieldName => ({
      descriptionSuffix: ` with disabled ${_.snakeCase(fieldName).replace(new RegExp('_', 'g'), ' ')}`,
      alteredRecordProps: {
        [fieldName]: false,
      },
      alteredChecks: {
        [fieldName]: () => expect(
          find(`.${fieldName}-field .one-way-toggle`)
        ).to.not.have.class('checked'),
      },
    }))].forEach(({ descriptionSuffix, alteredRecordProps, alteredChecks }) => {
      it(`shows index full configuration${descriptionSuffix}`, async function () {
        Object.assign(this.get('index'), alteredRecordProps);

        const checks = {
          schema: () =>
            expect(find('.schema-field textarea')).to.have.value('indexSchema'),
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
          checks[fieldName] = () =>
          expect(find(`.${fieldName}-field .one-way-toggle`))
          .to.have.class('checked')
        );
        Object.assign(checks, alteredChecks);

        await render(hbs `{{content-harvesters-indices/index-form
          mode="view"
          index=index
        }}`);

        Object.values(checks).forEach(check => check());
      });
    });

    it('does not show any action buttons', async function () {
      await render(hbs `{{content-harvesters-indices/index-form
        mode="view"
        index=index
      }}`);

      expect(find('button')).to.not.exist;
    });
  });
});
