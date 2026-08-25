import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, settled, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { selectChoose, clickTrigger } from 'ember-power-select/test-support/helpers';
import { get } from '@ember/object';
import { clearStoreAfterEach } from '../../../helpers/clear-store';
import { lookupService } from '../../../helpers/stub-service';
import { classify } from '@ember/string';
import { all as allFulfilled } from 'rsvp';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';

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
}];

describe('Integration | Component | sidebar-tokens/advanced-filters', function () {
  const { afterEach } = setupRenderingTest();

  beforeEach(async function () {
    this.tokenHelper = new TokenHelper(this);
    const modelNames = possibleTargetModels
      .map(targetModel => targetModel.modelName)
      .filter(modelName => modelName !== 'all');
    const tokensPromises = modelNames.map(modelName => [
      this.tokenHelper.createInviteToken(modelName, 1),
      this.tokenHelper.createInviteToken(modelName, 2),
    ]).flat();
    const tokens = await allFulfilled(tokensPromises);
    this.set('tokensCollection', tokens);
  });

  clearStoreAfterEach(afterEach);

  it('has class "advanced-token-filters"', async function () {
    await render(hbs `<SidebarTokens::AdvancedFilters />`);

    expect(find('.advanced-token-filters')).to.exist;
  });

  it('shows "type" filter', async function () {
    await render(hbs `<SidebarTokens::AdvancedFilters />`);

    const typeFilterRow = find('.type-filter-row');
    expect(typeFilterRow).to.exist;
    expect(typeFilterRow.querySelector('.filter-label')).to.have.trimmed.text('Type:');
    expect(typeFilterRow.querySelector('.btn-all')).to.have.trimmed.text('All');
    expect(typeFilterRow.querySelector('.btn-access')).to.have.trimmed.text('Access');
    expect(typeFilterRow.querySelector('.btn-identity')).to.have.trimmed.text('Identity');
    expect(typeFilterRow.querySelector('.btn-invite')).to.have.trimmed.text('Invite');
  });

  it('uses "All" as a default value of "type" filter', async function () {
    await render(hbs `<SidebarTokens::AdvancedFilters />`);

    const typeFilterRow = find('.type-filter-row');
    expect(typeFilterRow.querySelector('.btn-all')).to.have.class('active');
    expect(typeFilterRow.querySelector('.btn-access')).to.not.have.class('active');
    expect(typeFilterRow.querySelector('.btn-identity')).to.not.have.class('active');
    expect(typeFilterRow.querySelector('.btn-invite')).to.not.have.class('active');
  });

  it('notifies about filters state on initial render', async function () {
    const changeSpy = sinon.spy();
    this.set('change', changeSpy);

    await render(hbs `
      <SidebarTokens::AdvancedFilters @onChange={{action change}} />
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
      <SidebarTokens::AdvancedFilters @onChange={{action change}} />
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
    await render(hbs `<SidebarTokens::AdvancedFilters />`);

    await selectType('invite');
    const targetFilterRow =
      find('.target-filter-row-collapse.in .target-filter-row');
    expect(targetFilterRow).to.exist;
    expect(targetFilterRow.querySelector('.filter-label'))
      .to.have.trimmed.text('Target:');
    expect(targetFilterRow.querySelector('.target-model-filter')).to.exist;
    expect(targetFilterRow.querySelector('.target-record-filter')).to.exist;
  });

  [
    'all',
    'access',
    'identity',
  ].forEach(type => {
    it(
      `does not show target filter when type filter equals "${type}"`,
      async function () {
        await render(hbs `<SidebarTokens::AdvancedFilters />`);

        await selectType(type);
        expect(find('.target-filter-row-collapse')).to.not.have.class('in');
      }
    );
  });

  it('shows possible target models according to passed tokens', async function () {
    await render(hbs `
      <SidebarTokens::AdvancedFilters @collection={{this.tokensCollection}} />
    `);

    await selectType('invite');
    await clickTrigger('.target-model-filter');
    const options = findAll('.ember-power-select-option');
    possibleTargetModels.forEach(({ name, icon }, index) => {
      const item = options[index];
      expect(item, `item for ${name}`).to.exist;
      expect(item.querySelector('.model-name')).to.have.trimmed.text(name);
      if (icon) {
        expect(item.querySelector('.model-icon'))
          .to.have.class(`oneicon-${icon}`);
      }
    });
  });

  it('notifies about filters state after target model filter change', async function () {
    const changeSpy = sinon.spy();
    this.set('change', changeSpy);
    // Need to move "All" model to the end, because it is a preselected option and
    // cannot be choosen again at the beginning.
    const optionsToCheck = possibleTargetModels
      .without(possibleTargetModels[0])
      .concat([possibleTargetModels[0]]);

    await render(hbs `
      <SidebarTokens::AdvancedFilters
        @collection={{tokensCollection}}
        @onChange={{action change}}
      />
    `);

    await selectType('invite');
    for (const { modelName, name } of optionsToCheck) {
      await selectChoose('.target-model-filter', name);
      expect(changeSpy.lastCall).to.be.calledWith({
        type: 'invite',
        targetModelName: modelName,
        targetRecord: null,
      });
    }
  });

  it('disables target record filter when target model is set to "All"', async function () {
    await render(hbs `
      <SidebarTokens::AdvancedFilters @collection={{tokensCollection}} />
    `);

    await selectType('invite');
    expect(find('.target-record-filter .ember-power-select-trigger'))
      .to.have.attr('aria-disabled');
  });

  it('enables target record filter when target model is set to item different than "All"',
    async function () {
      await render(hbs `
        <SidebarTokens::AdvancedFilters @collection={{tokensCollection}} />
      `);

      await selectType('invite');
      await selectChoose('.target-model-filter', 'Cluster');
      expect(find('.target-record-filter .ember-power-select-trigger'))
        .to.not.have.attr('aria-disabled');
    }
  );

  possibleTargetModels.slice(1).forEach(({ name, modelName }) => {
    it(
      `renders "All" and two records in target record filter when target model is set to "${name}"`,
      async function () {
        await render(hbs `
          <SidebarTokens::AdvancedFilters @collection={{tokensCollection}} />
        `);
        await selectType('invite');
        await selectChoose('.target-model-filter', name);
        await clickTrigger('.target-record-filter');
        const [
          allItem,
          firstRecordItem,
          secondRecordItem,
        ] = findAll('.ember-power-select-option');

        expect(allItem).to.have.trimmed.text('All');
        expect(firstRecordItem).to.have.trimmed.text(`${modelName}1`);
        expect(secondRecordItem).to.have.trimmed.text(`${modelName}2`);
      }
    );
  });

  it('notifies about filters state after target record filter change', async function () {
    const changeSpy = sinon.spy();
    this.set('change', changeSpy);

    await render(hbs `
      <SidebarTokens::AdvancedFilters
        @collection={{this.tokensCollection}}
        @onChange={{action this.change}}
      />
    `);
    await selectType('invite');
    await selectChoose('.target-model-filter', 'Cluster');
    await selectChoose('.target-record-filter', 'cluster1');
    const clusterRecords = this.get('tokensCollection')
      .filterBy('targetModelName', 'cluster')
      .mapBy('tokenTarget');
    expect(changeSpy.lastCall).to.be.calledWith({
      type: 'invite',
      targetModelName: 'cluster',
      targetRecord: clusterRecords[0],
    });
    await selectChoose('.target-record-filter', 'All');
    expect(changeSpy.lastCall).to.be.calledWith({
      type: 'invite',
      targetModelName: 'cluster',
      targetRecord: null,
    });
  });

  it('allows selecting an inaccessible target record', async function () {
    const inaccessibleSpaceId = 'inaccessible-space';
    const inaccessibleSpaceToken = await this.tokenHelper.createToken({
      type: {
        inviteToken: {
          inviteType: 'userJoinSpace',
          spaceId: inaccessibleSpaceId,
        },
      },
    });
    const changeSpy = sinon.spy();
    this.setProperties({
      change: changeSpy,
      tokensCollection: [inaccessibleSpaceToken],
    });

    await render(hbs `
      <SidebarTokens::AdvancedFilters
        @collection={{this.tokensCollection}}
        @onChange={{action change}}
      />
    `);

    await selectType('invite');
    await selectChoose('.target-model-filter', 'Space');
    await settled();
    await waitForRender();
    await selectChoose('.target-record-filter', inaccessibleSpaceId);

    expect(changeSpy.lastCall).to.be.calledWith({
      type: 'invite',
      targetModelName: 'space',
      targetRecord: { entityId: inaccessibleSpaceId, onlyId: true },
    });
  });

  it('removes duplicated records from target record filter dropdown', async function () {
    const targetModelName = 'cluster';
    const target =
      await this.tokenHelper.createTokenTarget(targetModelName, { name: 'cluster1' });
    const token1 = await this.tokenHelper.createInviteToken('cluster', 1, target);
    const token2 = await this.tokenHelper.createInviteToken('cluster', 2, target);
    this.set('tokensCollection', [
      token1,
      token2,
    ]);

    await render(hbs `
      <SidebarTokens::AdvancedFilters @collection={{this.tokensCollection}} />
    `);

    await selectType('invite');
    await selectChoose('.target-model-filter', 'Cluster');
    await clickTrigger('.target-record-filter');
    const [
      allItem,
      clusterItem,
      nonExistingItem,
    ] = findAll('.ember-power-select-option');

    expect(allItem).to.have.trimmed.text('All');
    expect(clusterItem).to.have.trimmed.text('cluster1');
    expect(nonExistingItem).to.not.exist;
  });

  it('resets target record filter to "All" on target model filter change', async function () {
    const changeSpy = sinon.spy();
    this.set('change', changeSpy);

    await render(hbs `
      <SidebarTokens::AdvancedFilters
        @collection={{tokensCollection}}
        @onChange={{action change}}
      />
    `);

    await selectType('invite');
    await selectChoose('.target-model-filter', 'Cluster');
    await selectChoose('.target-record-filter', 'cluster1');
    await selectChoose('.target-model-filter', 'Group');
    expect(changeSpy.lastCall).to.be.calledWith({
      type: 'invite',
      targetModelName: 'group',
      targetRecord: null,
    });
  });

  it('preserves selected target record if refreshed list of tokens still has selected record',
    async function () {
      await render(hbs `
        <SidebarTokens::AdvancedFilters @collection={{this.tokensCollection}} />
      `);

      await selectType('invite');
      await selectChoose('.target-model-filter', 'Cluster');
      await selectChoose('.target-record-filter', 'cluster1');
      this.set(
        'tokensCollection',
        this.get('tokensCollection').filter(it => it.tokenTarget?.name !== 'cluster2')
      );
      await settled();
      await waitForRender();
      await clickTrigger('.target-record-filter');
      const options = findAll('.ember-power-select-option');
      expect(find('.target-record-filter .ember-basic-dropdown-trigger'))
        .to.contain.text('cluster1');
      expect(options).to.have.length(2);
    }
  );

  it('changes selected target record to "All" if refreshed list of tokens does not have selected record',
    async function () {
      const changeSpy = sinon.spy();
      this.set('change', changeSpy);

      await render(hbs `
        <SidebarTokens::AdvancedFilters
          @collection={{tokensCollection}}
          @onChange={{action change}}
        />
      `);

      await selectType('invite');
      await selectChoose('.target-model-filter', 'Cluster');
      await selectChoose('.target-record-filter', 'cluster1');
      this.set(
        'tokensCollection',
        this.get('tokensCollection').filter(token =>
          get(token, 'tokenTarget.name') !== 'cluster1'
        )
      );
      await settled();
      await waitForRender();
      await clickTrigger('.target-record-filter');
      const options = findAll('.ember-power-select-option');
      expect(find('.target-record-filter .ember-basic-dropdown-trigger'))
        .to.contain.text('All');
      expect(options).to.have.length(2);
      expect(changeSpy.lastCall).to.be.calledWith({
        type: 'invite',
        targetModelName: 'cluster',
        targetRecord: null,
      });
    }
  );

  it('changes selected target model and record to "All" if refreshed list of tokens does not have selected model',
    async function () {
      const changeSpy = sinon.spy();
      this.set('change', changeSpy);

      await render(hbs `
        <SidebarTokens::AdvancedFilters
          @collection={{tokensCollection}}
          @onChange={{action change}}
        />
      `);

      await selectType('invite');
      await selectChoose('.target-model-filter', 'Cluster');
      await selectChoose('.target-record-filter', 'cluster1');
      const changesCount = changeSpy.callCount;
      this.set(
        'tokensCollection',
        this.get('tokensCollection').rejectBy('targetModelName', 'cluster')
      );
      await settled();
      expect(changeSpy).to.have.callCount(changesCount + 1);
      expect(find('.target-model-filter .ember-basic-dropdown-trigger'))
        .to.contain.text('All');
      expect(find('.target-record-filter .ember-basic-dropdown-trigger'))
        .to.contain.text('All');
      expect(changeSpy.lastCall).to.be.calledWith({
        type: 'invite',
        targetModelName: 'all',
        targetRecord: null,
      });
    }
  );
});

function selectType(type) {
  return click(`.btn-${type}`);
}

class TokenHelper {
  constructor(mochaContext) {
    this.mochaContext = mochaContext;
    this.store = lookupService(this.mochaContext, 'store');
  }
  async createInviteToken(targetModelName, targetIndex, customTargetRecord) {
    const targetRecord = customTargetRecord ??
      await this.createTokenTarget(targetModelName, {
        name: `${targetModelName}${targetIndex}`,
      });
    return await this.createToken({
      type: {
        inviteToken: {
          inviteType: `userJoin${classify(targetModelName)}`,
          [`${targetModelName}Id`]: targetRecord.entityId,
        },
      },
    });
  }
  async createTokenTarget(targetModelName, data) {
    return await this.store.createRecord(targetModelName, data).save();
  }
  async createToken(data) {
    return await this.store.createRecord('token', data).save();
  }
}
