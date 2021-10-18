import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import { get } from '@ember/object';
import RevisionActionsFactory from 'onezone-gui/utils/atm-workflow/atm-workflow-schema/revision-actions-factory';
import DumpAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/dump-atm-workflow-schema-revision-action';
import RemoveAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/remove-atm-workflow-schema-revision-action';
import CreateAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/create-atm-workflow-schema-revision-action';

const revisionActionsClasses = [
  DumpAtmWorkflowSchemaRevisionAction,
  RemoveAtmWorkflowSchemaRevisionAction,
];

describe('Integration | Utility | atm workflow/atm workflow schema/revision actions factory',
  function () {
    setupComponentTest('test-component', {
      integration: true,
    });

    it('creates actions for specific revision', function () {
      const atmWorkflowSchema = { entityId: 'someId' };
      const actionsFactory = RevisionActionsFactory.create({
        ownerSource: this,
        atmWorkflowSchema,
      });
      const revisionActions = actionsFactory.createActionsForRevisionNumber(3);
      expect(revisionActions).to.have.length(revisionActionsClasses.length);
      revisionActions.forEach((action, idx) => {
        expect(action).to.be.instanceOf(revisionActionsClasses[idx]);
        expect(get(action, 'revisionNumber')).to.equal(3);
        expect(get(action, 'atmWorkflowSchema')).to.equal(atmWorkflowSchema);
      });
    });

    it('creates action via createCreateRevisionAction', function () {
      const atmWorkflowSchema = { entityId: 'someId' };
      const actionsFactory = RevisionActionsFactory.create({
        ownerSource: this,
        atmWorkflowSchema,
      });
      const action = actionsFactory.createCreateRevisionAction();
      expect(action).to.be.instanceOf(CreateAtmWorkflowSchemaRevisionAction);
      expect(get(action, 'atmWorkflowSchema')).to.equal(atmWorkflowSchema);
    });
  }
);
