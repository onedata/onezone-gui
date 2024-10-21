import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import ModifyAtmWorkflowSchemaAction from 'onezone-gui/utils/workflow-actions/modify-atm-workflow-schema-action';
import sinon from 'sinon';
import { resolve, reject } from 'rsvp';
import { lookupService } from '../../../helpers/stub-service';
import { get } from '@ember/object';

describe(
  'Integration | Utility | workflow-actions/modify-atm-workflow-schema-action',
  function () {
    const { afterEach } = setupRenderingTest();

    afterEach(function () {
      this.action?.destroy();
    });

    it('executes modifying workflow (success scenario)', function () {
      const atmWorkflowSchemaDiff = {
        name: 'workflow2',
      };
      const atmWorkflowSchema = {
        name: 'workflow1',
        save: sinon.stub().callsFake(() => {
          if (atmWorkflowSchema.name === atmWorkflowSchemaDiff.name) {
            return resolve();
          }
        }),
      };
      this.action = ModifyAtmWorkflowSchemaAction.create({
        ownerSource: this.owner,
        context: {
          atmWorkflowSchema,
          atmWorkflowSchemaDiff,
        },
      });
      const successNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'success'
      );

      return this.action.execute()
        .then(actionResult => {
          expect(atmWorkflowSchema.save).to.be.calledOnce;
          expect(atmWorkflowSchema.name).to.equal('workflow2');
          expect(successNotifySpy).to.be.calledWith(
            sinon.match.has('string', 'Workflow has been modified successfully.')
          );
          expect(get(actionResult, 'status')).to.equal('done');
          expect(get(actionResult, 'result')).to.equal(atmWorkflowSchema);
        });
    });

    it('executes modifying workflow (failure scenario)', function () {
      const atmWorkflowSchemaDiff = {
        name: 'workflow2',
      };
      const atmWorkflowSchema = {
        name: 'workflow1',
        save: sinon.stub().callsFake(() => {
          if (atmWorkflowSchema.name === atmWorkflowSchemaDiff.name) {
            return reject('error');
          }
        }),
        rollbackAttributes() {
          atmWorkflowSchema.name = 'workflow1';
        },
      };
      this.action = ModifyAtmWorkflowSchemaAction.create({
        ownerSource: this.owner,
        context: {
          atmWorkflowSchema,
          atmWorkflowSchemaDiff,
        },
      });
      const failureNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'backendError'
      );

      return this.action.execute()
        .then(actionResult => {
          expect(atmWorkflowSchema.name).to.equal('workflow1');
          expect(failureNotifySpy).to.be.calledWith(
            sinon.match.has('string', 'modifying workflow'),
            'error'
          );
          expect(get(actionResult, 'status')).to.equal('failed');
          expect(get(actionResult, 'error')).to.equal('error');
        });
    });
  }
);
