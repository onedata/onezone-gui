import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import CreateAtmLambdaRevisionAction from 'onezone-gui/utils/workflow-actions/create-atm-lambda-revision-action';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import { lookupService } from '../../../helpers/stub-service';
import { get } from '@ember/object';
import { settled } from '@ember/test-helpers';

describe(
  'Integration | Utility | workflow-actions/create-atm-lambda-revision-action',
  function () {
    const { afterEach } = setupRenderingTest();

    beforeEach(function () {
      const workflowManager = lookupService(this, 'workflow-manager');
      const globalNotify = lookupService(this, 'global-notify');
      this.setProperties({
        createAtmLambdaRevisionStub: sinon.stub(workflowManager, 'createAtmLambdaRevision'),
        successNotifySpy: sinon.spy(globalNotify, 'success'),
        failureNotifySpy: sinon.spy(globalNotify, 'backendError'),
        atmLambda: {
          entityId: 'someId',
          revisionRegistry: {
            2: {},
          },
        },
        revisionContent: {
          name: 'someName',
        },
      });
    });

    afterEach(function () {
      this.action?.destroy();
    });

    it('executes creating lambda revision (success scenario)', async function () {
      const {
        createAtmLambdaRevisionStub,
        successNotifySpy,
        atmLambda,
        revisionContent,
      } = this.getProperties(
        'createAtmLambdaRevisionStub',
        'successNotifySpy',
        'atmLambda',
        'revisionContent'
      );
      createAtmLambdaRevisionStub
        .withArgs(atmLambda.entityId, 3, revisionContent)
        .resolves();
      this.action = CreateAtmLambdaRevisionAction.create({
        ownerSource: this.owner,
        context: {
          atmLambda,
          revisionContent,
        },
      });

      const actionResult = await this.action.execute();
      expect(get(actionResult, 'status')).to.equal('done');
      expect(get(actionResult, 'result')).to.equal(3);
      expect(successNotifySpy).to.be.calledWith(
        sinon.match.has('string', 'Lambda revision has been created successfully.')
      );
    });

    it('executes creating lambda revision (failure scenario)', async function () {
      const {
        createAtmLambdaRevisionStub,
        failureNotifySpy,
        atmLambda,
        revisionContent,
      } = this.getProperties(
        'createAtmLambdaRevisionStub',
        'failureNotifySpy',
        'atmLambda',
        'revisionContent'
      );
      this.action = CreateAtmLambdaRevisionAction.create({
        ownerSource: this.owner,
        context: {
          atmLambda,
          revisionContent,
        },
      });
      let rejectCreate;
      createAtmLambdaRevisionStub.returns(
        new Promise((resolve, reject) => rejectCreate = reject)
      );

      const actionResultPromise = this.action.execute();
      rejectCreate('someError');
      await settled();
      const actionResult = await actionResultPromise;

      expect(get(actionResult, 'status')).to.equal('failed');
      expect(get(actionResult, 'error')).to.equal('someError');
      expect(failureNotifySpy).to.be.calledWith(
        sinon.match.has('string', 'creating lambda revision'),
        'someError'
      );
    });
  }
);
