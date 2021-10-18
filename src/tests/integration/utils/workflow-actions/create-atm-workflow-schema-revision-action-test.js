import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import CreateAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/create-atm-workflow-schema-revision-action';
import sinon from 'sinon';
import { reject } from 'rsvp';
import { lookupService } from '../../../helpers/stub-service';
import { get, set } from '@ember/object';

describe(
  'Integration | Utility | workflow actions/create atm workflow schema revision action',
  function () {
    setupComponentTest('test-component', {
      integration: true,
    });

    beforeEach(function () {
      const workflowSchemaId = 'w1';
      const revision1 = { state: 'deprecated', description: 'abc' };
      const revision3 = { state: 'stable', description: 'def' };
      const atmWorkflowSchema = {
        entityId: workflowSchemaId,
        revisionRegistry: {
          1: revision1,
          3: revision3,
        },
      };
      this.setProperties({
        action: CreateAtmWorkflowSchemaRevisionAction.create({
          ownerSource: this,
          context: {
            atmWorkflowSchema,
          },
        }),
        workflowSchemaId,
        revision1,
        revision3,
        atmWorkflowSchema,
      });
    });

    it('executes creating workflow revision (success scenario, no origin revision defined)',
      async function () {
        const {
          action,
          revision3,
          workflowSchemaId,
        } = this.getProperties(
          'action',
          'revision3',
          'workflowSchemaId'
        );
        const saveStub = sinon
          .stub(lookupService(this, 'workflow-manager'), 'saveAtmWorkflowSchemaRevision')
          .resolves();
        const successNotifySpy = sinon.spy(
          lookupService(this, 'global-notify'),
          'success'
        );

        const actionResult = await action.execute();

        const newRevision = Object.assign({}, revision3, { state: 'draft' });
        expect(saveStub).to.be.calledOnce
          .and.to.be.calledWith(workflowSchemaId, 4, newRevision);
        expect(get(actionResult, 'status')).to.equal('done');
        expect(successNotifySpy).to.be.calledWith(sinon.match.has(
          'string',
          'Workflow revision has been created successfully.'
        ));
      }
    );

    it('executes creating workflow revision (success scenario, origin revision defined)',
      async function () {
        const {
          action,
          revision1,
          workflowSchemaId,
        } = this.getProperties(
          'action',
          'revision1',
          'workflowSchemaId'
        );
        const saveStub = sinon
          .stub(lookupService(this, 'workflow-manager'), 'saveAtmWorkflowSchemaRevision')
          .resolves();
        set(action, 'originRevisionNumber', 1);

        const actionResult = await action.execute();

        const newRevision = Object.assign({}, revision1, { state: 'draft' });
        expect(saveStub).to.be.calledOnce
          .and.to.be.calledWith(workflowSchemaId, 4, newRevision);
        expect(get(actionResult, 'status')).to.equal('done');
      }
    );

    it('executes creating workflow revision (success scenario, no revision in workflow)',
      async function () {
        const {
          action,
          atmWorkflowSchema,
          workflowSchemaId,
        } = this.getProperties(
          'action',
          'atmWorkflowSchema',
          'workflowSchemaId'
        );
        const saveStub = sinon
          .stub(lookupService(this, 'workflow-manager'), 'saveAtmWorkflowSchemaRevision')
          .resolves();
        set(atmWorkflowSchema, 'revisionRegistry', {});

        const actionResult = await action.execute();

        const newRevision = {
          state: 'draft',
          description: '',
          lanes: [],
          stores: [],
        };
        expect(saveStub).to.be.calledOnce
          .and.to.be.calledWith(workflowSchemaId, 1, newRevision);
        expect(get(actionResult, 'status')).to.equal('done');
      }
    );

    it('executes creating workflow revision (failure scenario)', async function () {
      const action = this.get('action');
      set(action, 'revisionDiff', { description: 'def' });
      sinon
        .stub(lookupService(this, 'workflow-manager'), 'saveAtmWorkflowSchemaRevision')
        .returns(reject('err'));
      const failureNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'backendError'
      );

      const actionResult = await this.get('action').execute();

      expect(failureNotifySpy).to.be.calledWith(
        sinon.match.has('string', 'creating workflow revision'),
        'err'
      );
      expect(get(actionResult, 'status')).to.equal('failed');
      expect(get(actionResult, 'error')).to.equal('err');
    });
  }
);
