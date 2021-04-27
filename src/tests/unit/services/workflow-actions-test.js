import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import OpenCreateAtmInventoryViewAction from 'onezone-gui/utils/workflow-actions/open-create-atm-inventory-view-action';
import CreateAtmInventoryAction from 'onezone-gui/utils/workflow-actions/create-atm-inventory-action';
import ModifyAtmInventoryAction from 'onezone-gui/utils/workflow-actions/modify-atm-inventory-action';
import RemoveAtmInventoryAction from 'onezone-gui/utils/workflow-actions/remove-atm-inventory-action';
import CreateLambdaFunctionAction from 'onezone-gui/utils/workflow-actions/create-lambda-function-action';
import ModifyAtmWorkflowSchemaAction from 'onezone-gui/utils/workflow-actions/modify-atm-workflow-schema-action';
import { get } from '@ember/object';

describe('Unit | Service | workflow actions', function () {
  setupTest('service:workflow-actions', {
    needs: [
      'service:recordManager',
      'service:workflowManager',
      'service:globalNotify',
      'service:i18n',
    ],
  });

  it('creates OpenCreateAtmInventoryViewAction instance', function () {
    const service = this.subject();

    const action = service.createOpenCreateAtmInventoryViewAction();

    expect(action).to.be.instanceOf(OpenCreateAtmInventoryViewAction);
  });

  it('creates CreateAtmInventoryAction instance', function () {
    const service = this.subject();

    const rawAtmInventory = { name: 'someName' };
    const action = service.createCreateAtmInventoryAction({
      rawAtmInventory,
    });

    expect(action).to.be.instanceOf(CreateAtmInventoryAction);
    expect(get(action, 'rawAtmInventory')).to.equal(rawAtmInventory);
  });

  it('creates ModifyAtmInventoryAction instance', function () {
    const service = this.subject();

    const atmInventory = {};
    const atmInventoryDiff = {};
    const action = service.createModifyAtmInventoryAction({
      atmInventory,
      atmInventoryDiff,
    });

    expect(action).to.be.instanceOf(ModifyAtmInventoryAction);
    expect(get(action, 'atmInventory')).to.equal(atmInventory);
    expect(get(action, 'atmInventoryDiff'))
      .to.equal(atmInventoryDiff);
  });

  it('creates RemoveAtmInventoryAction instance', function () {
    const service = this.subject();

    const atmInventory = {};
    const action = service.createRemoveAtmInventoryAction({
      atmInventory,
    });

    expect(action).to.be.instanceOf(RemoveAtmInventoryAction);
    expect(get(action, 'atmInventory')).to.equal(atmInventory);
  });

  it('creates CreateLambdaFunctionAction instance', function () {
    const service = this.subject();

    const atmInventory = {};
    const rawLambdaFunction = {};
    const action = service.createCreateLambdaFunctionAction({
      rawLambdaFunction,
      atmInventory,
    });

    expect(action).to.be.instanceOf(CreateLambdaFunctionAction);
    expect(get(action, 'rawLambdaFunction')).to.equal(rawLambdaFunction);
    expect(get(action, 'atmInventory')).to.equal(atmInventory);
  });

  it('creates ModifyAtmWorkflowSchemaAction instance', function () {
    const service = this.subject();

    const atmWorkflowSchema = {};
    const atmWorkflowSchemaDiff = {};
    const action = service.createModifyAtmWorkflowSchemaAction({
      atmWorkflowSchema,
      atmWorkflowSchemaDiff,
    });

    expect(action).to.be.instanceOf(ModifyAtmWorkflowSchemaAction);
    expect(get(action, 'atmWorkflowSchema')).to.equal(atmWorkflowSchema);
    expect(get(action, 'atmWorkflowSchemaDiff'))
      .to.equal(atmWorkflowSchemaDiff);
  });

});
