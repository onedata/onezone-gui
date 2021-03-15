import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import ModifyWorkflowDirectoryAction from 'onezone-gui/utils/workflow-actions/modify-workflow-directory-action';
import sinon from 'sinon';
import { resolve, reject } from 'rsvp';
import { lookupService } from '../../../helpers/stub-service';
import { get } from '@ember/object';

describe(
  'Unit | Utility | workflow actions/modify workflow directory action',
  function () {
    setupComponentTest('test-component', {
      integration: true,
    });

    it('executes modifying workflow directory (success scenario)', function () {
      const workflowDirectoryDiff = {
        name: 'directory2',
      };
      const workflowDirectory = {
        name: 'directory1',
        save: sinon.stub().callsFake(() => {
          if (workflowDirectory.name === workflowDirectoryDiff.name) {
            return resolve();
          }
        }),
      };
      const action = ModifyWorkflowDirectoryAction.create({
        ownerSource: this,
        context: {
          workflowDirectory,
          workflowDirectoryDiff,
        },
      });
      const successNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'success'
      );

      return action.execute()
        .then(actionResult => {
          expect(workflowDirectory.save).to.be.calledOnce;
          expect(workflowDirectory.name).to.equal('directory2');
          expect(successNotifySpy).to.be.calledWith(
            sinon.match.has('string', 'Workflow directory has been modified successfully.')
          );
          expect(get(actionResult, 'status')).to.equal('done');
          expect(get(actionResult, 'result')).to.equal(workflowDirectory);
        });
    });

    it('executes modifying workflow directory (failure scenario)', function () {
      const workflowDirectoryDiff = {
        name: 'directory2',
      };
      const workflowDirectory = {
        name: 'directory1',
        save: sinon.stub().callsFake(() => {
          if (workflowDirectory.name === workflowDirectoryDiff.name) {
            return reject('error');
          }
        }),
        rollbackAttributes() {
          workflowDirectory.name = 'directory1';
        },
      };
      const action = ModifyWorkflowDirectoryAction.create({
        ownerSource: this,
        context: {
          workflowDirectory,
          workflowDirectoryDiff,
        },
      });
      const failureNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'backendError'
      );

      return action.execute()
        .then(actionResult => {
          expect(workflowDirectory.name).to.equal('directory1');
          expect(failureNotifySpy).to.be.calledWith(
            sinon.match.has('string', 'modifying workflow directory'),
            'error'
          );
          expect(get(actionResult, 'status')).to.equal('failed');
          expect(get(actionResult, 'error')).to.equal('error');
        });
    });
  }
);
