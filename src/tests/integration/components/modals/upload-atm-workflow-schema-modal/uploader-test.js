import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { triggerEvent } from 'ember-native-dom-helpers';
import sinon from 'sinon';

const componentClass = 'uploader';

describe('Integration | Component | modals/upload atm workflow schema modal/uploader',
  function () {
    setupComponentTest('modals/upload-atm-workflow-schema-modal/uploader', {
      integration: true,
    });

    beforeEach(function () {
      this.setProperties({
        uploadedFile: null,
        onUploadedFileChange: sinon.spy(
          (uploadedFile) => this.set('uploadedFile', uploadedFile)
        ),
      });
    });

    it(`has class "${componentClass}"`, async function () {
      await render(this);

      expect(this.$().children()).to.have.class(componentClass)
        .and.to.have.length(1);
    });

    it('shows selected file name and upload button when uploadedFile is specified',
      async function () {
        const filename = 'file.json';
        this.set('uploadedFile', {
          name: filename,
        });

        await render(this);

        expectFileName(this, filename);
        const $uploadBtn = this.$('.upload-btn');
        expect($uploadBtn.text().trim()).to.equal('Change file');
        expect($uploadBtn).to.have.class('btn-default');
      });

    it('shows upload button and introduction text when uploadedFile is not specified',
      async function () {
        this.set('uploadedFile', null);

        await render(this);

        expect(this.$('.filename')).to.not.exist;
        const $uploadBtn = this.$('.upload-btn');
        expect($uploadBtn.text().trim()).to.equal('Select file');
        expect($uploadBtn).to.have.class('btn-primary');
        expect(this.$('.intro').text().trim()).to.equal(
          'Choose a file which contains a dump of a workflow you would like to add.'
        );
      });

    it('notifies about new uploaded file (valid)', async function () {
      const filename = 'file.json';
      await render(this);

      const dump = generateExampleDump();
      await triggerUploadInputChange(this, filename, JSON.stringify(dump));

      expectFileName(this, filename);
      expectUploadedFileChange(this, filename, dump);
    });

    ['name', 'initialRevision'].forEach(fieldName => {
      it(`notifies about new uploaded file (invalid, missing ${fieldName})`,
        async function () {
          const filename = 'file.json';
          await render(this);

          const dump = generateExampleDump();
          delete dump[fieldName];
          await triggerUploadInputChange(this, filename, JSON.stringify(dump));

          expectFileName(this, filename);
          expectUploadedFileChange(this, filename, null);
        });
    });

    it('notifies about new uploaded file (invalid, non-json content)',
      async function () {
        const filename = 'file.json';
        await render(this);

        await triggerUploadInputChange(this, filename, 'random content');

        expectFileName(this, filename);
        expectUploadedFileChange(this, filename, null);
      });
  });

async function render(testCase) {
  testCase.render(hbs `{{modals/upload-atm-workflow-schema-modal/uploader
    uploadedFile=uploadedFile
    onUploadedFileChange=onUploadedFileChange
  }}`);
  await wait();
}

export async function triggerUploadInputChange(testCase, filename, fileContent) {
  const uploadInputElement = testCase.$('.upload-input')[0];
  const fileContentBlob = new Blob([fileContent], {
    type: 'application/json',
  });
  const file = new File([fileContentBlob], filename, { type: 'application/json' });
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  uploadInputElement.files = dataTransfer.files;
  await triggerEvent(uploadInputElement, 'change');
}

export function generateExampleDump() {
  return {
    schemaFormatVersion: 1,
    name: 'w1',
    summary: 'summary',
    initialRevision: {
      schema: {
        state: 'stable',
        description: 'description',
        lanes: [],
        stores: [],
      },
      originalRevisionNumber: 3,
      supplementaryAtmLambdas: {},
    },
    originalAtmWorkflowSchemaId: 'w1id',
  };
}

function expectFileName(testCase, filename) {
  expect(testCase.$('.filename').text().trim()).to.equal(filename);
}

function expectUploadedFileChange(testCase, filename, content) {
  expect(testCase.get('onUploadedFileChange')).to.be.calledOnce
    .and.to.be.calledWith({
      name: filename,
      content,
    });
}
