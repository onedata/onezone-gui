import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import CreateAtmLambdaAction from 'onezone-gui/utils/workflow-actions/create-atm-lambda-action';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import { lookupService } from '../../../helpers/stub-service';
import { get } from '@ember/object';
import wait from 'ember-test-helpers/wait';

describe(
  'Integration | Utility | workflow actions/create atm lambda action',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      const workflowManager = lookupService(this, 'workflow-manager');
      const globalNotify = lookupService(this, 'global-notify');
      this.setProperties({
        createAtmLambdaStub: sinon.stub(workflowManager, 'createAtmLambda'),
        successNotifySpy: sinon.spy(globalNotify, 'success'),
        failureNotifySpy: sinon.spy(globalNotify, 'backendError'),
        atmInventory: {
          entityId: 'someid',
        },
        initialRevision: {
          name: 'someName',
        },
      });
    });

    it('executes creating lambda (success scenario)', async function () {
      const {
        createAtmLambdaStub,
        successNotifySpy,
        atmInventory,
        initialRevision,
      } = this.getProperties(
        'createAtmLambdaStub',
        'successNotifySpy',
        'atmInventory',
        'initialRevision'
      );
      const atmLambdaRecord = {};
      createAtmLambdaStub
        .withArgs(atmInventory.entityId, {
          revision: {
            originalRevisionNumber: 1,
            atmLambdaRevision: initialRevision,
          },
        })
        .resolves(atmLambdaRecord);
      const action = CreateAtmLambdaAction.create({
        ownerSource: this.owner,
        context: {
          atmInventory,
          initialRevision,
        },
      });

      const actionResult = await action.execute();
      expect(get(actionResult, 'status')).to.equal('done');
      expect(get(actionResult, 'result')).to.equal(atmLambdaRecord);
      expect(successNotifySpy).to.be.calledWith(
        sinon.match.has('string', 'Lambda has been created successfully.')
      );
    });

    it('executes creating lambda (failure scenario)', async function () {
      const {
        createAtmLambdaStub,
        failureNotifySpy,
        atmInventory,
        initialRevision,
      } = this.getProperties(
        'createAtmLambdaStub',
        'failureNotifySpy',
        'atmInventory',
        'initialRevision'
      );
      const action = CreateAtmLambdaAction.create({
        ownerSource: this.owner,
        context: {
          atmInventory,
          initialRevision,
        },
      });
      let rejectCreate;
      createAtmLambdaStub.returns(
        new Promise((resolve, reject) => rejectCreate = reject)
      );

      const actionResultPromise = action.execute();
      rejectCreate('someError');
      await wait();
      const actionResult = await actionResultPromise;

      expect(get(actionResult, 'status')).to.equal('failed');
      expect(get(actionResult, 'error')).to.equal('someError');
      expect(failureNotifySpy).to.be.calledWith(
        sinon.match.has('string', 'creating lambda'),
        'someError'
      );
    });
  }
);
