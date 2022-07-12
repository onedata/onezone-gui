import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, fillIn, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';

describe('Integration | Component | content atm inventories new', function () {
  setupRenderingTest();

  it('has class "content-atm-inventories-new', async function () {
    await render(hbs `{{content-atm-inventories-new}}`);

    expect(this.element.children[0]).to.have.class('content-atm-inventories-new');
  });

  it('does not allow to create new automation inventory when name is empty',
    async function () {
      await render(hbs `{{content-atm-inventories-new}}`);

      await fillIn('.new-atm-inventory-name', '');

      expect(find('.btn-primary')).to.have.attr('disabled');
    });

  it('allows to create new automation inventory', async function () {
    const executeStub = sinon.stub().resolves();
    const createCreateAtmInventoryActionStub = sinon.stub(
      lookupService(this, 'workflow-actions'),
      'createCreateAtmInventoryAction'
    ).callsFake(() => ({ execute: executeStub }));
    await render(hbs `{{content-atm-inventories-new}}`);

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
