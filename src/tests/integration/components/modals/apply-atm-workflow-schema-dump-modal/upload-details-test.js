import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { triggerEvent } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';

const componentClass = 'upload-details';

describe('Integration | Component | modals/apply atm workflow schema dump modal/upload details',
  function () {
    setupComponentTest('modals/apply-atm-workflow-schema-dump-modal/upload-details', {
      integration: true,
    });

    beforeEach(function () {
      this.setProperties({
        dumpSource: null,
        onReupload: sinon.spy(),
        isDisabled: false,
      });
    });

    it(`has class "${componentClass}"`, async function () {
      await render(this);

      expect(this.$().children()).to.have.class(componentClass)
        .and.to.have.length(1);
    });

    it('shows selected file name and upload button',
      async function () {
        const filename = 'file.json';
        this.set('dumpSource', {
          name: filename,
        });

        await render(this);

        expect(this.$('.filename').text().trim()).to.equal(filename);
        const $uploadBtn = this.$('.upload-btn');
        expect($uploadBtn.text().trim()).to.equal('Change file');
        expect($uploadBtn).to.have.class('btn-default');
      });

    it('calls "onReupload" callback on upload button click', async function () {
      const onReupload = this.get('onReupload');
      await render(this);
      expect(onReupload).to.be.not.called;

      await click('.upload-btn');

      expect(onReupload).to.be.calledOnce;
    });

    it('disables controls when isDisabled is true', async function () {
      this.set('isDisabled', true);

      await render(this);

      expect(this.$('.upload-btn')).to.be.disabled;
    });
  });

async function render(testCase) {
  testCase.render(hbs `{{modals/apply-atm-workflow-schema-dump-modal/upload-details
    dumpSource=dumpSource
    onReupload=onReupload
    isDisabled=isDisabled
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
