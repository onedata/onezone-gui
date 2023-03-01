import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { get } from '@ember/object';
import RevisionActionsFactory from 'onezone-gui/utils/atm-workflow/atm-workflow-schema/revision-actions-factory';
import DumpAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/dump-atm-workflow-schema-revision-action';
import RemoveAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/remove-atm-workflow-schema-revision-action';
import CreateAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/create-atm-workflow-schema-revision-action';
import DuplicateAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/duplicate-atm-workflow-schema-revision-action';

const revisionActionsClasses = [{
  classDef: CreateAtmWorkflowSchemaRevisionAction,
  revisionNumberField: 'originRevisionNumber',
}, {
  classDef: DuplicateAtmWorkflowSchemaRevisionAction,
  revisionNumberField: 'revisionNumber',
}, {
  classDef: DumpAtmWorkflowSchemaRevisionAction,
  revisionNumberField: 'revisionNumber',
}, {
  classDef: RemoveAtmWorkflowSchemaRevisionAction,
  revisionNumberField: 'revisionNumber',
}];

describe('Integration | Utility | atm-workflow/atm-workflow-schema/revision-actions-factory',
  function () {
    setupRenderingTest();

    it('creates actions for specific revision', function () {
      const atmWorkflowSchema = { entityId: 'someId' };
      const actionsFactory = RevisionActionsFactory.create({
        ownerSource: this.owner,
        atmWorkflowSchema,
      });
      const revisionActions = actionsFactory.createActionsForRevisionNumber(3);
      expect(revisionActions).to.have.length(revisionActionsClasses.length);
      revisionActions.forEach((action, idx) => {
        expect(action).to.be.instanceOf(revisionActionsClasses[idx].classDef);
        expect(get(action, revisionActionsClasses[idx].revisionNumberField))
          .to.equal(3);
        expect(get(action, 'atmWorkflowSchema')).to.equal(atmWorkflowSchema);
      });
    });

    it('creates action via createCreateRevisionAction', function () {
      const atmWorkflowSchema = { entityId: 'someId' };
      const actionsFactory = RevisionActionsFactory.create({
        ownerSource: this.owner,
        atmWorkflowSchema,
      });
      const action = actionsFactory.createCreateRevisionAction();
      expect(action).to.be.instanceOf(CreateAtmWorkflowSchemaRevisionAction);
      expect(get(action, 'atmWorkflowSchema')).to.equal(atmWorkflowSchema);
    });
  }
);
