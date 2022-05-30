import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import EmberPowerSelectHelper from '../../../helpers/ember-power-select-helper';
import $ from 'jquery';
import { get } from '@ember/object';

const possibleTargetModels = [{
  modelName: 'all',
  name: 'All',
  icon: '',
}, {
  modelName: 'atmInventory',
  name: 'Atm. inventory',
  icon: 'atm-inventory',
}, {
  modelName: 'cluster',
  name: 'Cluster',
  icon: 'cluster',
}, {
  modelName: 'group',
  name: 'Group',
  icon: 'group',
}, {
  modelName: 'harvester',
  name: 'Harvester',
  icon: 'light-bulb',
}, {
  modelName: 'space',
  name: 'Space',
  icon: 'space',
}, {
  modelName: 'user',
  name: 'User',
  icon: 'user',
}];

describe('Integration | Component | sidebar tokens/advanced filters', function () {
  setupRenderingTest();

  beforeEach(function () {
    const tokensCollection = possibleTargetModels
      .mapBy('modelName')
      .without('all')
      .reduce((collection, modelName) => collection.concat([
        createTokenStub(modelName, 1),
        createTokenStub(modelName, 2),
      ]), []);
    this.set('tokensCollection', tokensCollection);
  });

  it('has class "advanced-token-filters"', async function () {
    await render(hbs `{{sidebar-tokens/advanced-filters}}`);

    expect(this.$('.advanced-token-filters')).to.exist;
  });

  it('shows "type" filter', async function () {
    await render(hbs `{{sidebar-tokens/advanced-filters}}`);

    const $typeFilterRow = this.$('.type-filter-row');
    expect($typeFilterRow).to.exist;
    expect($typeFilterRow.find('.filter-label').text().trim()).to.equal('Type:');
    expect($typeFilterRow.find('.btn-all').text().trim()).to.equal('All');
    expect($typeFilterRow.find('.btn-access').text().trim()).to.equal('Access');
    expect($typeFilterRow.find('.btn-identity').text().trim()).to.equal('Identity');
    expect($typeFilterRow.find('.btn-invite').text().trim()).to.equal('Invite');
  });

  it('uses "All" as a default value of "type" filter', async function () {
    await render(hbs `{{sidebar-tokens/advanced-filters}}`);

    const $typeFilterRow = this.$('.type-filter-row');
    expect($typeFilterRow.find('.btn-all')).to.have.class('active');
    expect($typeFilterRow.find('.btn-access')).to.not.have.class('active');
    expect($typeFilterRow.find('.btn-identity')).to.not.have.class('active');
    expect($typeFilterRow.find('.btn-invite')).to.not.have.class('active');
  });

  it('notifies about filters state on initial render', async function () {
    const changeSpy = sinon.spy();
    this.set('change', changeSpy);

    await render(hbs `
      {{sidebar-tokens/advanced-filters onChange=(action change)}}
    `);

    expect(changeSpy).to.be.calledOnce;
    expect(changeSpy).to.be.calledWith({
      type: 'all',
      targetModelName: 'all',
      targetRecord: null,
    });
  });

  it('notifies about filters state after type filter change', async function () {
    const changeSpy = sinon.spy();
    this.set('change', changeSpy);

    await render(hbs `
      {{sidebar-tokens/advanced-filters onChange=(action change)}}
    `);

    for (const type of ['access', 'identity', 'invite', 'all']) {
      await selectType(type);
      expect(changeSpy.lastCall).to.be.calledWith({
        type,
        targetModelName: 'all',
        targetRecord: null,
      });
    }
  });

  it('shows target filter when type filter equals "invite"', async function () {
    await render(hbs `{{sidebar-tokens/advanced-filters}}`);

    await selectType('invite');
    const $targetFilterRow =
      this.$('.target-filter-row-collapse.in .target-filter-row');
    expect($targetFilterRow).to.exist;
    expect($targetFilterRow.find('.filter-label').text().trim())
      .to.equal('Target:');
    expect($targetFilterRow.find('.target-model-filter')).to.exist;
    expect($targetFilterRow.find('.target-record-filter')).to.exist;
  });

  [
    'all',
    'access',
    'identity',
  ].forEach(type => {
    it(
      `does not show target filter when type filter equals "${type}"`,
      async function () {
        await render(hbs `{{sidebar-tokens/advanced-filters}}`);

        await selectType(type);
        expect(this.$('.target-filter-row-collapse')).to.not.have.class('in');
      }
    );
  });

  it('shows possible target models according to passed tokens', async function () {
    await render(hbs `
      {{sidebar-tokens/advanced-filters collection=tokensCollection}}
    `);

    const targetModelHelper = new TargetModelHelper();
    await selectType('invite');
    await targetModelHelper.open();
    possibleTargetModels.forEach(({ name, icon }, index) => {
      const $item = $(targetModelHelper.getNthOption(index + 1));
      expect($item).to.exist;
      expect($item.find('.model-name').text().trim()).to.equal(name);
      if (icon) {
        expect($item.find('.model-icon')).to.have.class(
          `oneicon-${icon}`);
      }
    });
  });

  it('notifies about filters state after target model filter change', async function () {
    const changeSpy = sinon.spy();
    this.set('change', changeSpy);
    let optionsToCheck = possibleTargetModels
      .map((option, i) => Object.assign({ optionIndex: i + 1 }, option));
    // Need to move "All" model to the end, because it is a preselected option and
    // cannot be choosen again at the beginning.
    optionsToCheck =
      optionsToCheck.without(optionsToCheck[0]).concat([optionsToCheck[0]]);

    await render(hbs `
      {{sidebar-tokens/advanced-filters
        collection=tokensCollection
        onChange=(action change)}}
    `);

    const targetModelHelper = new TargetModelHelper();
    await selectType('invite');
    for (const { modelName, optionIndex } of optionsToCheck) {
      await targetModelHelper.selectOption(optionIndex);
      expect(changeSpy.lastCall).to.be.calledWith({
        type: 'invite',
        targetModelName: modelName,
        targetRecord: null,
      });
    }
  });

  it('disables target record filter when target model is set to "All"', async function () {
    await render(hbs `
      {{sidebar-tokens/advanced-filters collection=tokensCollection}}
    `);

    await selectType('invite');
    expect(this.$('.target-record-filter .ember-power-select-trigger'))
      .to.have.attr('aria-disabled');
  });

  it(
    'enables target record filter when target model is set to item different than "All"',
    async function () {
      await render(hbs `
        {{sidebar-tokens/advanced-filters collection=tokensCollection}}
      `);

      const targetModelHelper = new TargetModelHelper();
      await selectType('invite');
      await targetModelHelper.selectOption(2);
      expect(this.$('.target-record-filter .ember-power-select-trigger'))
        .to.not.have.attr('aria-disabled');
    }
  );

  possibleTargetModels.slice(1).forEach(({ name, modelName }, index) => {
    it(
      `renders "All" and two records in target record filter when target model is set to "${name}"`,
      async function () {
        await render(hbs `
          {{sidebar-tokens/advanced-filters collection=tokensCollection}}
        `);

        const targetModelHelper = new TargetModelHelper();
        const targetRecordHelper = new TargetRecordHelper();
        await selectType('invite');
        await targetModelHelper.selectOption(index + 2);
        await targetRecordHelper.open();
        const $allItem = $(targetRecordHelper.getNthOption(1));
        const $firstRecordItem = $(targetRecordHelper.getNthOption(2));
        const $secondRecordItem = $(targetRecordHelper.getNthOption(3));

        expect($allItem.text().trim()).to.equal('All');
        expect($firstRecordItem.text().trim()).to.equal(`${modelName}1`);
        expect($secondRecordItem.text().trim()).to.equal(`${modelName}2`);
      }
    );
  });

  it('notifies about filters state after target record filter change', async function () {
    const changeSpy = sinon.spy();
    this.set('change', changeSpy);
    const clusterRecords = this.get('tokensCollection')
      .filterBy('targetModelName', 'cluster')
      .mapBy('tokenTarget');

    await render(hbs `
      {{sidebar-tokens/advanced-filters
        collection=tokensCollection
        onChange=(action change)}}
    `);

    const targetModelHelper = new TargetModelHelper();
    const targetRecordHelper = new TargetRecordHelper();
    await selectType('invite');
    await targetModelHelper.selectOption(3);
    await targetRecordHelper.selectOption(2);
    expect(changeSpy.lastCall).to.be.calledWith({
      type: 'invite',
      targetModelName: 'cluster',
      targetRecord: clusterRecords[0],
    });
    await targetRecordHelper.selectOption(1);
    expect(changeSpy.lastCall).to.be.calledWith({
      type: 'invite',
      targetModelName: 'cluster',
      targetRecord: null,
    });
  });

  it('removes duplicated records from target record filter dropdown', async function () {
    const tokenTarget = {
      name: 'cluster1',
    };
    this.set('tokensCollection', [
      Object.assign(createTokenStub('cluster', 1), { tokenTarget }),
      Object.assign(createTokenStub('cluster', 1), { tokenTarget }),
    ]);

    await render(hbs `
      {{sidebar-tokens/advanced-filters collection=tokensCollection}}
    `);

    const targetModelHelper = new TargetModelHelper();
    const targetRecordHelper = new TargetRecordHelper();
    await selectType('invite');
    await targetModelHelper.selectOption(2);
    await targetRecordHelper.open();
    const $allItem = $(targetRecordHelper.getNthOption(1));
    const $clusterItem = $(targetRecordHelper.getNthOption(2));
    const $nonExistingItem = $(targetRecordHelper.getNthOption(3));

    expect($allItem.text().trim()).to.equal('All');
    expect($clusterItem.text().trim()).to.equal('cluster1');
    expect($nonExistingItem).to.not.exist;
  });

  it('resets target record filter to "All" on target model filter change', async function () {
    const changeSpy = sinon.spy();
    this.set('change', changeSpy);

    await render(hbs `
      {{sidebar-tokens/advanced-filters
        collection=tokensCollection
        onChange=(action change)}}
    `);

    const targetModelHelper = new TargetModelHelper();
    const targetRecordHelper = new TargetRecordHelper();
    await selectType('invite');
    await targetModelHelper.selectOption(3);
    await targetRecordHelper.selectOption(2);
    await targetModelHelper.selectOption(4);
    expect(changeSpy.lastCall).to.be.calledWith({
      type: 'invite',
      targetModelName: 'group',
      targetRecord: null,
    });
  });

  it(
    'does not change selected target record if refreshed list of tokens still has selected record',
    async function () {
      const changeSpy = sinon.spy();
      this.set('change', changeSpy);

      await render(hbs `
        {{sidebar-tokens/advanced-filters
          collection=tokensCollection
          onChange=(action change)}}
      `);

      const targetModelHelper = new TargetModelHelper();
      const targetRecordHelper = new TargetRecordHelper();
      await selectType('invite');
      await targetModelHelper.selectOption(3);
      await targetRecordHelper.selectOption(2);
      const changesCount = changeSpy.callCount;
      this.set(
        'tokensCollection',
        this.get('tokensCollection').filter(token =>
          get(token, 'tokenTarget.name') !== 'cluster2'
        )
      );
      await settled();
      await targetRecordHelper.open();
      expect(changeSpy).to.have.callCount(changesCount);
      expect($(targetRecordHelper.getTrigger()).text()).to.contain('cluster1');
      expect(targetRecordHelper.getNthOption(3)).to.be.null;
    }
  );

  it(
    'changes selected target record to "All" if refreshed list of tokens does not have selected record',
    async function () {
      const changeSpy = sinon.spy();
      this.set('change', changeSpy);

      await render(hbs `
        {{sidebar-tokens/advanced-filters
          collection=tokensCollection
          onChange=(action change)}}
      `);

      const targetModelHelper = new TargetModelHelper();
      const targetRecordHelper = new TargetRecordHelper();
      await selectType('invite');
      await targetModelHelper.selectOption(3);
      await targetRecordHelper.selectOption(2);
      const changesCount = changeSpy.callCount;
      this.set(
        'tokensCollection',
        this.get('tokensCollection').filter(token =>
          get(token, 'tokenTarget.name') !== 'cluster1'
        )
      );
      await settled();
      await targetRecordHelper.open();
      expect(changeSpy).to.have.callCount(changesCount + 1);
      expect($(targetRecordHelper.getTrigger()).text()).to.contain('All');
      expect(targetRecordHelper.getNthOption(3)).to.be.null;
      expect(changeSpy.lastCall).to.be.calledWith({
        type: 'invite',
        targetModelName: 'cluster',
        targetRecord: null,
      });
    }
  );

  it(
    'changes selected target model and record to "All" if refreshed list of tokens does not have selected model',
    async function () {
      const changeSpy = sinon.spy();
      this.set('change', changeSpy);

      await render(hbs `
        {{sidebar-tokens/advanced-filters
          collection=tokensCollection
          onChange=(action change)}}
      `);

      const targetModelHelper = new TargetModelHelper();
      const targetRecordHelper = new TargetRecordHelper();
      await selectType('invite');
      await targetModelHelper.selectOption(3);
      await targetRecordHelper.selectOption(2);
      const changesCount = changeSpy.callCount;
      this.set(
        'tokensCollection',
        this.get('tokensCollection').rejectBy('targetModelName', 'cluster')
      );
      await settled();
      expect(changeSpy).to.have.callCount(changesCount + 1);
      expect($(targetModelHelper.getTrigger()).text()).to.contain('All');
      expect($(targetRecordHelper.getTrigger()).text()).to.contain('All');
      expect(changeSpy.lastCall).to.be.calledWith({
        type: 'invite',
        targetModelName: 'all',
        targetRecord: null,
      });
    }
  );
});

class TargetModelHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.target-model-filter');
  }
}

class TargetRecordHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.target-record-filter');
  }
}

function createTokenStub(modelName, idx) {
  return {
    targetModelName: modelName,
    tokenTarget: {
      name: `${modelName}${idx}`,
    },
  };
}

function selectType(type) {
  return click(`.btn-${type}`);
}
