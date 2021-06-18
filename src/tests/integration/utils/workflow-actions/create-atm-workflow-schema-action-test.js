import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import CreateAtmWorkflowSchemaAction from 'onezone-gui/utils/workflow-actions/create-atm-workflow-schema-action';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import { lookupService } from '../../../helpers/stub-service';
import { get } from '@ember/object';
import wait from 'ember-test-helpers/wait';

describe(
  'Integration | Utility | workflow actions/create atm workflow schema action',
  function () {
    setupComponentTest('test-component', {
      integration: true,
    });

    beforeEach(function () {
      const workflowManager = lookupService(this, 'workflow-manager');
      const globalNotify = lookupService(this, 'global-notify');
      this.setProperties({
        createAtmWorkflowSchemaStub: sinon.stub(workflowManager, 'createAtmWorkflowSchema'),
        successNotifySpy: sinon.spy(globalNotify, 'success'),
        failureNotifySpy: sinon.spy(globalNotify, 'backendError'),
        atmInventory: {
          entityId: 'someid',
        },
        rawAtmWorkflowSchema: {
          name: 'someName',
        },
      });
    });

    it('executes creating workflow schema (success scenario)', async function () {
      const {
        createAtmWorkflowSchemaStub,
        successNotifySpy,
        atmInventory,
        rawAtmWorkflowSchema,
      } = this.getProperties(
        'createAtmWorkflowSchemaStub',
        'successNotifySpy',
        'atmInventory',
        'rawAtmWorkflowSchema'
      );
      const atmWorkflowSchemaRecord = {};
      createAtmWorkflowSchemaStub
        .withArgs(atmInventory.entityId, rawAtmWorkflowSchema)
        .resolves(atmWorkflowSchemaRecord);
      const action = CreateAtmWorkflowSchemaAction.create({
        ownerSource: this,
        context: {
          atmInventory,
          rawAtmWorkflowSchema,
        },
      });

      const actionResult = await action.execute();
      expect(get(actionResult, 'status')).to.equal('done');
      expect(get(actionResult, 'result')).to.equal(atmWorkflowSchemaRecord);
      expect(successNotifySpy).to.be.calledWith(
        sinon.match.has('string', 'Workflow has been created successfully.')
      );
    });

    it('executes creating workflow schema (failure scenario)', async function () {
      const {
        createAtmWorkflowSchemaStub,
        failureNotifySpy,
        atmInventory,
        rawAtmWorkflowSchema,
      } = this.getProperties(
        'createAtmWorkflowSchemaStub',
        'failureNotifySpy',
        'atmInventory',
        'rawAtmWorkflowSchema'
      );
      const action = CreateAtmWorkflowSchemaAction.create({
        ownerSource: this,
        context: {
          atmInventory,
          rawAtmWorkflowSchema,
        },
      });
      let rejectCreate;
      createAtmWorkflowSchemaStub.returns(
        new Promise((resolve, reject) => rejectCreate = reject)
      );

      const actionResultPromise = action.execute();
      rejectCreate('someError');
      await wait();
      const actionResult = await actionResultPromise;

      expect(get(actionResult, 'status')).to.equal('failed');
      expect(get(actionResult, 'error')).to.equal('someError');
      expect(failureNotifySpy).to.be.calledWith(
        sinon.match.has('string', 'creating workflow'),
        'someError'
      );
    });
  }
);
