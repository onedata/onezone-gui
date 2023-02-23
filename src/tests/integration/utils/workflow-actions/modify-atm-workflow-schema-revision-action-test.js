import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import ModifyAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/modify-atm-workflow-schema-revision-action';
import sinon from 'sinon';
import { reject } from 'rsvp';
import { lookupService } from '../../../helpers/stub-service';
import { get, set } from '@ember/object';

describe(
  'Integration | Utility | workflow-actions/modify-atm-workflow-schema-revision-action',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      const revisionNumber = 2;
      const revision = {
        description: 'abc',
        lanes: [],
      };
      const workflowSchemaId = 'w1';
      this.setProperties({
        action: ModifyAtmWorkflowSchemaRevisionAction.create({
          ownerSource: this.owner,
          context: {
            atmWorkflowSchema: {
              entityId: workflowSchemaId,
              revisionRegistry: {
                [revisionNumber]: revision,
              },
            },
            revisionNumber: 2,
          },
        }),
        revisionNumber,
        revision,
        workflowSchemaId,
      });
    });

    it('executes modifying workflow revision (success scenario)', async function () {
      const {
        action,
        revisionNumber,
        revision,
        workflowSchemaId,
      } = this.getProperties(
        'action',
        'revisionNumber',
        'revision',
        'workflowSchemaId'
      );
      const revisionDiff = {
        description: 'def',
      };
      set(action, 'revisionDiff', revisionDiff);
      const updatedRevision = Object.assign({}, revision, revisionDiff);
      const saveStub = sinon
        .stub(lookupService(this, 'workflow-manager'), 'saveAtmWorkflowSchemaRevision')
        .resolves();
      const successNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'success'
      );

      const actionResult = await action.execute();

      expect(saveStub).to.be.calledOnce
        .and.to.be.calledWith(workflowSchemaId, revisionNumber, updatedRevision);
      expect(get(actionResult, 'status')).to.equal('done');
      expect(successNotifySpy).to.be.calledWith(sinon.match.has(
        'string',
        'Workflow revision has been modified successfully.'
      ));
    });

    it('executes modifying workflow revision (failure scenario)', async function () {
      const error = { id: 'err' };
      const action = this.get('action');
      set(action, 'revisionDiff', { description: 'def' });
      sinon
        .stub(lookupService(this, 'workflow-manager'), 'saveAtmWorkflowSchemaRevision')
        .returns(reject(error));
      const failureNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'backendError'
      );

      const actionResult = await action.execute();

      expect(failureNotifySpy).to.be.calledWith(
        sinon.match.has('string', 'modifying workflow revision'),
        error
      );
      expect(get(actionResult, 'status')).to.equal('failed');
      expect(get(actionResult, 'error')).to.equal(error);
    });
  }
);
