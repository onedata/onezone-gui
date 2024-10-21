import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { get } from '@ember/object';
import RevisionActionsFactory from 'onezone-gui/utils/atm-workflow/atm-workflow-schema/revision-actions-factory';
import DumpAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/dump-atm-workflow-schema-revision-action';
import RemoveAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/remove-atm-workflow-schema-revision-action';
import CreateAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/create-atm-workflow-schema-revision-action';
import DuplicateAtmRecordRevisionAction from 'onezone-gui/utils/workflow-actions/duplicate-atm-record-revision-action';

const revisionActionsClasses = [{
  classDef: CreateAtmWorkflowSchemaRevisionAction,
  revisionNumberField: 'originRevisionNumber',
}, {
  classDef: DuplicateAtmRecordRevisionAction,
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
    const { afterEach } = setupRenderingTest();

    afterEach(function () {
      this.actions?.forEach((action) => action.destroy());
      this.actionsFactory?.destroy();
    });

    it('creates actions for specific revision', function () {
      const atmWorkflowSchema = { entityId: 'someId' };
      this.actionsFactory = RevisionActionsFactory.create({
        ownerSource: this.owner,
        atmWorkflowSchema,
      });
      const revisionActions = this.actionsFactory.createActionsForRevisionNumber(3);
      this.actions = revisionActions;
      expect(revisionActions).to.have.length(revisionActionsClasses.length);
      revisionActions.forEach((action, idx) => {
        expect(action).to.be.instanceOf(revisionActionsClasses[idx].classDef);
        expect(action[revisionActionsClasses[idx].revisionNumberField])
          .to.equal(3);
        expect(action.atmWorkflowSchema || action.atmRecord).to.equal(atmWorkflowSchema);
      });
    });

    it('creates action via createCreateRevisionAction', function () {
      const atmWorkflowSchema = { entityId: 'someId' };
      this.actionsFactory = RevisionActionsFactory.create({
        ownerSource: this.owner,
        atmWorkflowSchema,
      });
      const action = this.actionsFactory.createCreateRevisionAction();
      this.actions = [action];
      expect(action).to.be.instanceOf(CreateAtmWorkflowSchemaRevisionAction);
      expect(get(action, 'atmWorkflowSchema')).to.equal(atmWorkflowSchema);
    });
  }
);
