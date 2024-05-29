import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import CreateAtmWorkflowSchemaAction from 'onezone-gui/utils/workflow-actions/create-atm-workflow-schema-action';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import { lookupService } from '../../../helpers/stub-service';
import { get } from '@ember/object';
import { settled } from '@ember/test-helpers';

describe(
  'Integration | Utility | workflow-actions/create-atm-workflow-schema-action',
  function () {
    const { afterEach } = setupRenderingTest();

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
        completeRawAtmWorkflowSchema: {
          name: 'someName',
          revision: {
            originalRevisionNumber: 1,
            atmWorkflowSchemaRevision: {
              state: 'draft',
              description: '',
              lanes: [],
              stores: [],
            },
          },
        },
      });
    });

    afterEach(function () {
      this.action?.destroy();
    });

    it('executes creating workflow schema (success scenario)', async function () {
      const {
        createAtmWorkflowSchemaStub,
        successNotifySpy,
        atmInventory,
        rawAtmWorkflowSchema,
        completeRawAtmWorkflowSchema,
      } = this.getProperties(
        'createAtmWorkflowSchemaStub',
        'successNotifySpy',
        'atmInventory',
        'rawAtmWorkflowSchema',
        'completeRawAtmWorkflowSchema'
      );
      const atmWorkflowSchemaRecord = {};
      createAtmWorkflowSchemaStub
        .withArgs(atmInventory.entityId, sinon.match(completeRawAtmWorkflowSchema))
        .resolves(atmWorkflowSchemaRecord);
      this.action = CreateAtmWorkflowSchemaAction.create({
        ownerSource: this.owner,
        context: {
          atmInventory,
          rawAtmWorkflowSchema,
        },
      });

      const actionResult = await this.action.execute();
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
      this.action = CreateAtmWorkflowSchemaAction.create({
        ownerSource: this.owner,
        context: {
          atmInventory,
          rawAtmWorkflowSchema,
        },
      });
      let rejectCreate;
      createAtmWorkflowSchemaStub.returns(
        new Promise((resolve, reject) => rejectCreate = reject)
      );

      const actionResultPromise = this.action.execute();
      rejectCreate('someError');
      await settled();
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
