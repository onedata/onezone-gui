import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { blur, fillIn, click } from 'ember-native-dom-helpers';
import { all as allFulfilled, resolve, Promise } from 'rsvp';
import _ from 'lodash';
import sinon from 'sinon';

const metadataTypes = ['basic', 'json', 'rdf'];
const fileDetailsFields = [
  'fileName',
  'originSpace',
  'metadataExistenceFlags',
];

describe('Integration | Component | content harvesters indices/index form', function () {
  setupComponentTest('content-harvesters-indices/index-form', {
    integration: true,
  });

  it('has class "content-harvesters-indices-index-form"', function () {
    this.render(hbs `{{content-harvesters-indices/index-form}}`);

    expect(this.$('.content-harvesters-indices-index-form')).to.have.length(1);
  });

  context('in create mode', function () {
    it('shows empty text input with "Name" label and no placeholder', function () {
      this.render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

      const $formGroup = this.$('.name-field');
      const $input = $formGroup.find('input');
      expect($formGroup).to.exist;
      expect($formGroup.find('.control-label').text().trim()).to.equal('Name:');
      expect($input).to.exist.and.to.have.attr('type', 'text');
      expect($input).to.have.value('');
      expect($input).to.not.have.attr('placeholder');
    });

    it('shows empty textearea with "Schema" label and no placeholder', function () {
      this.render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

      const $formGroup = this.$('.schema-field');
      const $textarea = $formGroup.find('textarea');
      expect($formGroup).to.exist;
      expect($formGroup.find('.control-label').text().trim()).to.equal('Schema:');
      expect($textarea).to.exist;
      expect($textarea).to.have.value('');
      expect($textarea).to.not.have.attr('placeholder');
    });

    it(
      'shows three preselected toggles: basic, JSON and RDF with "Include metadata" label',
      function () {
        this.render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

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
      }
    );

    it(
      'shows three preselected toggles: "file name", "origin space" and "metadata existence flags" with "Include file details" label',
      function () {
        this.render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

        const $formGroup = this.$('.includeFileDetails-field');
        const $toggleGroups = $formGroup.find('.toggle-field-renderer');
        expect($formGroup).to.exist;
        expect($formGroup.find('.control-label').eq(0).text().trim())
          .to.equal('Include file details:');
        expect($toggleGroups).to.have.length(3);
        [
          'File name',
          'Origin space',
          'Metadata existence flags',
        ].forEach((fieldLabel, index) => {
          const $toggleGroup = $toggleGroups.eq(index);
          expect($toggleGroup.find('.control-label').text().trim())
            .to.equal(fieldLabel);
          expect($toggleGroup.find('.one-way-toggle')).to.have.class('checked');
        });
      }
    );

    it('shows preselected toggle with "Include rejection reason" label', function () {
      this.render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

      const $formGroup = this.$('.includeRejectionReason-field');
      expect($formGroup).to.exist;
      expect($formGroup.find('.control-label').text().trim())
        .to.equal('Include rejection reason:');
      expect($formGroup.find('.one-way-toggle')).to.have.class('checked');
    });

    it('shows preselected toggle with "Retry on rejection" label', function () {
      this.render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

      const $formGroup = this.$('.retryOnRejection-field');
      expect($formGroup).to.exist;
      expect($formGroup.find('.control-label').text().trim())
        .to.equal('Retry on rejection:');
      expect($formGroup.find('.one-way-toggle')).to.have.class('checked');
    });

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
        function () {
          this.render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

          return blur(fieldInputSelector)
            .then(() => isOptional ?
              expect(this.$(fieldGroupSelector)).to.not.have.class('has-error') :
              expect(this.$(fieldGroupSelector)).to.have.class('has-error')
            );
        }
      );

      it(
        `does not show any validation error when "${fieldName}" field is not empty`,
        function () {
          this.render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

          return fillIn(fieldInputSelector, 'abc')
            .then(() => blur(fieldInputSelector))
            .then(() =>
              expect(this.$(fieldInputSelector)).to.not.have.class('has-error')
            );
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

          it(testDescription, function () {
            this.render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

            const $metadataToggles = this.$('.includeMetadata-field .one-way-toggle');
            // Uncheck all toggles to make sure, that the validation state will be visible
            // due to modification.
            return allFulfilled($metadataToggles.toArray().map(toggle => click(toggle)))
              .then(() => basicMetadataSelected ?
                click('.metadataBasic-field .one-way-toggle') : resolve()
              )
              .then(() => jsonMetadataSelected ?
                click('.metadataJson-field .one-way-toggle') : resolve()
              )
              .then(() => rdfMetadataSelected ?
                click('.metadataRdf-field .one-way-toggle') : resolve()
              )
              .then(() => {
                const $invalidToggleGroups =
                  this.$('.includeMetadata-field .toggle-field-renderer.has-error');
                if (shouldBeInvalid) {
                  expect($invalidToggleGroups).to.have.length(3);
                } else {
                  expect($invalidToggleGroups).to.not.exist;
                }
              });
          });
        });
      });
    });

    it('does not have any field in "view" mode', function () {
      this.render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

      expect(this.$('.field-view-mode')).to.not.exist;
    });

    it(
      'has enabled "Cancel" button and disabled "Create index" button on init',
      function () {
        this.render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

        const $cancel = this.$('button.cancel-btn');
        const $create = this.$('button.create-btn');
        expect($cancel).to.exist;
        expect($cancel).to.not.have.attr('disabled');
        expect($cancel.text().trim()).to.equal('Cancel');
        expect($create).to.exist;
        expect($create).to.have.attr('disabled');
        expect($create.text().trim()).to.equal('Create index');
      }
    );

    it(
      'has enabled "Create index" button when index name has been provided',
      function () {
        this.render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

        return fillIn('.name-field input', 'abc')
          .then(() => expect(this.$('.create-btn')).to.not.have.attr('disabled'));
      }
    );

    it(
      'disables "Create index" button when the whole form is correct except "include metadata" toggles',
      function () {
        this.render(hbs `{{content-harvesters-indices/index-form mode="create"}}`);

        const $metadataToggles = this.$('.includeMetadata-field .one-way-toggle');
        return fillIn('.name-field input', 'abc')
          .then(() =>
            allFulfilled($metadataToggles.toArray().map(toggle => click(toggle)))
          )
          .then(() => expect(this.$('.create-btn')).to.have.attr('disabled'));
      }
    );

    it('calls "onCancel" callback on "Cancel" button click', function () {
      const cancelSpy = this.set('cancelSpy', sinon.spy());
      this.render(hbs `{{content-harvesters-indices/index-form
        mode="create"
        onCancel=cancelSpy
      }}`);

      expect(cancelSpy).to.not.be.called;
      return click('.cancel-btn')
        .then(expect(cancelSpy).to.be.calledOnce);
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
        function () {
          const createStub = this.set('createStub', sinon.stub().resolves());

          this.render(hbs `{{content-harvesters-indices/index-form
            mode="create"
            onCreate=createStub
          }}`);

          return fillIn('.name-field input', 'abc')
            .then(() => fillIn('.schema-field textarea', 'someschema'))
            .then(() => extraSteps())
            .then(() => click('.create-btn'))
            .then(() => expect(createStub).to.be.calledOnce.and.to.be.calledWith(
              sinon.match(Object.assign({
                name: 'abc',
                schema: 'someschema',
                includeMetadata: ['basic', 'json', 'rdf'],
                includeFileDetails: ['fileName', 'originSpace', 'metadataExistenceFlags'],
                includeRejectionReason: true,
                retryOnRejection: true,
              }, alteredRecordProps))
            ));
        }
      );
    });

    it(
      'disables action buttons on "Create index" button click when creating promise is pending',
      function () {
        this.set('onCreate', () => new Promise(() => {}));

        this.render(hbs `{{content-harvesters-indices/index-form
          mode="create"
          onCreate=onCreate
        }}`);

        return fillIn('.name-field input', 'abc')
          .then(() => click('.create-btn'))
          .then(() => {
            expect(this.$('.cancel-btn')).to.have.attr('disabled');
            expect(this.$('.create-btn')).to.have.attr('disabled');
            expect(this.$('.create-btn [role="progressbar"]')).to.exist;
          });
      }
    );
  });

  context('in view mode', function () {
    beforeEach(function () {
      this.set('index', {
        schema: 'indexSchema',
        includeMetadata: ['basic', 'json', 'rdf'],
        includeFileDetails: ['fileName', 'originSpace', 'metadataExistenceFlags'],
        includeRejectionReason: true,
        retryOnRejection: true,
      });
    });

    it('does not have any field in "edit" mode', function () {
      this.render(hbs `{{content-harvesters-indices/index-form
        mode="view"
        index=index
      }}`);

      expect(this.$('.field-edit-mode')).to.not.exist;
    });

    it('does not show "name" field', function () {
      this.render(hbs `{{content-harvesters-indices/index-form
        mode="view"
        index=index
      }}`);

      expect(this.$('.name-field')).to.not.exist;
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
      it(`shows index full configuration${descriptionSuffix}`, function () {
        Object.assign(this.get('index'), alteredRecordProps);

        const checks = {
          schema: testCase =>
            expect(testCase.$('.schema-field textarea')).to.have.value('indexSchema'),
        };
        [
          'metadataBasic',
          'metadataJson',
          'metadataRdf',
          'fileName',
          'originSpace',
          'metadataExistenceFlags',
          'includeRejectionReason',
          'retryOnRejection',
        ].forEach(fieldName =>
          checks[fieldName] = testCase =>
          expect(testCase.$(`.${fieldName}-field .one-way-toggle`))
          .to.have.class('checked')
        );
        Object.assign(checks, alteredChecks);

        this.render(hbs `{{content-harvesters-indices/index-form
          mode="view"
          index=index
        }}`);

        Object.values(checks).forEach(check => check(this));
      });
    });

    it('does not show any action buttons', function () {
      this.render(hbs `{{content-harvesters-indices/index-form
        mode="view"
        index=index
      }}`);

      expect(this.$('button')).to.not.exist;
    });
  });
});
