import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import UploadAtmWorkflowSchemaAction from 'onezone-gui/utils/workflow-actions/upload-atm-workflow-schema-action';
import { getProperties } from '@ember/object';
import { getModal } from '../../../helpers/modal';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { resolve, reject } from 'rsvp';
import generateAtmWorkflowSchemaDump from '../../../helpers/workflows/generate-atm-workflow-schema-dump';
import { lookupService } from '../../../helpers/stub-service';
import triggerFileInputChange from '../../../helpers/trigger-file-input-change';
import sinon from 'sinon';
import $ from 'jquery';
import { suppressRejections } from '../../../helpers/suppress-rejections';

const atmInventoryId = 'invid';

describe(
  'Integration | Utility | workflow actions/upload atm workflow schema action',
  function () {
    const { afterEach } = setupRenderingTest();

    beforeEach(function () {
      const atmWorkflowSchemas = [{
        entityId: 'wf1id',
        name: 'wf1',
        originalAtmWorkflowSchemaId: 'w1id',
        revisionRegistry: {
          1: {},
        },
      }];
      const atmInventory = {
        entityId: atmInventoryId,
        atmWorkflowSchemaList: promiseObject(resolve({
          list: promiseArray(resolve(atmWorkflowSchemas)),
        })),
        privileges: {
          manageWorkflowSchemas: true,
        },
      };
      sinon.stub(lookupService(this, 'record-manager'), 'getUserRecordList')
        .resolves({ list: promiseArray(resolve([atmInventory])) });
      const workflowManager = lookupService(this, 'workflow-manager');
      const mergeStub =
        sinon.stub(workflowManager, 'mergeAtmWorkflowSchemaDumpToExistingSchema');
      const createStub = sinon.stub(workflowManager, 'createAtmWorkflowSchema');
      this.setProperties({
        action: UploadAtmWorkflowSchemaAction.create({
          ownerSource: this.owner,
          context: {
            atmInventory,
          },
        }),
        atmInventory,
        mergeStub,
        createStub,
      });
    });

    afterEach(function () {
      this.get('action').destroy();
    });

    it('has correct className, icon and title', function () {
      const {
        className,
        icon,
        title,
      } = getProperties(this.get('action'), 'className', 'icon', 'title');
      expect(className).to.equal('upload-atm-workflow-schema-action-trigger');
      expect(icon).to.equal('browser-upload');
      expect(String(title)).to.equal('Upload (json)');
    });

    it('is enabled, when user has "manageWorkflowSchemas" privilege in inventory',
      function () {
        this.set('atmInventory.privileges.manageWorkflowSchemas', true);

        expect(this.get('action.disabled')).to.be.false;
        expect(String(this.get('action.tip'))).to.be.empty;
      });

    it('is disabled, when user does not have "manageWorkflowSchemas" privilege in inventory',
      function () {
        this.set('atmInventory.privileges.manageWorkflowSchemas', false);

        expect(this.get('action.disabled')).to.be.true;
        expect(String(this.get('action.tip'))).to.equal(
          'Insufficient privileges (requires &quot;manage workflow schemas&quot; privilege in this automation inventory).'
        );
      });

    it('shows modal on file upload', async function () {
      const filename = 'file.json';
      await render(hbs `{{global-modal-mounter}}`);
      const dump = generateAtmWorkflowSchemaDump();
      await triggerUploadInputChange(filename, JSON.stringify(dump));

      expect($(getModal())).to.have.class('apply-atm-workflow-schema-dump-modal');
      expect($(getModal()).find('.upload-details').text()).to.contain(filename);
      expect($(getModal()).find('.dump-details .error')).to.not.exist;
    });

    it('allows to reupload another file', async function () {
      await render(hbs `{{global-modal-mounter}}`);
      const dump = generateAtmWorkflowSchemaDump();
      await triggerUploadInputChange('file.json', JSON.stringify(dump));
      await triggerUploadInputChange('file2.json', JSON.stringify(dump));

      expect($(getModal()).find('.upload-details').text()).to.contain('file2.json');
    });

    ['name', 'revision'].forEach(fieldName => {
      it(`shows info about invalid uploaded file (missing ${fieldName})`,
        async function () {
          const filename = 'file.json';
          await render(hbs `{{global-modal-mounter}}`);

          const dump = generateAtmWorkflowSchemaDump();
          delete dump[fieldName];
          await triggerUploadInputChange(filename, JSON.stringify(dump));

          expect($(getModal()).find('.upload-details').text()).to.contain(filename);
          expect($(getModal()).find('.dump-details .error')).to.exist;
        });
    });

    it('shows info about invalid uploaded file (non-json conten)',
      async function () {
        const filename = 'file.json';
        await render(hbs `{{global-modal-mounter}}`);

        await triggerUploadInputChange(filename, 'random content');

        expect($(getModal()).find('.upload-details').text()).to.contain(filename);
        expect($(getModal()).find('.dump-details .error')).to.exist;
      });

    it('executes merging workflows on submit - notification on success',
      async function () {
        const mergeStub = this.get('mergeStub');
        mergeStub.resolves();
        const successNotifySpy = sinon.spy(
          lookupService(this, 'global-notify'),
          'success'
        );
        const dump = generateAtmWorkflowSchemaDump();
        await render(hbs `{{global-modal-mounter}}`);

        await triggerUploadInputChange('file.json', JSON.stringify(dump));
        await click('.submit-btn');

        expect(mergeStub).to.be.calledOnce.and.to.be.calledWith('wf1id', dump);
        expect(successNotifySpy).to.be.calledWith(sinon.match.has(
          'string',
          'The workflow has been merged successfully.'
        ));
      });

    it('executes creating new workflow on submit - notification on success',
      async function () {
        const createStub = this.get('createStub');
        createStub.resolves();
        const successNotifySpy = sinon.spy(
          lookupService(this, 'global-notify'),
          'success'
        );
        const dump = generateAtmWorkflowSchemaDump();
        await render(hbs `{{global-modal-mounter}}`);

        await triggerUploadInputChange('file.json', JSON.stringify(dump));
        await click('.option-create');
        await fillIn('.newWorkflowName-field .form-control', 'abcd');
        await click('.submit-btn');

        const expectedWorkflowContent = Object.assign({}, dump, { name: 'abcd' });
        expect(createStub).to.be.calledOnce
          .and.to.be.calledWith(atmInventoryId, expectedWorkflowContent);
        expect(successNotifySpy).to.be.calledWith(sinon.match.has(
          'string',
          'The workflow has been created successfully.'
        ));
      });

    it('executes merging workflow dump on submit - notification on failure',
      async function () {
        suppressRejections();
        const mergeStub = this.get('mergeStub');
        mergeStub.callsFake(() => reject('someError'));
        const failureNotifySpy = sinon.spy(
          lookupService(this, 'global-notify'),
          'backendError'
        );
        const dump = generateAtmWorkflowSchemaDump();
        await render(hbs `{{global-modal-mounter}}`);

        await triggerUploadInputChange('file.json', JSON.stringify(dump));
        await click('.submit-btn');

        expect(failureNotifySpy).to.be.calledWith(
          sinon.match.has('string', 'merging workflow'),
          'someError'
        );
      }
    );

    it('executes creating new workflow on submit - notification on failure',
      async function () {
        suppressRejections();
        const createStub = this.get('createStub');
        createStub.callsFake(() => reject('someError'));
        const failureNotifySpy = sinon.spy(
          lookupService(this, 'global-notify'),
          'backendError'
        );
        const dump = generateAtmWorkflowSchemaDump();
        await render(hbs `{{global-modal-mounter}}`);

        await triggerUploadInputChange('file.json', JSON.stringify(dump));
        await click('.option-create');
        await click('.submit-btn');

        expect(failureNotifySpy).to.be.calledWith(
          sinon.match.has('string', 'creating workflow'),
          'someError'
        );
      }
    );
  }
);

export async function triggerUploadInputChange(filename, fileContent) {
  await triggerFileInputChange(
    $('.upload-atm-workflow-schema-action-input')[0],
    [{ name: filename, content: fileContent, mimeType: 'application/json' }]
  );
}
