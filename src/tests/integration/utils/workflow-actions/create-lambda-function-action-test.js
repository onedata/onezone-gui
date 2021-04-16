import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import CreateLambdaFunctionAction from 'onezone-gui/utils/workflow-actions/create-lambda-function-action';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import { lookupService } from '../../../helpers/stub-service';
import { get } from '@ember/object';
import wait from 'ember-test-helpers/wait';

describe(
  'Unit | Utility | workflow actions/create lambda function action',
  function () {
    setupComponentTest('test-component', {
      integration: true,
    });

    beforeEach(function () {
      const workflowManager = lookupService(this, 'workflow-manager');
      const globalNotify = lookupService(this, 'global-notify');
      this.setProperties({
        createLambdaFunctionStub: sinon.stub(workflowManager, 'createLambdaFunction'),
        successNotifySpy: sinon.spy(globalNotify, 'success'),
        failureNotifySpy: sinon.spy(globalNotify, 'backendError'),
        workflowDirectory: {
          entityId: 'someid',
        },
        rawLambdaFunction: {
          name: 'someName',
        },
      });
    });

    it('executes creating lambda function (success scenario)', async function () {
      const {
        createLambdaFunctionStub,
        successNotifySpy,
        workflowDirectory,
        rawLambdaFunction,
      } = this.getProperties(
        'createLambdaFunctionStub',
        'successNotifySpy',
        'workflowDirectory',
        'rawLambdaFunction'
      );
      const lambdaFunctionRecord = {};
      createLambdaFunctionStub
        .withArgs(workflowDirectory.entityId, rawLambdaFunction)
        .resolves(lambdaFunctionRecord);
      const action = CreateLambdaFunctionAction.create({
        ownerSource: this,
        context: {
          workflowDirectory,
          rawLambdaFunction,
        },
      });

      const actionResult = await action.execute();
      expect(get(actionResult, 'status')).to.equal('done');
      expect(get(actionResult, 'result')).to.equal(lambdaFunctionRecord);
      expect(successNotifySpy).to.be.calledWith(
        sinon.match.has('string', 'Lambda function has been created successfully.')
      );
    });

    it('executes creating lambda function (failure scenario)', async function () {
      const {
        createLambdaFunctionStub,
        failureNotifySpy,
        workflowDirectory,
        rawLambdaFunction,
      } = this.getProperties(
        'createLambdaFunctionStub',
        'failureNotifySpy',
        'workflowDirectory',
        'rawLambdaFunction'
      );
      const action = CreateLambdaFunctionAction.create({
        ownerSource: this,
        context: {
          workflowDirectory,
          rawLambdaFunction,
        },
      });
      let rejectCreate;
      createLambdaFunctionStub.returns(
        new Promise((resolve, reject) => rejectCreate = reject)
      );

      const actionResultPromise = action.execute();
      rejectCreate('someError');
      await wait();
      const actionResult = await actionResultPromise;

      expect(get(actionResult, 'status')).to.equal('failed');
      expect(get(actionResult, 'error')).to.equal('someError');
      expect(failureNotifySpy).to.be.calledWith(
        sinon.match.has('string', 'creating lambda function'),
        'someError'
      );
    });
  }
);
