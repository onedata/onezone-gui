import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { clickTrigger, selectChoose } from '../../../../helpers/ember-power-select';
import sinon from 'sinon';
import $ from 'jquery';

const componentClass = 'inventory-selector';

describe('Integration | Component | modals/apply atm workflow schema dump modal/inventory selector',
  function () {
    setupComponentTest('modals/apply-atm-workflow-schema-dump-modal/inventory-selector', {
      integration: true,
    });

    beforeEach(function () {
      const atmInventories = [{
        name: 'inv1',
      }, {
        name: 'inv0',
      }];
      this.setProperties({
        atmInventories,
        selectedAtmInventory: null,
        onChange: sinon.spy(
          (atmInventory) => this.set('selectedAtmInventory', atmInventory)
        ),
        isDisabled: false,
      });
    });

    it(`has class "${componentClass}"`, async function () {
      await render(this);

      expect(this.$().children()).to.have.class(componentClass)
        .and.to.have.length(1);
    });

    it('has correct placeholder in dropdown', async function () {
      await render(this);

      expect(this.$('.targetAtmInventory-field .dropdown-field-trigger').text().trim())
        .to.equal('Select target inventory...');
    });

    it('shows passed inventories as dropdown options', async function () {
      const atmInventories = this.get('atmInventories');
      await render(this);

      await clickTrigger('.targetAtmInventory-field');

      const $options = $('.ember-power-select-option');
      expect($options).to.have.length(atmInventories.length);
      atmInventories.sortBy('name').forEach(({ name }, idx) =>
        expect($options.eq(idx).text().trim()).to.equal(name)
      );
    });

    it('shows selected inventory', async function () {
      const selectedAtmInventory =
        this.set('selectedAtmInventory', this.get('atmInventories.0'));
      await render(this);

      expect(this.$('.targetAtmInventory-field .dropdown-field-trigger').text().trim())
        .to.equal(selectedAtmInventory.name);
    });

    it('changes selected inventory', async function () {
      const {
        atmInventories,
        onChange,
      } = this.getProperties('atmInventories', 'onChange');
      this.set('selectedAtmInventory', atmInventories[0]);
      await render(this);
      expect(onChange).to.be.not.called;

      await selectChoose('.targetAtmInventory-field', atmInventories[1].name);

      expect(onChange).to.be.calledOnce
        .and.to.be.calledWith(atmInventories[1]);
      expect(this.$('.targetAtmInventory-field .dropdown-field-trigger').text().trim())
        .to.equal(atmInventories[1].name);
    });

    it('disables controls when isDisabled is true', async function () {
      this.set('isDisabled', true);

      await render(this);

      expect(this.$('.targetAtmInventory-field .dropdown-field-trigger'))
        .to.have.attr('aria-disabled');
    });
  });

async function render(testCase) {
  testCase.render(hbs `{{modals/apply-atm-workflow-schema-dump-modal/inventory-selector
    atmInventories=atmInventories
    selectedAtmInventory=selectedAtmInventory
    onChange=onChange
    isDisabled=isDisabled
  }}`);
  await wait();
}
