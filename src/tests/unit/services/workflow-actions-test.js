import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import ModifyWorkflowDirectoryAction from 'onezone-gui/utils/workflow-actions/modify-workflow-directory-action';
import RemoveWorkflowDirectoryAction from 'onezone-gui/utils/workflow-actions/remove-workflow-directory-action';
import { get } from '@ember/object';

describe('Unit | Service | workflow actions', function () {
  setupTest('service:workflow-actions', {
    needs: [
      'service:workflowManager',
      'service:globalNotify',
    ],
  });

  it('creates ModifyWorkflowDirectoryAction instance', function () {
    const service = this.subject();

    const workflowDirectory = {};
    const workflowDirectoryDiff = {};
    const action = service.createModifyWorkflowDirectoryAction({
      workflowDirectory,
      workflowDirectoryDiff,
    });

    expect(action).to.be.instanceOf(ModifyWorkflowDirectoryAction);
    expect(get(action, 'workflowDirectory')).to.equal(workflowDirectory);
    expect(get(action, 'workflowDirectoryDiff'))
      .to.equal(workflowDirectoryDiff);
  });

  it('creates RemoveWorkflowDirectoryAction instance', function () {
    const service = this.subject();

    const workflowDirectory = {};
    const action = service.createRemoveWorkflowDirectoryAction({
      workflowDirectory,
    });

    expect(action).to.be.instanceOf(RemoveWorkflowDirectoryAction);
    expect(get(action, 'workflowDirectory')).to.equal(workflowDirectory);
  });
});
