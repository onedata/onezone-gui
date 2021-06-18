import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import ModifyAtmWorkflowSchemaAction from 'onezone-gui/utils/workflow-actions/modify-atm-workflow-schema-action';
import sinon from 'sinon';
import { resolve, reject } from 'rsvp';
import { lookupService } from '../../../helpers/stub-service';
import { get } from '@ember/object';

describe(
  'Integration | Utility | workflow actions/modify atm workflow schema action',
  function () {
    setupComponentTest('test-component', {
      integration: true,
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
      const action = ModifyAtmWorkflowSchemaAction.create({
        ownerSource: this,
        context: {
          atmWorkflowSchema,
          atmWorkflowSchemaDiff,
        },
      });
      const successNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'success'
      );

      return action.execute()
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
      const action = ModifyAtmWorkflowSchemaAction.create({
        ownerSource: this,
        context: {
          atmWorkflowSchema,
          atmWorkflowSchemaDiff,
        },
      });
      const failureNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'backendError'
      );

      return action.execute()
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
