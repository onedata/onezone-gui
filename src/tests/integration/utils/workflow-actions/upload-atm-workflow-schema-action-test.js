import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import UploadAtmWorkflowSchemaAction from 'onezone-gui/utils/workflow-actions/upload-atm-workflow-schema-action';
import { get, getProperties } from '@ember/object';
import { getModal, getModalFooter } from '../../../helpers/modal';
import wait from 'ember-test-helpers/wait';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { resolve, reject } from 'rsvp';
import { click, fillIn } from 'ember-native-dom-helpers';
import {
  triggerUploadInputChange,
  generateExampleDump,
} from '../../components/modals/upload-atm-workflow-schema-modal/uploader-test';
import { lookupService } from '../../../helpers/stub-service';
import sinon from 'sinon';

const atmInventoryId = 'invid';

describe(
  'Integration | Utility | workflow actions/upload atm workflow schema action',
  function () {
    setupComponentTest('test-component', {
      integration: true,
    });

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
      const workflowManager = lookupService(this, 'workflow-manager');
      const mergeStub =
        sinon.stub(workflowManager, 'mergeAtmWorkflowSchemaDumpToExistingSchema');
      const createStub = sinon.stub(workflowManager, 'createAtmWorkflowSchema');
      this.setProperties({
        action: UploadAtmWorkflowSchemaAction.create({
          ownerSource: this,
          context: {
            atmInventory,
          },
        }),
        atmInventory,
        mergeStub,
        createStub,
      });
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

    it('shows modal on execute', async function () {
      this.render(hbs `{{global-modal-mounter}}`);
      this.get('action').execute();
      await wait();

      expect(getModal()).to.have.class('upload-atm-workflow-schema-modal');
    });

    it('returns promise with cancelled ActionResult after execute() and modal close using "Cancel"',
      async function () {
        this.render(hbs `{{global-modal-mounter}}`);

        const resultPromise = this.get('action').execute();
        await wait();
        await click(getModalFooter().find('.cancel-btn')[0]);
        const actionResult = await resultPromise;

        expect(get(actionResult, 'status')).to.equal('cancelled');
      }
    );

    it('executes merging workflows on submit - success status and notification on success',
      async function () {
        const {
          mergeStub,
          action,
        } = this.getProperties(
          'mergeStub',
          'action'
        );
        mergeStub.resolves();
        const successNotifySpy = sinon.spy(
          lookupService(this, 'global-notify'),
          'success'
        );
        const dump = generateExampleDump();
        this.render(hbs `{{global-modal-mounter}}`);

        const actionResultPromise = action.execute();
        await wait();
        await triggerUploadInputChange(this, 'file.json', JSON.stringify(dump));
        await click('.submit-btn');
        const actionResult = await actionResultPromise;

        expect(mergeStub).to.be.calledOnce.and.to.be.calledWith('wf1id', dump);
        expect(successNotifySpy).to.be.calledWith(sinon.match.has(
          'string',
          'The workflow has been merged successfully.'
        ));
        expect(get(actionResult, 'status')).to.equal('done');
      });

    it('executes creating new workflow on submit - success status and notification on success',
      async function () {
        const {
          createStub,
          action,
        } = this.getProperties(
          'createStub',
          'action'
        );
        createStub.resolves();
        const successNotifySpy = sinon.spy(
          lookupService(this, 'global-notify'),
          'success'
        );
        const dump = generateExampleDump();
        this.render(hbs `{{global-modal-mounter}}`);

        const actionResultPromise = action.execute();
        await wait();
        await triggerUploadInputChange(this, 'file.json', JSON.stringify(dump));
        await click('.option-create');
        await fillIn('.newWorkflowName-field .form-control', 'abcd');
        await click('.submit-btn');
        const actionResult = await actionResultPromise;

        const expectedWorkflowContent = Object.assign({}, dump, { name: 'abcd' });
        expect(createStub).to.be.calledOnce
          .and.to.be.calledWith(atmInventoryId, expectedWorkflowContent);
        expect(successNotifySpy).to.be.calledWith(sinon.match.has(
          'string',
          'The workflow has been created successfully.'
        ));
        expect(get(actionResult, 'status')).to.equal('done');
      });

    it(
      'executes merging workflow dump on submit - error status and notification on failure',
      async function () {
        const {
          mergeStub,
          action,
        } = this.getProperties(
          'mergeStub',
          'action'
        );
        mergeStub.callsFake(() => reject('someError'));
        const failureNotifySpy = sinon.spy(
          lookupService(this, 'global-notify'),
          'backendError'
        );
        const dump = generateExampleDump();
        this.render(hbs `{{global-modal-mounter}}`);

        const actionResultPromise = action.execute();
        await wait();
        await triggerUploadInputChange(this, 'file.json', JSON.stringify(dump));
        await click(getModalFooter().find('.submit-btn')[0]);
        await wait();
        const actionResult = await actionResultPromise;

        const expectedError = { error: 'someError', operation: 'merge' };
        expect(failureNotifySpy).to.be.calledWith(
          sinon.match.has('string', 'merging workflow'), expectedError
        );
        const {
          status,
          error,
        } = getProperties(actionResult, 'status', 'error');
        expect(status).to.equal('failed');
        expect(error).to.deep.equal(expectedError);
      }
    );

    it(
      'executes creating new workflow on submit - error status and notification on failure',
      async function () {
        const {
          createStub,
          action,
        } = this.getProperties(
          'createStub',
          'action'
        );
        createStub.callsFake(() => reject('someError'));
        const failureNotifySpy = sinon.spy(
          lookupService(this, 'global-notify'),
          'backendError'
        );
        const dump = generateExampleDump();
        this.render(hbs `{{global-modal-mounter}}`);

        const actionResultPromise = action.execute();
        await wait();
        await triggerUploadInputChange(this, 'file.json', JSON.stringify(dump));
        await click('.option-create');
        await click('.submit-btn');
        await wait();
        const actionResult = await actionResultPromise;

        const expectedError = { error: 'someError', operation: 'create' };
        expect(failureNotifySpy).to.be.calledWith(
          sinon.match.has('string', 'creating workflow'), expectedError
        );
        const {
          status,
          error,
        } = getProperties(actionResult, 'status', 'error');
        expect(status).to.equal('failed');
        expect(error).to.deep.equal(expectedError);
      }
    );
  }
);
