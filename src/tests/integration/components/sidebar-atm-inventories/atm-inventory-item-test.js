import { expect } from 'chai';
import { describe, it, before, beforeEach, afterEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import ModifyAtmInventoryAction from 'onezone-gui/utils/workflow-actions/modify-atm-inventory-action';
import RemoveAtmInventoryAction from 'onezone-gui/utils/workflow-actions/remove-atm-inventory-action';
import CopyRecordIdAction from 'onedata-gui-common/utils/clipboard-actions/copy-record-id-action';
import sinon from 'sinon';
import $ from 'jquery';
import { click, fillIn } from 'ember-native-dom-helpers';
import { resolve } from 'rsvp';

describe(
  'Integration | Component | sidebar atm inventories/atm inventory item',
  function () {
    setupComponentTest('sidebar-atm-inventories/atm-inventory-item', {
      integration: true,
    });

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

    it('renders automation inventory name, icon and menu trigger', function () {
      render(this);

      expect(this.$()).to.contain(this.get('atmInventory.name'));
      // TODO VFS-7455 change icon
      expect(this.$('.oneicon-atm-inventory')).to.exist;
      expect(this.$('.collapsible-toolbar-toggle')).to.exist;
    });

    it('renders actions in dots menu', async function () {
      render(this);

      await click('.atm-inventory-menu-trigger');

      const popoverContent = $('body .webui-popover.in');
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
        name: 'Copy automation inventory ID',
        icon: 'copy',
      }].forEach(({ selector, name, icon }) => {
        const $trigger = popoverContent.find(selector);
        expect($trigger).to.exist;
        expect($trigger).to.contain(name);
        expect($trigger.find('.one-icon')).to.have.class(`oneicon-${icon}`);
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

        render(this);
        await click('.atm-inventory-menu-trigger');
        const renameTrigger =
          $('body .webui-popover.in .rename-atm-inventory-action-trigger')[0];
        await click(renameTrigger);
        await fillIn('.atm-inventory-name .form-control', 'newName');
        await click('.atm-inventory-name .save-icon');

        const $atmInventoryNameNode = this.$('.atm-inventory-name');
        expect($atmInventoryNameNode).to.not.have.class('editor');
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

        render(this);
        await click('.atm-inventory-menu-trigger');
        const removeTrigger =
          $('body .webui-popover.in .remove-atm-inventory-action-trigger')[0];
        await click(removeTrigger);

        expect(executeStub).to.be.calledOnce;
      });

    it('allows to copy automation inventory ID through "Copy automation inventory ID" action',
      async function () {
        const atmInventory = this.get('atmInventory');
        const executeStub = sinon.stub(
          CopyRecordIdAction.prototype,
          'execute'
        ).callsFake(function () {
          expect(this.get('context.record')).to.equal(atmInventory);
        });

        render(this);
        await click('.atm-inventory-menu-trigger');
        const removeTrigger =
          $('body .webui-popover.in .copy-record-id-action-trigger')[0];
        await click(removeTrigger);

        expect(executeStub).to.be.calledOnce;
      });
  }
);

function render(testCase) {
  testCase.render(hbs `
    {{sidebar-atm-inventories/atm-inventory-item item=atmInventory}}
  `);
}
