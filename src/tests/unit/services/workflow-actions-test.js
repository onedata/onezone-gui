import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import ModifyAtmInventoryAction from 'onezone-gui/utils/workflow-actions/modify-atm-inventory-action';
import RemoveAtmInventoryAction from 'onezone-gui/utils/workflow-actions/remove-atm-inventory-action';
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
});
