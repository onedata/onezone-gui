import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';
import { fillIn, click } from 'ember-native-dom-helpers';

describe('Integration | Component | content atm inventories new', function () {
  setupComponentTest('content-atm-inventories-new', {
    integration: true,
  });

  it('has class "content-atm-inventories-new', function () {
    this.render(hbs `{{content-atm-inventories-new}}`);

    expect(this.$('.content-atm-inventories-new')).to.exist;
  });

  it('does not allow to create new automation inventory when name is empty',
    async function () {
      this.render(hbs `{{content-atm-inventories-new}}`);

      await fillIn('.new-atm-inventory-name', '');

      expect(this.$('.btn-primary')).to.have.attr('disabled');
    });

  it('allows to create new automation inventory', async function () {
    const executeStub = sinon.stub().resolves();
    const createCreateAtmInventoryActionStub = sinon.stub(
      lookupService(this, 'workflow-actions'),
      'createCreateAtmInventoryAction'
    ).callsFake(() => ({ execute: executeStub }));
    this.render(hbs `{{content-atm-inventories-new}}`);

    await fillIn('.new-atm-inventory-name', 'someName');
    await click('.btn-primary');

    expect(createCreateAtmInventoryActionStub).to.be.calledOnce
      .and.to.be.calledWith({
        rawAtmInventory: {
          name: 'someName',
        },
      });
    expect(executeStub).to.be.calledOnce;
  });
});
