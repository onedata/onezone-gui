import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import ModifyAtmLambdaRevisionAction from 'onezone-gui/utils/workflow-actions/modify-atm-lambda-revision-action';
import sinon from 'sinon';
import { reject } from 'rsvp';
import { lookupService } from '../../../helpers/stub-service';
import { get } from '@ember/object';

describe(
  'Integration | Utility | workflow actions/modify atm lambda revision action',
  function () {
    setupComponentTest('test-component', {
      integration: true,
    });

    it('executes modifying lambda revision (success scenario)', async function () {
      const updateStub = sinon
        .stub(lookupService(this, 'workflow-manager'), 'updateAtmLambdaRevision')
        .resolves();
      const revisionDiff = {
        state: 'stable',
      };
      const atmLambda = {
        entityId: 'lbd1',
        name: 'lambda2',
        revisionRegistry: {
          2: {
            name: 'name',
            summary: 'summary',
            state: 'draft',
          },
        },
      };
      const action = ModifyAtmLambdaRevisionAction.create({
        ownerSource: this,
        context: {
          atmLambda,
          revisionNumber: 2,
          revisionDiff,
        },
      });
      const successNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'success'
      );

      const actionResult = await action.execute();

      expect(updateStub).to.be.calledOnce
        .and.to.be.calledWith(atmLambda.entityId, 2, revisionDiff);
      expect(get(actionResult, 'status')).to.equal('done');
      expect(successNotifySpy).to.be.calledWith(sinon.match.has(
        'string',
        'Lambda revision has been modified successfully.'
      ));
    });

    it('executes modifying lambda (failure scenario)', async function () {
      const error = { id: 'error' };
      sinon
        .stub(lookupService(this, 'workflow-manager'), 'updateAtmLambdaRevision')
        .returns(reject(error));
      const revisionDiff = {
        state: 'stable',
      };
      const atmLambda = {
        entityId: 'lbd1',
        name: 'lambda2',
        revisionRegistry: {
          2: {
            name: 'name',
            summary: 'summary',
            state: 'draft',
          },
        },
      };
      const action = ModifyAtmLambdaRevisionAction.create({
        ownerSource: this,
        context: {
          atmLambda,
          revisionNumber: 2,
          revisionDiff,
        },
      });
      const failureNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'backendError'
      );

      const actionResult = await action.execute();
      expect(failureNotifySpy).to.be.calledWith(
        sinon.match.has('string', 'modifying lambda revision'),
        error
      );
      expect(get(actionResult, 'status')).to.equal('failed');
      expect(get(actionResult, 'error')).to.equal(error);
    });
  }
);
