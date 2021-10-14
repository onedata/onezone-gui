import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import { get } from '@ember/object';
import RevisionActionsFactory from 'onezone-gui/utils/atm-workflow/atm-workflow-schema/revision-actions-factory';
import RemoveAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/remove-atm-workflow-schema-revision-action';

const revisionActionsClasses = [
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
      expect(revisionActions).to.have.length(revisionActions.length);
      revisionActions.forEach((action, idx) => {
        expect(action).to.be.instanceOf(revisionActionsClasses[idx]);
        expect(get(action, 'revisionNumber')).to.equal(3);
        expect(get(action, 'atmWorkflowSchema')).to.equal(atmWorkflowSchema);
      });
    });
  }
);
