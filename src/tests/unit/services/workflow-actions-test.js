import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import OpenCreateAtmInventoryViewAction from 'onezone-gui/utils/workflow-actions/open-create-atm-inventory-view-action';
import CreateAtmInventoryAction from 'onezone-gui/utils/workflow-actions/create-atm-inventory-action';
import ModifyAtmInventoryAction from 'onezone-gui/utils/workflow-actions/modify-atm-inventory-action';
import RemoveAtmInventoryAction from 'onezone-gui/utils/workflow-actions/remove-atm-inventory-action';
import CreateAtmLambdaAction from 'onezone-gui/utils/workflow-actions/create-atm-lambda-action';
import ModifyAtmLambdaAction from 'onezone-gui/utils/workflow-actions/modify-atm-lambda-action';
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

  it('creates CreateAtmLambdaAction instance', function () {
    const service = this.subject();

    const atmInventory = {};
    const rawAtmLambda = {};
    const action = service.createCreateAtmLambdaAction({
      rawAtmLambda,
      atmInventory,
    });

    expect(action).to.be.instanceOf(CreateAtmLambdaAction);
    expect(get(action, 'rawAtmLambda')).to.equal(rawAtmLambda);
    expect(get(action, 'atmInventory')).to.equal(atmInventory);
  });

  it('creates ModifyAtmLambdaAction instance', function () {
    const service = this.subject();

    const atmLambda = {};
    const atmLambdaDiff = {};
    const action = service.createModifyAtmLambdaAction({
      atmLambda,
      atmLambdaDiff,
    });

    expect(action).to.be.instanceOf(ModifyAtmLambdaAction);
    expect(get(action, 'atmLambda')).to.equal(atmLambda);
    expect(get(action, 'atmLambdaDiff')).to.equal(atmLambdaDiff);
  });
});
