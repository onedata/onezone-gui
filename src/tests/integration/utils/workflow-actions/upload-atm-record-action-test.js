import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import UploadAtmRecordAction from 'onezone-gui/utils/workflow-actions/upload-atm-record-action';
import EmberObject, { getProperties } from '@ember/object';
import { getModal, isModalOpened } from '../../../helpers/modal';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { resolve, reject } from 'rsvp';
import generateAtmLambdaDump from '../../../helpers/workflows/generate-atm-lambda-dump';
import generateAtmWorkflowSchemaDump from '../../../helpers/workflows/generate-atm-workflow-schema-dump';
import { lookupService } from '../../../helpers/stub-service';
import triggerFileInputChange from '../../../helpers/trigger-file-input-change';
import sinon from 'sinon';
import { suppressRejections } from '../../../helpers/suppress-rejections';
import { dasherize } from '@ember/string';
import _ from 'lodash';
import globals from 'onedata-gui-common/utils/globals';

const atmInventoryId = 'invid';

describe(
  'Integration | Utility | workflow-actions/upload-atm-record-action',
  function () {
    const { afterEach } = setupRenderingTest();

    afterEach(function () {
      this.get('action').destroy();
    });

    context('when atmModelName is "atmLambda"', function () {
      beforeEach(function () {
        const atmModelName = 'atmLambda';
        const atmLambdas = [{
          entityId: 'lm1id',
          originalAtmLambdaId: 'l1id',
          revisionRegistry: {
            1: {
              name: 'lm1',
            },
          },
        }];
        const atmInventory = EmberObject.create({
          entityId: atmInventoryId,
          atmLambdaList: promiseObject(resolve({
            list: promiseArray(resolve(atmLambdas)),
          })),
          privileges: {
            manageLambdas: true,
          },
        });
        sinon.stub(lookupService(this, 'record-manager'), 'getUserRecordList')
          .resolves({ list: promiseArray(resolve([atmInventory])) });
        const workflowManager = lookupService(this, 'workflow-manager');
        const mergeStub =
          sinon.stub(workflowManager, 'mergeAtmLambdaDumpToExistingLambda');
        const createStub = sinon.stub(workflowManager, 'createAtmLambda');
        this.setProperties({
          atmModelName,
          action: UploadAtmRecordAction.create({
            ownerSource: this.owner,
            context: {
              atmModelName,
              atmInventory,
            },
          }),
          atmInventory,
          mergeStub,
          createStub,
        });
      });

      itHasCorrectBasicProperties();

      it('is enabled, when user has "manageLambdas" privilege in inventory',
        function () {
          this.set('atmInventory.privileges', {
            manageLambdas: true,
          });

          expect(this.get('action.disabled')).to.be.false;
          expect(String(this.get('action.tip'))).to.be.empty;
        }
      );

      it('is disabled, when user does not have "manageLambdas" privilege in inventory',
        function () {
          this.set('atmInventory.privileges', {
            manageLambdas: false,
          });
          expect(this.get('action.disabled')).to.be.true;
          expect(String(this.get('action.tip'))).to.equal(
            'Insufficient privileges (requires &quot;manage lambdas&quot; privilege in this automation inventory).'
          );
        }
      );

      itShowsModalOnFileUpload();
      itAllowsToReuploadAnotherFile();
      itShowsInfoAboutInvalidUploadedFile();
      itExecutesMergingOnSubmitWithSuccess();
      itExecutesCreatingOnSubmitWithSuccess();
      itExecutesMergingOnSubmitWithFailure();
      itExecutesCreatingOnSubmitWithFailure();
    });

    context('when atmModelName is "atmWorkflowSchema"', function () {
      beforeEach(function () {
        const atmModelName = 'atmWorkflowSchema';
        const atmWorkflowSchemas = [{
          entityId: 'wf1id',
          name: 'wf1',
          originalAtmWorkflowSchemaId: 'w1id',
          revisionRegistry: {
            1: {},
          },
        }];
        const atmInventory = EmberObject.create({
          entityId: atmInventoryId,
          atmWorkflowSchemaList: promiseObject(resolve({
            list: promiseArray(resolve(atmWorkflowSchemas)),
          })),
          privileges: {
            manageLambdas: true,
            manageWorkflowSchemas: true,
          },
        });
        sinon.stub(lookupService(this, 'record-manager'), 'getUserRecordList')
          .resolves({ list: promiseArray(resolve([atmInventory])) });
        const workflowManager = lookupService(this, 'workflow-manager');
        const mergeStub =
          sinon.stub(workflowManager, 'mergeAtmWorkflowSchemaDumpToExistingSchema');
        const createStub = sinon.stub(workflowManager, 'createAtmWorkflowSchema');
        this.setProperties({
          atmModelName,
          action: UploadAtmRecordAction.create({
            ownerSource: this.owner,
            context: {
              atmModelName,
              atmInventory,
            },
          }),
          atmInventory,
          mergeStub,
          createStub,
        });
      });

      itHasCorrectBasicProperties();

      it('is enabled, when user has "manageWorkflowSchemas" and "manageLambdas" privileges in inventory',
        function () {
          this.set('atmInventory.privileges', {
            manageLambdas: true,
            manageWorkflowSchemas: true,
          });

          expect(this.get('action.disabled')).to.be.false;
          expect(String(this.get('action.tip'))).to.be.empty;
        }
      );

      it('is disabled, when user does not have "manageWorkflowSchemas" or "manageLambdas" privileges in inventory',
        function () {
          this.set('atmInventory.privileges', {
            manageLambdas: false,
            manageWorkflowSchemas: true,
          });
          expect(this.get('action.disabled')).to.be.true;
          expect(String(this.get('action.tip'))).to.equal(
            'Insufficient privileges (requires &quot;manage lambdas&quot; privilege in this automation inventory).'
          );

          this.set('atmInventory.privileges', {
            manageLambdas: true,
            manageWorkflowSchemas: false,
          });
          expect(this.get('action.disabled')).to.be.true;
          expect(String(this.get('action.tip'))).to.equal(
            'Insufficient privileges (requires &quot;manage workflow schemas&quot; privilege in this automation inventory).'
          );
        }
      );

      itShowsModalOnFileUpload();
      itAllowsToReuploadAnotherFile();
      itShowsInfoAboutInvalidUploadedFile();
      itExecutesMergingOnSubmitWithSuccess();
      itExecutesCreatingOnSubmitWithSuccess();
      itExecutesMergingOnSubmitWithFailure();
      itExecutesCreatingOnSubmitWithFailure();
    });
  }
);

function itHasCorrectBasicProperties() {
  it('has correct className, icon and title', function () {
    const atmModelName = this.get('atmModelName');
    const {
      className,
      icon,
      title,
    } = getProperties(this.get('action'), 'className', 'icon', 'title');
    expect(className).to.equal(`upload-atm-record-action-trigger upload-${dasherize(atmModelName)}-action-trigger`);
    expect(icon).to.equal('browser-upload');
    expect(String(title)).to.equal('Upload (json)');
  });
}

function itShowsModalOnFileUpload() {
  it('shows modal on file upload', async function () {
    const filename = 'file.json';
    await render(hbs`{{global-modal-mounter}}`);
    const dump = generateDump(this.get('atmModelName'));
    await triggerUploadInputChange(filename, JSON.stringify(dump));

    expect(getModal()).to.have.class('apply-atm-record-dump-modal');
    expect(getModal().querySelector('.upload-details')).to.contain.text(filename);
    expect(getModal().querySelector('.dump-details .error')).to.not.exist;
  });
}

function itAllowsToReuploadAnotherFile() {
  it('allows to reupload another file', async function () {
    await render(hbs`{{global-modal-mounter}}`);
    const dump = generateDump(this.get('atmModelName'));
    await triggerUploadInputChange('file.json', JSON.stringify(dump));
    await triggerUploadInputChange('file2.json', JSON.stringify(dump));

    expect(getModal().querySelector('.upload-details')).to.contain.text('file2.json');
  });
}

function itShowsInfoAboutInvalidUploadedFile() {
  ['name', 'revision'].forEach(fieldName => {
    it(`shows info about invalid uploaded file (missing ${fieldName})`,
      async function () {
        const atmModelName = this.get('atmModelName');
        const filename = 'file.json';
        await render(hbs`{{global-modal-mounter}}`);

        const dump = generateDump(atmModelName);
        if (atmModelName === 'atmLambda' && fieldName === 'name') {
          delete dump.revision.atmLambdaRevision.name;
        } else {
          delete dump[fieldName];
        }
        await triggerUploadInputChange(filename, JSON.stringify(dump));

        expect(getModal().querySelector('.upload-details')).to.contain.text(filename);
        expect(getModal().querySelector('.dump-details .error')).to.exist;
      }
    );
  });

  it('shows info about invalid uploaded file (non-json content)',
    async function () {
      const filename = 'file.json';
      await render(hbs`{{global-modal-mounter}}`);

      await triggerUploadInputChange(filename, 'random content');

      expect(getModal().querySelector('.upload-details')).to.contain.text(filename);
      expect(getModal().querySelector('.dump-details .error')).to.exist;
    }
  );
}

function itExecutesMergingOnSubmitWithSuccess() {
  it('executes merging records on submit - notification on success',
    async function () {
      const {
        atmModelName,
        mergeStub,
      } = this.getProperties('atmModelName', 'mergeStub');
      mergeStub.resolves();
      const successNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'success'
      );
      const dump = generateDump(atmModelName);
      await render(hbs`{{global-modal-mounter}}`);

      await triggerUploadInputChange('file.json', JSON.stringify(dump));
      await click('.submit-btn');

      expect(mergeStub).to.be.calledOnce
        .and.to.be.calledWith(atmModelName === 'atmLambda' ? 'lm1id' : 'wf1id', dump);

      expect(successNotifySpy).to.be.calledWith(sinon.match.has(
        'string',
        `The ${atmModelName === 'atmLambda' ? 'lambda' : 'workflow'} has been merged successfully.`
      ));
    }
  );
}

function itExecutesCreatingOnSubmitWithSuccess() {
  it('executes creating new record on submit - notification on success',
    async function () {
      const {
        atmModelName,
        createStub,
      } = this.getProperties('atmModelName', 'createStub');
      createStub.resolves();
      const successNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'success'
      );
      const dump = generateDump(atmModelName);
      const expectedRecordContent = _.cloneDeep(dump);
      if (atmModelName === 'atmLambda') {
        expectedRecordContent.revision.atmLambdaRevision.name = 'abcd';
      } else {
        expectedRecordContent.name = 'abcd';
      }
      await render(hbs`{{global-modal-mounter}}`);

      await triggerUploadInputChange('file.json', JSON.stringify(dump));
      await click('.option-create');
      await fillIn('.newAtmRecordName-field .form-control', 'abcd');
      await click('.submit-btn');

      expect(createStub).to.be.calledOnce
        .and.to.be.calledWith(atmInventoryId, expectedRecordContent);
      expect(successNotifySpy).to.be.calledWith(sinon.match.has(
        'string',
        `The ${atmModelName === 'atmLambda' ? 'lambda' : 'workflow'} has been created successfully.`
      ));
    }
  );
}

function itExecutesMergingOnSubmitWithFailure() {
  it('executes merging record dump on submit - notification on failure',
    async function () {
      suppressRejections();
      const {
        atmModelName,
        mergeStub,
      } = this.getProperties('atmModelName', 'mergeStub');
      mergeStub.callsFake(() => reject('someError'));
      const failureNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'backendError'
      );
      const dump = generateDump(atmModelName);
      await render(hbs`{{global-modal-mounter}}`);

      await triggerUploadInputChange('file.json', JSON.stringify(dump));
      await click('.submit-btn');

      expect(failureNotifySpy).to.be.calledWith(
        sinon.match.has('string', `merging ${atmModelName === 'atmLambda' ? 'lambda' : 'workflow'}`),
        'someError'
      );
    }
  );
}

function itExecutesCreatingOnSubmitWithFailure() {
  it('executes creating new workflow on submit - notification on failure',
    async function () {
      suppressRejections();
      const {
        atmModelName,
        createStub,
      } = this.getProperties('atmModelName', 'createStub');
      createStub.callsFake(() => reject('someError'));
      const failureNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'backendError'
      );
      const dump = generateDump(atmModelName);
      await render(hbs`{{global-modal-mounter}}`);

      await triggerUploadInputChange('file.json', JSON.stringify(dump));
      await click('.option-create');
      await click('.submit-btn');

      expect(failureNotifySpy).to.be.calledWith(
        sinon.match.has('string', `creating ${atmModelName === 'atmLambda' ? 'lambda' : 'workflow'}`),
        'someError'
      );
    }
  );
}

function generateDump(atmModelName) {
  return atmModelName === 'atmLambda' ?
    generateAtmLambdaDump() : generateAtmWorkflowSchemaDump();
}

export async function triggerUploadInputChange(filename, fileContent) {
  const uploadInput = globals.document.querySelector('.upload-atm-record-action-input');
  await triggerFileInputChange(
    uploadInput,
    [{ name: filename, content: fileContent, mimeType: 'application/json' }]
  );
  await waitUntil(() => !uploadInput.matches('.loading-file') && isModalOpened());
}
