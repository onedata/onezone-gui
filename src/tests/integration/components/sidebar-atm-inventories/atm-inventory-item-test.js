import { expect } from 'chai';
import {
  describe,
  it,
  before,
  beforeEach,
  afterEach,
} from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ModifyAtmInventoryAction from 'onezone-gui/utils/workflow-actions/modify-atm-inventory-action';
import RemoveAtmInventoryAction from 'onezone-gui/utils/workflow-actions/remove-atm-inventory-action';
import CopyRecordIdAction from 'onedata-gui-common/utils/clipboard-actions/copy-record-id-action';
import sinon from 'sinon';
import { resolve } from 'rsvp';

describe(
  'Integration | Component | sidebar atm inventories/atm inventory item',
  function () {
    setupRenderingTest();

    before(function () {
      // Instatiate Action class to make its `prototype.execute` available for
      // mocking.
      ModifyAtmInventoryAction.create();
      RemoveAtmInventoryAction.create();
      CopyRecordIdAction.create();
    });

    beforeEach(function () {
      this.set('atmInventory', {
        constructor: {
          modelName: 'atm-inventory',
        },
        name: 'inventory1',
      });
    });

    afterEach(function () {
      // Reset stubbed actions
      [
        ModifyAtmInventoryAction,
        RemoveAtmInventoryAction,
        CopyRecordIdAction,
      ].forEach(action => {
        if (action.prototype.execute.restore) {
          action.prototype.execute.restore();
        }
      });
    });

    it('renders automation inventory name, icon and menu trigger', async function () {
      await renderComponent();

      expect(this.element).to.contain.text(this.get('atmInventory.name'));
      // TODO VFS-7455 change icon
      expect(find('.oneicon-atm-inventory')).to.exist;
      expect(find('.collapsible-toolbar-toggle')).to.exist;
    });

    it('renders actions in dots menu', async function () {
      await renderComponent();

      await click('.atm-inventory-menu-trigger');

      const popoverContent = document.querySelector('body .webui-popover.in');
      [{
        selector: '.rename-atm-inventory-action-trigger',
        name: 'Rename',
        icon: 'rename',
      }, {
        selector: '.leave-atm-inventory-action-trigger',
        name: 'Leave',
        icon: 'group-leave-group',
      }, {
        selector: '.remove-atm-inventory-action-trigger',
        name: 'Remove',
        icon: 'remove',
      }, {
        selector: '.copy-record-id-action-trigger',
        name: 'Copy ID',
        icon: 'copy',
      }].forEach(({ selector, name, icon }) => {
        const trigger = popoverContent.querySelector(selector);
        expect(trigger).to.exist;
        expect(trigger).to.contain.text(name);
        expect(trigger.querySelector('.one-icon')).to.have.class(`oneicon-${icon}`);
      });
    });

    it('allows to rename automation inventory through "Rename" action',
      async function () {
        const atmInventory = this.get('atmInventory');
        const executeStub = sinon.stub(
          ModifyAtmInventoryAction.prototype,
          'execute'
        ).callsFake(function () {
          expect(this.get('context.atmInventory'))
            .to.equal(atmInventory);
          expect(this.get('context.atmInventoryDiff'))
            .to.deep.equal({ name: 'newName' });
          return resolve({ status: 'done' });
        });

        await renderComponent();
        await click('.atm-inventory-menu-trigger');
        const renameTrigger = document.querySelector(
          '.webui-popover.in .rename-atm-inventory-action-trigger'
        );
        await click(renameTrigger);
        await fillIn('.atm-inventory-name .form-control', 'newName');
        await click('.atm-inventory-name .save-icon');

        const atmInventoryNameNode = find('.atm-inventory-name');
        expect(atmInventoryNameNode).to.not.have.class('editor');
        expect(executeStub).to.be.calledOnce;
      });

    it('allows to remove automation inventory through "Remove" action',
      async function () {
        const atmInventory = this.get('atmInventory');
        const executeStub = sinon.stub(
          RemoveAtmInventoryAction.prototype,
          'execute'
        ).callsFake(function () {
          expect(this.get('context.atmInventory'))
            .to.equal(atmInventory);
        });

        await renderComponent();
        await click('.atm-inventory-menu-trigger');
        const removeTrigger = document.querySelector(
          '.webui-popover.in .remove-atm-inventory-action-trigger'
        );
        await click(removeTrigger);

        expect(executeStub).to.be.calledOnce;
      });

    it('allows to copy automation inventory ID through "Copy ID" action',
      async function () {
        const atmInventory = this.get('atmInventory');
        const executeStub = sinon.stub(
          CopyRecordIdAction.prototype,
          'execute'
        ).callsFake(function () {
          expect(this.get('context.record')).to.equal(atmInventory);
        });

        await renderComponent();
        await click('.atm-inventory-menu-trigger');
        const removeTrigger = document.querySelector(
          'body .webui-popover.in .copy-record-id-action-trigger'
        );
        await click(removeTrigger);

        expect(executeStub).to.be.calledOnce;
      });
  }
);

async function renderComponent() {
  await render(hbs `
    {{sidebar-atm-inventories/atm-inventory-item item=atmInventory}}
  `);
}
