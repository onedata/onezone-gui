// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable no-param-reassign */

import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, fillIn, click, focus, blur, settled, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { selectChoose, clickTrigger } from 'ember-power-select/test-support/helpers';
import OneDatetimePickerHelper from '../../helpers/one-datetime-picker';
import _ from 'lodash';
import { lookupService } from '../../helpers/stub-service';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { resolve, reject, Promise } from 'rsvp';
import moment from 'moment';
import { set } from '@ember/object';
import OneTooltipHelper from '../../helpers/one-tooltip';
import { dasherize, underscore } from '@ember/string';
import { suppressRejections } from '../../helpers/suppress-rejections';
import { findInElementsByText } from '../../helpers/find';

const tokenInviteTypes = [{
  inviteType: 'userJoinGroup',
  label: 'Invite user to group',
  icon: 'group',
  targetModelName: 'group',
  targetPlaceholder: 'Select group...',
  tokenName: /Inv\. usr\. grp\..*/,
  modelNameInPrivileges: 'group',
}, {
  inviteType: 'groupJoinGroup',
  label: 'Invite group to parent group',
  icon: 'group',
  targetModelName: 'group',
  targetPlaceholder: 'Select parent group...',
  tokenName: /Inv\. grp\. grp\..*/,
  modelNameInPrivileges: 'group',
}, {
  inviteType: 'userJoinSpace',
  label: 'Invite user to space',
  icon: 'space',
  targetModelName: 'space',
  targetPlaceholder: 'Select space...',
  tokenName: /Inv\. usr\. spc\..*/,
  modelNameInPrivileges: 'space',
}, {
  inviteType: 'groupJoinSpace',
  label: 'Invite group to space',
  icon: 'space',
  targetModelName: 'space',
  targetPlaceholder: 'Select space...',
  tokenName: /Inv\. grp\. spc\..*/,
  modelNameInPrivileges: 'space',
}, {
  inviteType: 'harvesterJoinSpace',
  label: 'Invite harvester to space',
  icon: 'space',
  targetModelName: 'space',
  targetPlaceholder: 'Select space...',
  noPrivileges: true,
  tokenName: /Inv\. hrv\. spc\..*/,
  modelNameInPrivileges: 'space',
}, {
  inviteType: 'userJoinCluster',
  label: 'Invite user to cluster',
  icon: 'cluster',
  targetModelName: 'cluster',
  targetPlaceholder: 'Select cluster...',
  tokenName: /Inv\. usr\. cls\..*/,
  modelNameInPrivileges: 'cluster',
}, {
  inviteType: 'groupJoinCluster',
  label: 'Invite group to cluster',
  icon: 'cluster',
  targetModelName: 'cluster',
  targetPlaceholder: 'Select cluster...',
  tokenName: /Inv\. grp\. cls\..*/,
  modelNameInPrivileges: 'cluster',
}, {
  inviteType: 'userJoinHarvester',
  label: 'Invite user to harvester',
  icon: 'light-bulb',
  targetModelName: 'harvester',
  targetPlaceholder: 'Select harvester...',
  tokenName: /Inv\. usr\. hrv\..*/,
  modelNameInPrivileges: 'harvester',
}, {
  inviteType: 'groupJoinHarvester',
  label: 'Invite group to harvester',
  icon: 'light-bulb',
  targetModelName: 'harvester',
  targetPlaceholder: 'Select harvester...',
  tokenName: /Inv\. grp\. hrv\..*/,
  modelNameInPrivileges: 'harvester',
}, {
  inviteType: 'spaceJoinHarvester',
  label: 'Invite space to harvester',
  icon: 'light-bulb',
  targetModelName: 'harvester',
  targetPlaceholder: 'Select harvester...',
  noPrivileges: true,
  tokenName: /Inv\. spc\. hrv\..*/,
  modelNameInPrivileges: 'harvester',
}, {
  inviteType: 'userJoinAtmInventory',
  label: 'Invite user to automation inventory',
  icon: 'atm-inventory',
  targetModelName: 'atmInventory',
  targetPlaceholder: 'Select automation inventory...',
  tokenName: /Inv\. usr\. atm\. inv\..*/,
  modelNameInPrivileges: 'inventory',
}, {
  inviteType: 'groupJoinAtmInventory',
  label: 'Invite group to automation inventory',
  icon: 'atm-inventory',
  targetModelName: 'atmInventory',
  targetPlaceholder: 'Select automation inventory...',
  tokenName: /Inv\. grp\. atm\. inv\..*/,
  modelNameInPrivileges: 'inventory',
}, {
  inviteType: 'supportSpace',
  label: 'Support space',
  icon: 'space',
  targetModelName: 'space',
  targetPlaceholder: 'Select space...',
  noPrivileges: true,
  tokenName: /Support space.*/,
}, {
  inviteType: 'registerOneprovider',
  label: 'Register Oneprovider',
  icon: 'provider',
  tokenName: /Register Oneprovider.*/,
}];
const caveats = [{
  name: 'expire',
  label: 'Expiration',
  disabledDescription: 'This token has no time validity limit.',
  tip: 'Limits the token\'s validity in time.',
}, {
  name: 'interface',
  label: 'Interface',
  disabledDescription: 'This token can be used on all system interfaces.',
  tip: 'Limits the available interfaces on which the token can be used to a certain one.',
}, {
  name: 'asn',
  label: 'ASN',
  disabledDescription: 'This token can be utilized from any ASN.',
  tip: 'Limits the ASNs (Autonomous System Number) from which the token can be utilized. The client\'s ASN is resolved based on client\'s IP and MaxMind\'s GeoLite database.',
}, {
  name: 'ip',
  label: 'IP',
  disabledDescription: 'This token does not limit allowed client IPs.',
  tip: 'Limits the allowed client IPs to a certain whitelist (masks are supported).',
}, {
  name: 'region',
  label: 'Region',
  disabledDescription: 'This token can be utilized from any geographical region.',
  tip: 'Limits the geographical regions from which the token can be utilized. The available values are the 7 continents (Oceania covers Australia and the pacific islands) or the EU meta region, which matches member countries of the European Union. The client\'s region is resolved based on client\'s IP and MaxMind\'s GeoLite database.',
}, {
  name: 'country',
  label: 'Country',
  disabledDescription: 'This token can be utilized from any country.',
  tip: 'Limits the countries from which the token can be utilized. Countries list should be provided using two-letter codes (ISO 3166-1 alpha-2). The client\'s country is resolved based on client\'s IP and MaxMind\'s GeoLite database.',
}, {
  name: 'consumer',
  label: 'Consumer',
  disabledDescription: 'This token can be consumed by anyone.',
  tip: 'Limits the consumers that can use the token. Consumer is the token bearer that utilizes the token - performs a request with an access token or attempts to consume an invite token. If the caveat is present, the consumer must prove their identity using an identity token.',
}, {
  name: 'service',
  label: 'Service',
  disabledDescription: 'This token can be used to interact with any service.',
  tip: 'Limits the services that can process the token. Service is the Onedata service that received the client\'s request - e.g. the Oneprovider service chosen by a user to mount a Oneclient or make a CDMI request.',
}, {
  name: 'readonly',
  label: 'Read‐only',
  disabledDescription: 'This token can be used for both reading and writing user files.',
  tip: 'Allows only read access to user files.',
  dontTestValue: true,
}, {
  name: 'path',
  label: 'Path',
  disabledDescription: 'This token does not limit paths in which data can be accessed.',
  tip: 'Limits the paths in which data can be accessed with the token. If a directory path is given, the token allows to access all nested files and directories starting from the specified directory.',
}, {
  name: 'objectId',
  label: 'Object ID',
  disabledDescription: 'This token does not limit object ids in which data can be accessed.',
  tip: 'Limits the object ids in which data can be accessed with the token. The object ids comply with the CDMI format and can be used in the Oneprovider\'s REST and CDMI APIs. If a directory object id is given, the token allows to access all nested files and directories starting from the specified directory.',
}];
const preselectedInviteType = tokenInviteTypes[0];
const regions = [
  { label: 'Africa', value: 'Africa' },
  { label: 'Antarctica', value: 'Antarctica' },
  { label: 'Asia', value: 'Asia' },
  { label: 'Europe', value: 'Europe' },
  { label: 'European Union', value: 'EU' },
  { label: 'North America', value: 'NorthAmerica' },
  { label: 'Oceania', value: 'Oceania' },
  { label: 'South America', value: 'SouthAmerica' },
];

describe('Integration | Component | token editor', function () {
  setupRenderingTest();

  beforeEach(function () {
    const currentUser = {
      entityId: 'currentuser',
      name: 'currentuser',
    };
    const onedataGraphStub =
      sinon.stub(lookupService(this, 'onedata-graph'), 'request');
    const recordManagerService = lookupService(this, 'record-manager');
    sinon.stub(recordManagerService, 'getCurrentUserRecord').returns(currentUser);
    const getUserRecordListStub = sinon.stub(recordManagerService, 'getUserRecordList');
    const getRecordByIdStub = sinon.stub(recordManagerService, 'getRecordById').rejects();
    const mockedRecords = {};
    [
      'user',
      'space',
      'group',
      'harvester',
      'provider',
      'cluster',
      'atmInventory',
    ].forEach(modelName => {
      const viewPrivilege = modelName === 'atmInventory' ?
        'atm_inventory_view' : `${modelName}_view`;
      onedataGraphStub.withArgs({
        gri: `${underscore(modelName)}.null.privileges:private`,
        operation: 'get',
        subscribe: false,
      }).resolves({ member: [viewPrivilege] });
      mockedRecords[modelName] = _.reverse(_.range(3)).map(index => ({
        entityId: `${modelName}${index}`,
        entityType: underscore(modelName),
        name: `${modelName}${index}`,
        constructor: {
          modelName: dasherize(modelName),
        },
        effUserList: PromiseObject.create({
          promise: resolve({
            list: PromiseArray.create({
              promise: resolve([{
                entityId: `${modelName}${index}user`,
                name: `${modelName}${index}user`,
              }]),
            }),
          }),
        }),
        effGroupList: PromiseObject.create({
          promise: resolve({
            list: PromiseArray.create({
              promise: resolve([{
                entityId: `${modelName}${index}group`,
                name: `${modelName}${index}group`,
              }]),
            }),
          }),
        }),
      }));
      getUserRecordListStub.withArgs(modelName).resolves({
        list: PromiseArray.create({
          promise: resolve(mockedRecords[modelName]),
        }),
      });
      mockedRecords[modelName].forEach(record =>
        getRecordByIdStub.withArgs(modelName, record.entityId).resolves(record)
      );
    });
    mockedRecords['cluster'].concat(mockedRecords['provider'])
      .forEach(record => record.serviceType = 'oneprovider');
    const ozCluster = mockedRecords['cluster'][0];
    ozCluster.serviceType = 'onezone';
    set(lookupService(this, 'onedata-connection'), 'onezoneRecord', {
      name: 'onezone',
      serviceType: 'onezone',
    });
    set(lookupService(this, 'gui-context'), 'clusterId', ozCluster.entityId);
    const changeSpy = sinon.spy();
    this.set('change', changeSpy);
    this.setProperties({
      changeSpy,
      mockedRecords,
      currentUser,
    });
  });

  it('has class "token-editor"', async function () {
    await render(hbs `{{token-editor}}`);

    expect(find('.token-editor')).to.exist;
  });

  it('renders "name" field', async function () {
    await render(hbs `{{token-editor mode="create"}}`);

    expectLabelToEqual('name', 'Name');
    expect(find('.name-field input')).to.exist;
  });

  it('has not valid "name" when it is empty', async function () {
    await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

    await fillIn('.name-field input', '');
    expectToHaveValue(this, 'name', '');
    expectToBeInvalid(this, 'name');
  });

  it('has valid "name" when it has been changed to not empty value', async function () {
    await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

    await fillIn('.name-field input', 'abc');
    expectToHaveValue(this, 'name', 'abc');
    expectToBeValid(this, 'name');
  });

  it('renders "type" field', async function () {
    await render(hbs `{{token-editor mode="create"}}`);

    expectLabelToEqual('type', 'Type');
    [
      'access',
      'identity',
      'invite',
    ].forEach(type =>
      expect(find(`.type-field .option-${type}`))
      .to.have.trimmed.text(_.upperFirst(type))
    );
  });

  it(
    'has "type" field with preselected "access" option and corresponding autogenerated name',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      expectToHaveValue(this, 'type', 'access');
      expectToBeValid(this, 'type');
      expect(find('.type-field .option-access input')).to.have.property('checked', true);
      expectToHaveValue(this, 'name', sinon.match(/Access .+/));
      expectToBeValid(this, 'name');
    }
  );

  [{
    type: 'identity',
    newName: /Identity .+/,
  }, {
    type: 'invite',
    newName: /Inv\. .+/,
  }].forEach(({ type, newName }) => {
    it(
      `notifies about "type" field change to ${type} and changes autogenerated name`,
      async function () {
        await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

        await click(`.type-field .option-${type}`);
        expectToHaveValue(this, 'type', type);
        expectToBeValid(this, 'type');
        expectToHaveValue(this, 'name', sinon.match(newName));
        expectToBeValid(this, 'name');
      }
    );
  });

  it(
    'marking name field as modified stops updating by name autogenerator',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await focus('.name-field input');
      await blur('.name-field input');
      await click('.type-field .option-invite');
      expectToHaveValue(this, 'name', sinon.match(/Access .*/));
    }
  );

  [
    'access',
    'identity',
  ].forEach(type => {
    it(
      `does not show invitation related basic fields if "type" is "${type}"`,
      async function () {
        await render(hbs `{{token-editor mode="create"}}`);

        await click(`.type-field .option-${type}`);
        expect(find('.inviteDetails-collapse')).to.not.have.class('in');
      }
    );
  });

  it(
    'shows invitation related basic fields only if "type" is "invite"',
    async function () {
      await render(hbs `{{token-editor mode="create"}}`);

      await click('.type-field .option-invite');
      expect(find('.inviteDetails-collapse')).to.have.class('in');
    }
  );

  it('renders "inviteType" field', async function () {
    await render(hbs `{{token-editor mode="create"}}`);

    await click('.type-field .option-invite');
    expectLabelToEqual('inviteType', 'Invite type');
    await clickTrigger('.inviteType-field');
    const options = findAll('.ember-power-select-option');
    tokenInviteTypes.forEach(({ label, icon }, index) => {
      const option = options[index];
      expect(option).to.have.trimmed.text(label);
      expect(option.querySelector('.one-icon')).to.have.class(`oneicon-${icon}`);
    });
  });

  it(
    `has "inviteType" field with preselected "${preselectedInviteType.label}" option`,
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await click('.type-field .option-invite');
      expectToHaveValue(this, 'inviteType', preselectedInviteType.inviteType);
      expectToBeValid(this, 'inviteType');
      expect(find('.inviteType-field .ember-power-select-trigger'))
        .to.have.trimmed.text(preselectedInviteType.label);
    }
  );

  it(
    'does not inform about invalid "target" field when it is hidden',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      expectToBeValid(this, 'target');
    }
  );

  it(
    'has not valid "target" field when it is empty',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await click('.type-field .option-invite');
      expectToHaveNoValue(this, 'target');
      expectToBeInvalid(this, 'target');
    }
  );

  tokenInviteTypes.forEach(({
    inviteType,
    label,
    icon,
    targetModelName,
    targetPlaceholder,
    noPrivileges,
    tokenName,
    modelNameInPrivileges,
  }) => {
    it(
      `notifies about "inviteType" field change to "${label}" and changes autogenerated name`,
      async function () {
        await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

        await click('.type-field .option-invite');
        await selectChoose('.inviteType-field', label);
        expectToHaveValue(this, 'inviteType', inviteType);
        expectToBeValid(this, 'inviteType');
        expectToHaveValue(this, 'name', sinon.match(tokenName));
        expectToBeValid(this, 'name');
      }
    );

    if (targetModelName) {
      it(
        `shows correct "target" field when "inviteType" field is "${label}"`,
        async function () {
          await render(hbs `{{token-editor mode="create"}}`);

          await click('.type-field .option-invite');
          await selectChoose('.inviteType-field', label);
          const collapse = find('.inviteTargetDetails-collapse');
          const placeholder =
            find('.target-field .ember-power-select-placeholder');
          expect(collapse).to.have.class('in');
          expectLabelToEqual('target', '', true);
          expect(placeholder).to.have.trimmed.text(targetPlaceholder);
          await clickTrigger('.target-field');
          const options = findAll('.ember-power-select-option');
          expect(options).to.have.length(3);
          expect(options[2].querySelector('.one-icon'))
            .to.have.class(`oneicon-${icon}`);
          expect(options[2].querySelector('.text'))
            .to.have.trimmed.text(`${targetModelName}2`);
        }
      );

      it(
        `notifies about "target" field change when "inviteType" field is "${label}"`,
        async function () {
          await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

          await click('.type-field .option-invite');
          await selectChoose('.inviteType-field', label);
          const targetToSelect =
            this.get(`mockedRecords.${targetModelName}.lastObject`);
          await selectChoose('.target-field', targetToSelect.name);
          expectToHaveValue(this, 'target', targetToSelect);
          expectToBeValid(this, 'target');
          expectToHaveValue(
            this,
            'name',
            sinon.match(tokenName).and(name =>
              name.includes(targetToSelect.name.slice(0, 6))
            )
          );
          expectToBeValid(this, 'name');
        }
      );

      if (!noPrivileges) {
        it(
          `shows correct privileges field when "inviteType" field is "${label}"`,
          async function () {
            await render(hbs `{{token-editor mode="create"}}`);

            await click('.type-field .option-invite');
            await selectChoose('.inviteType-field', label);
            expect(find('.invitePrivilegesDetails-collapse'))
              .to.have.class('in');
            expectLabelToEqual('privileges', 'Privileges');
            expect(
              find('.privileges-field .node-text')
            ).to.have.trimmed.text(`${_.upperFirst(modelNameInPrivileges)} management`);
            const permissionContainer = findInElementsByText(
              findAll('.node-text'),
              `View ${modelNameInPrivileges}`
            ).parentElement;
            expect(
              permissionContainer.querySelector('.one-way-toggle')
            ).to.have.class('checked');
            expect(findAll('.privileges-field .one-way-toggle.checked'))
              .to.have.length(1);
            const tooltipText = await new OneTooltipHelper(
              '.privileges-field .one-label-tip .oneicon'
            ).getText();
            expect(tooltipText).to.equal(
              'These privileges will be granted to a new member after joining with this invite token.'
            );
          }
        );

        it(
          `notifies about "privileges" field change when "inviteType" field is "${label}"`,
          async function () {
            await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

            await click('.type-field .option-invite');
            await selectChoose('.inviteType-field', label);
            const permissionContainer = findInElementsByText(
              findAll('.node-text'),
              `Modify ${modelNameInPrivileges}`
            ).parentElement;
            await click(permissionContainer.querySelector('.one-way-toggle'));
            const underscoredModelName = _.snakeCase(targetModelName);
            expectToHaveValue(this, 'privileges', [
              `${underscoredModelName}_view`,
              `${underscoredModelName}_update`,
            ]);
            expectToBeValid(this, 'privileges');
          }
        );
      } else {
        it(
          `does not show privileges when "inviteType" field is "${label}"`,
          async function () {
            await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

            await click('.type-field .option-invite');
            await selectChoose('.inviteType-field', label);
            expect(find('.invitePrivilegesDetails-collapse'))
              .to.not.have.class('in');
          }
        );
      }
    } else {
      it(
        `does not show invite target details when "inviteType" field is "${label}"`,
        async function () {
          await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

          await click('.type-field .option-invite');
          await selectChoose('.inviteType-field', label);
          expect(find('.inviteTargetDetails-collapse'))
            .to.not.have.class('in');
        }
      );
    }
  });

  it(
    'resets "target" field after change to inviteType which requires different model',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await click('.type-field .option-invite');
      await selectChoose('.target-field', 'group0');
      await selectChoose('.inviteType-field', tokenInviteTypes[2].label);
      expectToHaveNoValue(this, 'target');
    }
  );

  it('renders "usageLimit" field', async function () {
    await render(hbs `{{token-editor mode="create"}}`);

    await click('.type-field .option-invite');
    expectLabelToEqual('usageLimit', 'Usage limit');
    expect(find('.usageLimit-field .control-label'))
      .to.have.trimmed.text('Usage limit:');
    expect(find('.usageLimit-field .option-infinity'))
      .to.have.trimmed.text('infinity');
    expect(find('.usageLimit-field .option-number'))
      .to.have.trimmed.text('');
  });

  it(
    'has "usageLimit" field with preselected "infinity" option and disabled number input',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await click('.type-field .option-invite');
      expectToHaveValue(this, 'usageLimit', sinon.match({
        usageLimitType: 'infinity',
      }));
      expectToBeValid(this, 'usageLimit');
      expect(find('.usageLimit-field .option-infinity input'))
        .to.have.property('checked', true);
      expect(find('.usageLimit-field .usageLimitNumber-field input'))
        .to.have.attr('disabled');
    }
  );

  it(
    'notifies about empty limit input error when usageLimit is set to use number',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await click('.type-field .option-invite');
      await click('.usageLimit-field .option-number');
      expectToHaveValue(this, 'usageLimit', sinon.match({
        usageLimitType: 'number',
      }));
      expectToBeInvalid(this, 'usageLimit');
    }
  );

  it(
    'notifies about correct limit input value when usageLimit is set to use number',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await click('.type-field .option-invite');
      await click('.usageLimit-field .option-number');
      await fillIn('.usageLimitNumber-field input', '1');
      expectToHaveValue(this, 'usageLimit', sinon.match({
        usageLimitType: 'number',
        usageLimitNumber: '1',
      }));
      expectToBeValid(this, 'usageLimit');
    }
  );

  it(
    'notifies about too low limit input error when usageLimit is set to use number',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await click('.type-field .option-invite');
      await click('.usageLimit-field .option-number');
      await fillIn('.usageLimitNumber-field input', '0');
      expectToHaveValue(this, 'usageLimit', sinon.match({
        usageLimitType: 'number',
        usageLimitNumber: '0',
      }));
      expectToBeInvalid(this, 'usageLimit');
    }
  );

  it(
    'has collapsed caveats on init',
    async function () {
      await render(hbs `{{token-editor mode="create"}}`);

      expect(areAllCaveatsCollapsed()).to.be.true;
    }
  );

  it(
    'allows to expand all caveats',
    async function () {
      await render(hbs `{{token-editor mode="create"}}`);

      await toggleCaveatsSection();
      expect(areAllCaveatsExpanded()).to.be.true;
    }
  );

  it(
    'does not collapse enabled caveats',
    async function () {
      await render(hbs `{{token-editor mode="create"}}`);

      await toggleCaveatsSection();
      await toggleCaveat('expire');
      await toggleCaveatsSection();
      expect(areAllCaveatsExpanded()).to.be.false;
      expect(isCaveatExpanded('expire')).to.be.true;
    }
  );

  it(
    'shows warning message when no caveats are enabled',
    async function () {
      await render(hbs `{{token-editor mode="create"}}`);

      expect(
        find('.no-caveats-warning').textContent.replace(/\s{2,}/g, ' ').trim()
      ).to.equal(
        'This token has no active caveats. Show possible options and customize caveats setup to make the token more secure.'
      );
    }
  );

  it(
    'allows to open all caveats through "no caveats" warning message',
    async function () {
      await render(hbs `{{token-editor mode="create"}}`);

      await click('.no-caveats-warning a');
      expect(areAllCaveatsExpanded()).to.be.true;
    }
  );

  it('does not show "no caveats" warning when there is one caveat enabled', async function () {
    await render(hbs `{{token-editor mode=mode}}`);

    await toggleCaveatsSection();
    await toggleCaveat('expire');
    await toggleCaveatsSection();
    expect(find('.no-caveats-warning')).to.not.exist;
  });

  ['view', 'edit'].forEach(mode => {
    it(`does not show "no caveats" warning in ${mode} mode`, async function () {
      this.set('mode', mode);

      await render(hbs `{{token-editor mode=mode}}`);

      expect(find('.no-caveats-warning')).to.not.exist;
    });
  });

  caveats.forEach(({
    name,
    label,
    disabledDescription,
    tip,
    isEnabledByDefault,
    dontTestValue,
  }) => {
    it(
      `renders unchecked toggle, label, tip and disabled description for ${name} caveat${isEnabledByDefault ? '' : ' on init'}`,
      async function () {
        await render(hbs `{{token-editor mode="create"}}`);

        await toggleCaveatsSection();
        await (isEnabledByDefault ? toggleCaveat(name) : resolve());
        const disabledDescriptionElem = find(`.${name}DisabledText-field`);

        expectCaveatToggleState(name, false);
        expectLabelToEqual(name, label);
        expect(getFieldElement(name)).to.not.exist;
        expect(disabledDescriptionElem).to.have.trimmed.text(disabledDescription);
        const tooltipText = await new OneTooltipHelper(
          `.${name}Caveat-field .one-label-tip .oneicon`
        ).getText();
        expect(tooltipText).to.equal(tip);
      }
    );

    it(
      `has valid and ${isEnabledByDefault ? 'enabled' : 'disabled'} ${name} caveat on init`,
      async function () {
        await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

        await toggleCaveatsSection();
        expectToBeValid(this, name);
        if (!dontTestValue) {
          expectCaveatToHaveValue(this, name, Boolean(isEnabledByDefault));
        } else {
          expectCaveatToHaveEnabledState(this, name, Boolean(isEnabledByDefault));
        }
      }
    );

    if (!isEnabledByDefault) {
      it(
        `hides disabled description and shows form field on ${name} caveat toggle change`,
        async function () {
          await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

          await toggleCaveatsSection();
          await toggleCaveat(name);
          expectCaveatToggleState(name, true);
          expect(find(`.${name}DisabledText-field`)).to.not.exist;

          if (!dontTestValue) {
            expect(getFieldElement(name)).to.exist;
            expectCaveatToHaveValue(this, name, true);
          } else {
            expectCaveatToHaveEnabledState(this, name, true);
          }
        }
      );
    }
  });

  it(
    'renders expire caveat form elements when that caveat is enabled',
    async function () {
      const tomorrow = moment().add(1, 'day').endOf('day');
      const dayAfterTomorrow = moment(tomorrow).add(1, 'day');

      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await toggleCaveatsSection();
      await toggleCaveat('expire');
      expectCaveatToHaveValue(this, 'expire', true, sinon.match(value =>
        tomorrow.isSame(value) || dayAfterTomorrow.isSame(value)
      ));
      expectToBeValid(this, 'expire');
    }
  );

  it(
    'notifies about expire caveat change',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await toggleCaveatsSection();
      await toggleCaveat('expire');
      const oldExpire = this.get('changeSpy').lastCall.args[0]
        .values.caveats.timeCaveats.expireCaveat.expire;
      await new OneDatetimePickerHelper('.expire-field input').selectToday();
      expectCaveatToHaveValue(this, 'expire', true, sinon.match(value =>
        !moment(oldExpire).isSame(value)
      ));
      expectToBeValid(this, 'expire');
    }
  );

  it(
    'renders interface caveat form elements when that caveat is enabled',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await toggleCaveatsSection();
      await toggleCaveat('interface');
      const restOption = find('.option-rest');
      const oneclientOption = find('.option-oneclient');
      expect(restOption).to.exist;
      expect(restOption).to.have.trimmed.text('REST');
      expect(oneclientOption).to.exist;
      expect(oneclientOption).to.have.trimmed.text('Oneclient');

      expectCaveatToHaveValue(this, 'interface', true, 'rest');
      expectToBeValid(this, 'interface');
    }
  );

  it(
    'notifies about interface caveat change',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await toggleCaveatsSection();
      await toggleCaveat('interface');
      await click('.option-oneclient');
      expectCaveatToHaveValue(this, 'interface', true, 'oneclient');
      expectToBeValid(this, 'interface');
      await click('.option-rest');
      expectCaveatToHaveValue(this, 'interface', true, 'rest');
      expectToBeValid(this, 'interface');
    }
  );

  [
    'asn',
    'ip',
  ].forEach(caveatName => {
    it(
      `renders empty, invalid ${caveatName} caveat when it is enabled`,
      async function () {
        await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

        await toggleCaveatsSection();
        await toggleCaveat(caveatName);
        expectCaveatToHaveValue(this, caveatName, true, sinon.match([]));
        expectToBeInvalid(this, caveatName);
      }
    );
  });

  it(
    'notifies about asn caveat change',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await toggleCaveatsSection();
      await toggleCaveat('asn');
      await click('.asn-field .tags-input');
      await fillIn('.asn-field .text-editor-input', '123,2,123,');
      expectCaveatToHaveValue(this, 'asn', true, [2, 123]);
      expectToBeValid(this, 'asn');
    }
  );

  it(
    'not allows to input invalid asn',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await toggleCaveatsSection();
      await toggleCaveat('asn');
      await click('.asn-field .tags-input');
      await fillIn('.asn-field .text-editor-input', 'abc,');
      expectCaveatToHaveValue(this, 'asn', true, sinon.match([]));
      expectToBeInvalid(this, 'asn');
    }
  );

  it(
    'notifies about ip caveat change',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await toggleCaveatsSection();
      await toggleCaveat('ip');
      await click('.ip-field .tags-input');
      await fillIn(
        '.ip-field .text-editor-input',
        '1.1.1.1/24,1.1.1.1/23,1.1.1.1,255.255.255.255,1.1.1.1/24,'
      );
      expectCaveatToHaveValue(this, 'ip', true, [
        '1.1.1.1',
        '1.1.1.1/23',
        '1.1.1.1/24',
        '255.255.255.255',
      ]);
      expectToBeValid(this, 'ip');
    }
  );

  it(
    'not allows to input invalid ip',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await toggleCaveatsSection();
      await toggleCaveat('ip');
      await click('.ip-field .tags-input');
      await fillIn('.ip-field .text-editor-input', '123.123.123.123/33,');
      expectCaveatToHaveValue(this, 'ip', true, sinon.match([]));
      expectToBeInvalid(this, 'ip');
    }
  );

  it(
    'renders empty, invalid region caveat when it is enabled',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await toggleCaveatsSection();
      await toggleCaveat('region');
      expectCaveatToHaveValue(this, 'region', true,
        sinon.match.has('regionList', sinon.match([])));
      expectCaveatToHaveValue(this, 'region', true,
        sinon.match.has('regionType', 'whitelist'));
      expectToBeInvalid(this, 'region');
    }
  );

  regions.forEach(({ label, value }) => {
    it(
      `notifies about region caveat change to ["${value}"]`,
      async function () {
        await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

        await toggleCaveatsSection();
        await toggleCaveat('region');
        await click('.region-field .tags-input');
        await click(findInElementsByText(
          getTagsSelector().querySelectorAll('.selector-item'),
          label
        ));
        expectCaveatToHaveValue(this, 'region', true,
          sinon.match.has('regionList', sinon.match([value])));
        expectToBeValid(this, 'region');
      }
    );
  });

  it(
    'notifies about region caveat type change to "deny"',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await toggleCaveatsSection();
      await toggleCaveat('region');
      await selectChoose('.regionType-field', 'Deny');
      expect(find('.regionType-field .ember-power-select-trigger').innerText)
        .to.equal('Deny');
      expectCaveatToHaveValue(this, 'region', true,
        sinon.match.has('regionType', 'blacklist'));
      expectToBeInvalid(this, 'region');
    }
  );

  it(
    'sorts tags in region caveat input',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await toggleCaveatsSection();
      await toggleCaveat('region');
      await click('.region-field .tags-input');
      await click(findInElementsByText(
        getTagsSelector().querySelectorAll('.selector-item'),
        'Europe'
      ));
      await click(findInElementsByText(
        getTagsSelector().querySelectorAll('.selector-item'),
        'Asia'
      ));
      expectCaveatToHaveValue(this, 'region', true,
        sinon.match.has('regionList', sinon.match([
          'Asia',
          'Europe',
        ]))
      );
      expectToBeValid(this, 'region');
    }
  );

  it(
    'renders empty, invalid country caveat when it is enabled',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await toggleCaveatsSection();
      await toggleCaveat('country');
      expectCaveatToHaveValue(this, 'country', true,
        sinon.match.has('countryList', sinon.match([])));
      expectCaveatToHaveValue(this, 'country', true,
        sinon.match.has('countryType', 'whitelist'));
      expectToBeInvalid(this, 'country');
      await click('.country-field .tags-input');
      expect(find('.country-field .text-editor-input'))
        .to.have.attr('placeholder', 'Example: PL');
    }
  );

  it(
    'notifies about country caveat change',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await toggleCaveatsSection();
      await toggleCaveat('country');
      await click('.country-field .tags-input');
      await fillIn('.country-field .text-editor-input', 'pl,cz,pl,DK,dk,');
      expectCaveatToHaveValue(this, 'country', true,
        sinon.match.has('countryList', ['CZ', 'DK', 'PL']));
      expectToBeValid(this, 'country');
    }
  );

  it(
    'not allows to input invalid country',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await toggleCaveatsSection();
      await toggleCaveat('country');
      await click('.country-field .tags-input');
      await fillIn('.country-field .text-editor-input', 'a1,usa,b,a_,');
      expectCaveatToHaveValue(this, 'country', true,
        sinon.match.has('countryList', []));
      expectToBeInvalid(this, 'country');
    }
  );

  it(
    'notifies about country caveat type change to "deny"',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await toggleCaveatsSection();
      await toggleCaveat('country');
      await selectChoose('.countryType-field', 'Deny');
      expect(find('.countryType-field .ember-power-select-trigger').innerText)
        .to.equal('Deny');
      expectCaveatToHaveValue(this, 'country', true,
        sinon.match.has('countryType', 'blacklist'));
      expectToBeInvalid(this, 'country');
    }
  );

  it(
    'renders empty, invalid consumer caveat when it is enabled',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await toggleCaveatsSection();
      await toggleCaveat('consumer');
      expectCaveatToHaveValue(this, 'consumer', true, []);
      expectToBeInvalid(this, 'consumer');
    }
  );

  [{
    model: 'user',
    name: 'User',
    list: [
      'currentuser',
      'group0user',
      'group1user',
      'group2user',
      'space0user',
      'space1user',
      'space2user',
    ],
  }, {
    model: 'group',
    name: 'Group',
    list: [
      'group0',
      'group1',
      'group2',
      'group0group',
      'group1group',
      'group2group',
      'space0group',
      'space1group',
      'space2group',
    ],
  }, {
    model: 'provider',
    name: 'Oneprovider',
    list: [
      'provider0',
      'provider1',
      'provider2',
    ],
  }].forEach(({ model, name, list }) => {
    it(
      `shows ${model} list in consumer caveat`,
      async function () {
        await render(hbs `{{token-editor mode="create"}}`);

        await toggleCaveatsSection();
        await toggleCaveat('consumer');
        await click('.consumer-field .tags-input');
        await selectChoose('.tags-selector', name);
        expect(find('.tags-selector .ember-power-select-trigger'))
          .to.have.trimmed.text(name);
        const selectorItems = getTagsSelector().querySelectorAll('.selector-item');
        expect(selectorItems).to.have.length(list.length + 1);
        list.forEach(recordName => {
          expect(findInElementsByText(selectorItems, recordName)).to.exist;
        });
      }
    );
  });

  it('notifies about adding new consumer in consumer caveat', async function () {
    await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

    await toggleCaveatsSection();
    await toggleCaveat('consumer');
    await click('.consumer-field .tags-input');
    await click(getTagsSelector().querySelector('.record-item'));
    expectCaveatToHaveValue(this, 'consumer', true, [{
      model: 'user',
      record: this.get('currentUser'),
    }]);
    expectToBeValid(this, 'consumer');
  });

  [
    'User',
    'Group',
    'Oneprovider',
  ].forEach((typeName) => {
    it(
      `removes concrete ${typeName} tags when "all" ${typeName} tag has been selected in consumer caveat`,
      async function () {
        await render(hbs `{{token-editor mode="create"}}`);

        await toggleCaveatsSection();
        await toggleCaveat('consumer');
        await click('.consumer-field .tags-input');
        await selectChoose('.tags-selector', typeName);
        await click(getTagsSelector().querySelector('.record-item'));
        await click(getTagsSelector().querySelector('.record-item'));
        expect(getFieldElement('consumer').querySelectorAll('.tag-item'))
          .to.have.length(2);
        await click(getTagsSelector().querySelector('.all-item'));
        const tagItems = getFieldElement('consumer').querySelectorAll('.tag-item');
        expect(tagItems).to.have.length(1);
        expect(tagItems[0]).to.contain.text('Any');
      }
    );
  });

  it('sorts selected tags in consumer caveat', async function () {
    await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

    await toggleCaveatsSection();
    await toggleCaveat('consumer');
    await click('.consumer-field .tags-input');
    await click(getTagsSelector().querySelectorAll('.record-item')[1]);
    await click(getTagsSelector().querySelector('.record-item'));
    const tagItems = getFieldElement('consumer').querySelectorAll('.tag-item');
    expect(tagItems[0]).to.have.trimmed.text('currentuser');
    expect(tagItems[1]).to.have.trimmed.text('group0user');
  });

  it(
    'shows service list in service caveat',
    async function () {
      await render(hbs `{{token-editor mode="create"}}`);

      await toggleCaveatsSection();
      await toggleCaveat('service');
      await click('.service-field .tags-input');
      await selectChoose('.tags-selector', 'Service');
      expect(find('.tags-selector .ember-power-select-trigger'))
        .to.have.trimmed.text('Service');
      const selectorItems = getTagsSelector().querySelectorAll('.selector-item');
      expect(selectorItems).to.have.length(5);
      _.times(3, i => {
        expect(findInElementsByText(selectorItems, `provider${i}`)).to.exist;
      });
      expect(findInElementsByText(selectorItems, 'onezone')).to.exist;
    }
  );

  it(
    'shows service onepanel list in service caveat',
    async function () {
      await render(hbs `{{token-editor mode="create"}}`);

      await toggleCaveatsSection();
      await toggleCaveat('service');
      await click('.service-field .tags-input');
      await selectChoose('.tags-selector', 'Service Onepanel');
      expect(find('.tags-selector .ember-power-select-trigger'))
        .to.have.trimmed.text('Service Onepanel');
      const selectorItems = getTagsSelector().querySelectorAll('.selector-item');
      expect(selectorItems).to.have.length(4);
      _.times(3, i => {
        expect(findInElementsByText(selectorItems, `cluster${i}`)).to.exist;
      });
    }
  );

  it('notifies about adding new service in service caveat', async function () {
    await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

    await toggleCaveatsSection();
    await toggleCaveat('service');
    await click('.service-field .tags-input');
    await click(getTagsSelector().querySelectorAll('.record-item')[1]);
    expectCaveatToHaveValue(this, 'service', true, [{
      model: 'service',
      record: this.get('mockedRecords.provider')[2],
    }]);
    expectToBeValid(this, 'service');
  });

  [
    'Service',
    'Service Onepanel',
  ].forEach((typeName) => {
    it(
      `removes concrete ${typeName} tags when "all" ${typeName} tag has been selected in service caveat`,
      async function () {
        await render(hbs `{{token-editor mode="create"}}`);

        await toggleCaveatsSection();
        await toggleCaveat('service');
        await click('.service-field .tags-input');
        await selectChoose('.tags-selector', typeName);
        await click(
          findInElementsByText(getTagsSelector().querySelectorAll('.record-item'), '0')
        );
        await click(
          findInElementsByText(getTagsSelector().querySelectorAll('.record-item'), '1')
        );
        expect(getFieldElement('service').querySelectorAll('.tag-item'))
          .to.have.length(2);
        await click(getTagsSelector().querySelector('.all-item'));
        const tagItems = getFieldElement('service').querySelectorAll('.tag-item');
        expect(tagItems).to.have.length(1);
        expect(tagItems).to.contain.text('Any');
      }
    );
  });

  it('sorts selected tags in service caveat', async function () {
    await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

    await toggleCaveatsSection();
    await toggleCaveat('service');
    await click('.service-field .tags-input');
    await click(getTagsSelector().querySelectorAll('.record-item')[2]);
    await click(getTagsSelector().querySelectorAll('.record-item')[1]);
    const tagItems = getFieldElement('service').querySelectorAll('.tag-item');
    expect(tagItems[0]).to.have.trimmed.text('provider0');
    expect(tagItems[1]).to.have.trimmed.text('provider1');
  });

  it(
    'renders empty, valid path caveat when it is enabled',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await toggleCaveatsSection();
      await toggleCaveat('path');
      expectCaveatToHaveValue(this, 'path', true,
        sinon.match.has('__fieldsValueNames', sinon.match([])));
      expectToBeValid(this, 'path');
    }
  );

  it(
    'preselects first available space and path "" with placeholder for new entry in path caveat',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await toggleCaveatsSection();
      await toggleCaveat('path');
      await click(getFieldElement('path').querySelector('.add-field-button'));
      const selectedSpace = this.get('mockedRecords.space.lastObject');
      expectCaveatToHaveValue(this, 'path', true,
        sinon.match.hasNested('pathEntry0.pathSpace', selectedSpace));
      expectCaveatToHaveValue(this, 'path', true,
        sinon.match.hasNested('pathEntry0.pathString', ''));
      expectToBeValid(this, 'path');

      expect(find('.pathSpace-field .ember-power-select-trigger .text'))
        .to.have.trimmed.text('space0');
      const entryInput = getFieldElement('path')
        .querySelector('.pathString-field input');
      expect(entryInput).to.have.value('');
      expect(entryInput).to.have.attr('placeholder', 'Example: /my/directory/path');
      expectToBeValid(this, 'path');
    }
  );

  it(
    'allows to choose between available spaces in path caveat entry',
    async function () {
      await render(hbs `{{token-editor mode="create"}}`);

      await toggleCaveatsSection();
      await toggleCaveat('path');
      await click(getFieldElement('path').querySelector('.add-field-button'));
      await clickTrigger('.pathSpace-field');
      const options = findAll('.ember-power-select-option');
      expect(options).to.have.length(3);
      expect(options[2].querySelector('.one-icon')).to.have.class('oneicon-space');
      expect(options[2].querySelector('.text')).to.have.trimmed.text('space2');
    }
  );

  it(
    'notifies about path caveat entry space change',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await toggleCaveatsSection();
      await toggleCaveat('path');
      await click(getFieldElement('path').querySelector('.add-field-button'));
      const spaceToSelect = this.get('mockedRecords.space.firstObject');
      await selectChoose('.pathSpace-field', spaceToSelect.name);
      expect(find('.pathSpace-field .ember-power-select-trigger .text'))
        .to.have.trimmed.text('space2');

      expectCaveatToHaveValue(this, 'path', true,
        sinon.match.hasNested('pathEntry0.pathSpace', spaceToSelect));
      expectToBeValid(this, 'path');
    }
  );

  [
    '',
    '/',
    '/asd',
    '/asd/',
    '/asd/xcv.cpp',
  ].forEach(pathString => {
    it(
      `notifies about correct path caveat string ${JSON.stringify(pathString)}`,
      async function () {
        await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

        await toggleCaveatsSection();
        await toggleCaveat('path');
        await click(getFieldElement('path').querySelector('.add-field-button'));
        await fillIn(
          getFieldElement('path').querySelector('.pathString-field input'),
          pathString
        );
        expectToBeValid(this, 'path');
      }
    );
  });

  [
    '//',
    'asd/',
    '/asd//',
    ' /asd',
  ].forEach(pathString => {
    it(
      `notifies about incorrect path caveat string ${JSON.stringify(pathString)}`,
      async function () {
        await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

        await toggleCaveatsSection();
        await toggleCaveat('path');
        await click(getFieldElement('path').querySelector('.add-field-button'));
        await fillIn(
          getFieldElement('path').querySelector('.pathString-field input'),
          pathString
        );
        expectToBeInvalid(this, 'path');
      }
    );
  });

  it(
    'hides enabled description when readonly caveat is disabled',
    async function () {
      await render(hbs `{{token-editor mode="create"}}`);

      await toggleCaveatsSection();
      expect(find('.readonlyEnabledText-field')).to.not.exist;
    }
  );

  it(
    'renders readonly caveat form elements when that caveat is enabled',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await toggleCaveatsSection();
      await toggleCaveat('readonly');
      expect(find('.readonlyEnabledText-field'))
        .to.have.trimmed.text('This token allows only read access to user files.');

      expectToBeValid(this, 'readonly');
    }
  );

  it(
    'renders empty, valid objectId caveat when it is enabled',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await toggleCaveatsSection();
      await toggleCaveat('objectId');
      expectCaveatToHaveValue(this, 'objectId', true,
        sinon.match.has('__fieldsValueNames', sinon.match([])));
      expectToBeValid(this, 'objectId');
    }
  );

  it(
    'notifies about objectId caveat change',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await toggleCaveatsSection();
      await toggleCaveat('objectId');
      await click(getFieldElement('objectId').querySelector('.add-field-button'));
      await fillIn(getFieldElement('objectId').querySelector('input'), 'abc');
      expectCaveatToHaveValue(this, 'objectId', true,
        sinon.match.has('objectIdEntry0', 'abc'));
      expectToBeValid(this, 'objectId');
    }
  );

  it(
    'informs about invalid (empty) objectId entry',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await toggleCaveatsSection();
      await toggleCaveat('objectId');
      await click(getFieldElement('objectId').querySelector('.add-field-button'));
      expectToBeInvalid(this, 'objectId');
    }
  );

  it(
    'has readonly, path and objectId caveats under dataAccessCaveats group',
    async function () {
      const caveatsToCheck = [
        'readonly',
        'path',
        'objectId',
      ];

      await render(hbs `{{token-editor mode="create"}}`);

      caveatsToCheck.forEach(caveatName => {
        const caveatSelector =
          `.dataAccessCaveats-field .${caveatName}Caveat-field.caveat-group`;
        expect(find(caveatSelector)).to.exist;
      });
      expect(findAll('.dataAccessCaveats-field .caveat-group'))
        .to.have.length(caveatsToCheck.length);
    }
  );

  it(
    'shows access token caveats when token type is changed to access',
    async function () {
      await render(hbs `{{token-editor mode="create"}}`);

      await click('.type-field .option-access');
      await toggleCaveatsSection();
      expect(find('.serviceCaveat-collapse')).to.have.class('in');
      expect(find('.interfaceCaveat-collapse')).to.have.class('in');
      expect(find('.dataAccessCaveats-collapse')).to.have.class('in');
    }
  );

  it(
    'shows indentity token caveats when token type is changed to identity',
    async function () {
      await render(hbs `{{token-editor mode="create"}}`);

      await click('.type-field .option-identity');
      await toggleCaveatsSection();
      expect(find('.serviceCaveat-collapse')).to.not.have.class('in');
      expect(find('.interfaceCaveat-collapse')).to.have.class('in');
      expect(find('.dataAccessCaveats-collapse')).to.not.have.class('in');
    }
  );

  it(
    'shows invite token caveats when token type is changed to invite',
    async function () {
      await render(hbs `{{token-editor mode="create"}}`);

      await click('.type-field .option-invite');
      await toggleCaveatsSection();
      expect(find('.serviceCaveat-collapse')).to.not.have.class('in');
      expect(find('.interfaceCaveat-collapse')).to.not.have.class('in');
      expect(find('.dataAccessCaveats-collapse')).to.not.have.class('in');
    }
  );

  it(
    'ignores validation errors in access only caveats when token type is not access',
    async function () {
      await render(hbs `{{token-editor mode="create" onChange=(action change)}}`);

      await toggleCaveatsSection();
      await toggleCaveat('objectId');
      await click(getFieldElement('objectId').querySelector('.add-field-button'));
      await toggleCaveat('path');
      await click(getFieldElement('path').querySelector('.add-field-button'));
      await click('.type-field .option-invite');
      expectToBeValid(this, 'objectId');
      expectToBeValid(this, 'path');
    }
  );

  it('shows service caveat warning in initial values configuration', async function () {
    await render(hbs `{{token-editor mode="create"}}`);

    expect(find('.service-caveat-warning')).to.exist;
  });

  it(
    'does not show service caveat warning when service caveat is enabled',
    async function () {
      await render(hbs `{{token-editor mode="create"}}`);

      await toggleCaveatsSection();
      await toggleCaveat('service');
      expect(find('.service-caveat-warning')).to.exist;
    }
  );

  it(
    'does not show service caveat warning when service caveat is disabled and not available',
    async function () {
      await render(hbs `{{token-editor mode="create"}}`);

      await click('.type-field .option-invite');
      expect(find('.service-caveat-warning')).to.not.exist;
    }
  );

  it(
    'shows service caveat warning when service caveat has Onezone service selected',
    async function () {
      await render(hbs `{{token-editor mode="create"}}`);

      await toggleCaveatsSection();
      await toggleCaveat('service');
      await click('.service-field .tags-input');
      await click(findInElementsByText(
        getTagsSelector().querySelectorAll('.record-item'),
        'onezone'
      ));
      expect(find('.service-caveat-warning')).to.exist;
    }
  );

  it(
    'shows service caveat warning when service caveat is enabled, but empty',
    async function () {
      await render(hbs `{{token-editor mode="create"}}`);

      await toggleCaveatsSection();
      await toggleCaveat('service');
      expect(find('.service-caveat-warning')).to.exist;
    }
  );

  it(
    'does not show service caveat warning when service caveat is disabled and interface caveat is set to oneclient',
    async function () {
      await render(hbs `{{token-editor mode="create"}}`);

      await toggleCaveatsSection();
      await toggleCaveat('interface');
      await click('.interface-field .option-oneclient');
      expect(find('.service-caveat-warning')).to.not.exist;
    }
  );

  it(
    'shows service caveat warning when service caveat is disabled and interface caveat is set to REST',
    async function () {
      await render(hbs `{{token-editor mode="create"}}`);

      await toggleCaveatsSection();
      await toggleCaveat('interface');
      await click('.interface-field .option-rest');
      expect(find('.service-caveat-warning')).to.exist;
    }
  );

  it(
    'does not show service caveat warning when service caveat is disabled and readonly caveat is enabled',
    async function () {
      await render(hbs `{{token-editor mode="create"}}`);

      await toggleCaveatsSection();
      await toggleCaveat('readonly');
      expect(find('.service-caveat-warning')).to.not.exist;
    }
  );

  it(
    'shows service caveat warning when service caveat is disabled and path caveat is enabled without any path',
    async function () {
      await render(hbs `{{token-editor mode="create"}}`);

      await toggleCaveatsSection();
      await toggleCaveat('path');
      expect(find('.service-caveat-warning')).to.exist;
    }
  );

  it(
    'does not show service caveat warning when service caveat is disabled and path caveat is enabled with one path included',
    async function () {
      await render(hbs `{{token-editor mode="create"}}`);

      await toggleCaveatsSection();
      await toggleCaveat('path');
      await click(getFieldElement('path').querySelector('.add-field-button'));
      expect(find('.service-caveat-warning')).to.not.exist;
    }
  );

  it(
    'shows service caveat warning when service caveat is disabled and objectId caveat is enabled without any object id',
    async function () {
      await render(hbs `{{token-editor mode="create"}}`);

      await toggleCaveatsSection();
      await toggleCaveat('objectId');
      expect(find('.service-caveat-warning')).to.exist;
    }
  );

  it(
    'does not show service caveat warning when service caveat is disabled and objectId caveat is enabled with one object id included',
    async function () {
      await render(hbs `{{token-editor mode="create"}}`);

      await toggleCaveatsSection();
      await toggleCaveat('objectId');
      await click(getFieldElement('objectId').querySelector('.add-field-button'));
      expect(find('.service-caveat-warning')).to.not.exist;
    }
  );

  it('renders disabled submit button when form is invalid', async function () {
    await render(hbs `{{token-editor mode="create"}}`);

    await fillIn('.name-field input', '');
    const submit = find('.submit-token');
    expect(submit).to.exist;
    expect(submit).to.have.trimmed.text('Create token');
    expect(submit).to.have.attr('disabled');
  });

  it('renders enabled submit button when form becomes valid', async function () {
    await render(hbs `{{token-editor mode="create"}}`);

    await fillIn('.name-field input', 'abc');
    expect(find('.submit-token')).to.not.have.attr('disabled');
  });

  it('calls injected onSubmit on submit click', async function () {
    const submitStub = sinon.stub().resolves();
    this.set('submit', submitStub);
    await render(hbs `{{token-editor mode="create" onSubmit=(action submit)}}`);

    await fillIn('.name-field input', 'abc');
    await click('.submit-token');
    expect(submitStub).to.be.calledOnce;
  });

  it(
    'passess token raw model via injected onSubmit on submit click (access token example with all caveats)',
    async function () {
      const submitStub = sinon.stub().resolves();
      this.set('submit', submitStub);
      await render(hbs `{{token-editor mode="create" onSubmit=(action submit)}}`);

      await fillIn('.name-field input', 'somename');
      await click('.type-field .option-access');
      await toggleCaveatsSection();
      // expire
      await toggleCaveat('expire');
      // region
      await toggleCaveat('region');
      // Not testing white/blacklist dropdown, due to unknown bug, that is related to
      // region tip and appears only on bamboo. Due to that bug this test cannot select
      // blacklist option. Removing tip from region fixes problem.
      await click('.region-field .tags-input');
      await click(findInElementsByText(
        getTagsSelector().querySelectorAll('.selector-item'),
        'Europe'
      ));
      // country
      await toggleCaveat('country');
      await selectChoose('.countryType-field', 'Deny');
      await click('.country-field .tags-input');
      await fillIn('.country-field .text-editor-input', 'pl,');
      // asn
      await toggleCaveat('asn');
      await click('.asn-field .tags-input');
      await fillIn('.asn-field .text-editor-input', '123,2,');
      // ip
      await toggleCaveat('ip');
      await click('.ip-field .tags-input');
      await fillIn('.ip-field .text-editor-input', '255.255.255.255,');
      // consumer
      await toggleCaveat('consumer');
      await click('.consumer-field .tags-input');
      await click(getTagsSelector().querySelectorAll('.record-item')[0]);
      // service
      await toggleCaveat('service');
      await click('.service-field .tags-input');
      await click(getTagsSelector().querySelectorAll('.record-item')[1]);
      // interface
      await toggleCaveat('interface');
      await click('.option-oneclient');
      // readonly
      await toggleCaveat('readonly');
      // path
      await toggleCaveat('path');
      await click(getFieldElement('path').querySelector('.add-field-button'));
      await selectChoose('.pathSpace-field', 'space0');
      await fillIn(
        getFieldElement('path').querySelector('.pathString-field input'),
        '/abc'
      );
      // objectid
      await toggleCaveat('objectId');
      await click(getFieldElement('objectId').querySelector('.add-field-button'));
      await fillIn(
        getFieldElement('objectId').querySelector('input'),
        'objectid1'
      );
      await click('.submit-token');
      const rawToken = submitStub.lastCall.args[0];
      expect(rawToken).to.have.property('name', 'somename');
      expect(rawToken).to.have.nested.property('type.accessToken');

      const caveats = rawToken.caveats;
      expect(caveats.length).to.equal(11);
      expect(caveats.findBy('type', 'time')).to.have.property('validUntil');
      expect(caveats.findBy('type', 'geo.region')).to.deep.include({
        filter: 'whitelist',
        list: ['Europe'],
      });
      expect(caveats.findBy('type', 'geo.country')).to.deep.include({
        filter: 'blacklist',
        list: ['PL'],
      });
      expect(caveats.findBy('type', 'asn')).to.deep.include({
        whitelist: [2, 123],
      });
      expect(caveats.findBy('type', 'ip')).to.deep.include({
        whitelist: ['255.255.255.255'],
      });
      expect(caveats.findBy('type', 'consumer')).to.deep.include({
        whitelist: ['usr-currentuser'],
      });
      expect(caveats.findBy('type', 'service')).to.deep.include({
        whitelist: ['opw-provider0'],
      });
      expect(caveats.findBy('type', 'interface'))
        .to.have.property('interface', 'oneclient');
      expect(caveats.findBy('type', 'data.readonly')).to.exist;
      expect(caveats.findBy('type', 'data.path')).to.deep.include({
        whitelist: ['L3NwYWNlMC9hYmM='],
      });
      expect(caveats.findBy('type', 'data.objectid')).to.deep.include({
        whitelist: ['objectid1'],
      });
    }
  );

  it(
    'passess token raw model via injected onSubmit on submit click (invite token example without caveats)',
    async function () {
      const submitStub = sinon.stub().resolves();
      this.set('submit', submitStub);
      await render(hbs `{{token-editor mode="create" onSubmit=(action submit)}}`);

      await fillIn('.name-field input', 'somename');
      await click('.type-field .option-invite');
      await selectChoose('.inviteType-field', tokenInviteTypes[0].label);
      await selectChoose('.target-field', 'group0');
      await click('.usageLimit-field .option-number');
      await fillIn('.usageLimitNumber-field input', '10');
      await click('.submit-token');
      const rawToken = submitStub.lastCall.args[0];
      expect(rawToken).to.have.property('name', 'somename');
      expect(rawToken).to.have.deep.nested.property('type.inviteToken', {
        inviteType: 'userJoinGroup',
        groupId: 'group0',
      });
      expect(rawToken).to.have.deep.property('privileges', ['group_view']);
      expect(rawToken).to.have.property('usageLimit', 10);
      expect(rawToken).to.not.have.property('caveats');
    }
  );

  it(
    'passess token raw model via injected onSubmit on submit click (register Oneprovider example without caveats)',
    async function () {
      const submitStub = sinon.stub().resolves();
      this.set('submit', submitStub);
      await render(hbs `{{token-editor mode="create" onSubmit=(action submit)}}`);

      await fillIn('.name-field input', 'somename');
      await click('.type-field .option-invite');
      await selectChoose('.inviteType-field', 'Register Oneprovider');
      await click('.submit-token');
      const rawToken = submitStub.lastCall.args[0];
      expect(rawToken).to.have.property('name', 'somename');
      expect(rawToken).to.have.deep.nested.property('type.inviteToken', {
        inviteType: 'registerOneprovider',
        adminUserId: 'currentuser',
      });
      expect(rawToken).to.not.have.property('caveats');
    }
  );

  it(
    'disables all fields and shows spinner in submit button when submit promise is pending',
    async function () {
      let submitResolve;
      const submitStub = sinon.stub()
        .returns(new Promise(resolve => submitResolve = resolve));
      this.set('submit', submitStub);
      await render(hbs `{{token-editor mode="create" onSubmit=(action submit)}}`);

      await fillIn('.name-field input', 'abc');
      await click('.submit-token');
      expect(find('input:not([disabled])')).to.not.exist;
      expect(find('.submit-token [role="progressbar"]')).to.exist;
      submitResolve();
      await settled();
      expect(find('input:not([disabled])')).to.exist;
      expect(find('.submit-token [role="progressbar"]')).to.not.exist;
    }
  );

  it(
    'is in mode "create" by default',
    async function () {
      await render(hbs `{{token-editor}}`);

      expect(find('.token-editor')).to.have.class('create-mode');
    }
  );

  it(
    'has all fields in edition mode, when mode is "create"',
    async function () {
      await render(hbs `{{token-editor mode="create"}}`);

      expect(find('.token-editor')).to.have.class('create-mode');
      expect(find('.field-view-mode')).to.not.exist;
    }
  );

  it(
    'has all fields in view mode, when mode is "view"',
    async function () {
      await render(hbs `{{token-editor mode="view"}}`);

      expect(find('.token-editor')).to.have.class('view-mode');
      expect(find('.field-edit-mode')).to.not.exist;
    }
  );

  it(
    'renders fields from view mode when component is in view mode',
    async function () {
      await render(hbs `{{token-editor mode="view"}}`);

      expectLabelToEqual('revoked', 'Revoked');
      expect(getFieldElement('revoked').querySelector('.one-way-toggle'))
        .to.exist;
      expectLabelToEqual('tokenString', 'Token');
      expect(getFieldElement('tokenString').querySelector('textarea'))
        .to.exist;
    }
  );

  it(
    'does not show fields from view mode, when is in create mode',
    async function () {
      await render(hbs `{{token-editor mode="create"}}`);

      expect(getFieldElement('tokenString')).to.not.exist;
      expect(getFieldElement('revoked')).to.not.exist;
    }
  );

  it(
    'shows passed token data in view mode (access token, all caveats)',
    async function () {
      const now = new Date();
      const token = {
        name: 'token1',
        revoked: true,
        token: 'abc',
        typeName: 'access',
        caveats: [{
          type: 'time',
          validUntil: Math.floor(now.valueOf() / 1000),
        }, {
          type: 'geo.region',
          filter: 'blacklist',
          list: ['Europe'],
        }, {
          type: 'geo.country',
          filter: 'blacklist',
          list: ['PL'],
        }, {
          type: 'asn',
          whitelist: [3],
        }, {
          type: 'ip',
          whitelist: ['1.2.3.4/12'],
        }, {
          type: 'consumer',
          whitelist: [
            'usr-user1',
            'usr-usrunknown',
            'usr-*',
            'grp-group1',
            'grp-grpunknown',
            'grp-*',
            'prv-provider1',
            'prv-prvunknown',
            'prv-*',
          ],
        }, {
          type: 'service',
          whitelist: [
            'opw-provider0',
            'opw-prvunknown',
            'ozw-onezone',
            'opw-*',
            'opp-cluster1',
            'opp-prvpunknown',
            'ozp-onezone',
            'opp-*',
          ],
        }, {
          type: 'interface',
          interface: 'oneclient',
        }, {
          type: 'data.readonly',
        }, {
          type: 'data.path',
          whitelist: [
            'L3NwYWNlMS9hYmMvZGVm', // /space1/abc/def
            'L3NwYWNlMQ==', // /space1
            'L3Vua25vd24vYWJjL2RlZi9naGk=', // /unknown/abc/def/ghi (non-existing space)
          ],
        }, {
          type: 'data.objectid',
          whitelist: [
            'abc',
            'def',
          ],
        }],
      };
      this.set('token', token);

      await render(hbs `{{token-editor mode="view" token=token}}`);

      expect(getFieldElement('name')).to.contain.text('token1');
      expect(getFieldElement('revoked').querySelector('.one-way-toggle'))
        .to.have.class('checked');
      expect(getFieldElement('tokenString').querySelector('textarea').value)
        .to.contain('abc');
      expect(getFieldElement('type')).to.contain.text('Access');
      expect(getFieldElement('expire'))
        .to.contain.text(moment(now).format('YYYY/MM/DD H:mm'));
      expect(getFieldElement('regionType')).to.contain.text('Deny');
      expect(getFieldElement('regionList')).to.contain.text('Europe');
      expect(getFieldElement('countryType')).to.contain.text('Deny');
      expect(getFieldElement('countryList')).to.contain.text('PL');
      expect(getFieldElement('asn')).to.contain.text('3');
      expect(getFieldElement('ip')).to.contain.text('1.2.3.4/12');
      const consumerCaveatText = getFieldElement('consumer').textContent;
      [
        'user1',
        'ID: usrunknown',
        'Any user',
        'group1',
        'ID: grpunknown',
        'Any group',
        'provider1',
        'ID: prvunknown',
        'Any Oneprovider',
      ].forEach(consumer => expect(consumerCaveatText).to.contain(consumer));
      const serviceCaveatText = getFieldElement('service').textContent;
      [
        'provider0',
        'ID: prvunknown',
        'onezone',
        'Any Oneprovider',
        'cluster1',
        'ID: prvpunknown',
        'cluster2',
        'Any Oneprovider Onepanel',
      ].forEach(service => expect(serviceCaveatText).to.contain(service));
      expect(getFieldElement('interface')).to.contain.text('Oneclient');
      expect(getFieldElement('readonlyView').querySelector('.one-way-toggle'))
        .to.have.class('checked');
      expect(getFieldElement('readonlyEnabledText')).to.not.exist;
      const pathsFields =
        getFieldElement('path').querySelectorAll('.pathEntry-field');
      expect(pathsFields).to.have.length(3);
      expect(
        pathsFields[0].querySelector('.pathSpace-field .oneicon-space')).to.exist;
      expect(
        pathsFields[0].querySelector('.pathSpace-field')
      ).to.contain.text('space1');
      expect(
        pathsFields[0].querySelector('.pathString-field')
      ).to.contain.text('/abc/def');
      expect(
        pathsFields[1].querySelector('.pathSpace-field .oneicon-space')).to.exist;
      expect(
        pathsFields[1].querySelector('.pathSpace-field')
      ).to.contain.text('space1');
      expect(
        pathsFields[1].querySelector('.pathString-field')
      ).to.contain.text('/');
      expect(
        pathsFields[2].querySelector('.pathSpace-field .oneicon-space')).to.exist;
      expect(
        pathsFields[2].querySelector('.pathSpace-field')
      ).to.contain.text('ID: unknown');
      expect(
        pathsFields[2].querySelector('.pathString-field')
      ).to.contain.text('/abc/def/ghi');
      const objectIdsFields =
        getFieldElement('objectId').querySelectorAll('.objectIdEntry-field');
      expect(objectIdsFields).to.have.length(2);
      expect(objectIdsFields[0]).to.contain.text('abc');
      expect(objectIdsFields[1]).to.contain.text('def');
      expect(find('.submit-token')).to.not.exist;
    }
  );

  it(
    'shows passed token data in view mode (invite token, no caveats)',
    async function () {
      const token = {
        name: 'token1',
        revoked: false,
        typeName: 'invite',
        inviteType: 'userJoinSpace',
        tokenTargetProxy: PromiseObject.create({
          promise: resolve({
            entityType: 'space',
            name: 'space1',
          }),
        }),
        privileges: ['space_view', 'space_update', 'space_delete'],
        usageLimit: 10,
        usageCount: 5,
      };
      this.set('token', token);

      await render(hbs `{{token-editor mode="view" token=token}}`);

      expect(getFieldElement('name')).to.contain.text('token1');
      expect(getFieldElement('revoked').querySelector('.one-way-toggle'))
        .to.not.have.class('checked');
      expect(getFieldElement('type')).to.contain.text('Invite');
      expect(getFieldElement('inviteType')).to.contain.text('Invite user to space');
      expect(getFieldElement('target')).to.contain.text('space1');
      expect(
        getFieldElement('privileges').querySelectorAll('.one-way-toggle.checked')
      ).to.have.length(3);
      expect(getFieldElement('usageLimit')).to.not.exist;
      expectLabelToEqual('usageCount', 'Usage count');
      expect(getFieldElement('usageCount')).to.contain.text('5 / 10');
      expect(find('.caveat-group-toggle')).to.not.exist;
      expect(find('.caveats-expand')).to.not.exist;
    }
  );

  it(
    'shows passed token data in view mode (invite token with unknown target, no caveats)',
    async function () {
      suppressRejections();
      const token = {
        name: 'token1',
        typeName: 'invite',
        inviteType: 'userJoinSpace',
        targetModelName: 'space',
        targetRecordId: 'space1',
        tokenTargetProxy: PromiseObject.create({
          promise: reject('error'),
        }),
        privileges: ['space_view', 'space_update', 'space_delete'],
        usageLimit: 10,
        usageCount: 5,
      };
      this.set('token', token);

      await render(hbs `{{token-editor mode="view" token=token}}`);

      expect(getFieldElement('name')).to.contain.text('token1');
      expect(getFieldElement('type')).to.contain.text('Invite');
      expect(getFieldElement('inviteType')).to.contain.text('Invite user to space');
      expect(getFieldElement('target')).to.contain.text('ID: space1');
      expect(
        getFieldElement('privileges').querySelectorAll('.one-way-toggle.checked')
      ).to.have.length(3);
      expect(getFieldElement('usageLimit')).to.not.exist;
      expectLabelToEqual('usageCount', 'Usage count');
      expect(getFieldElement('usageCount')).to.contain.text('5 / 10');
      expect(find('.caveat-group-toggle')).to.not.exist;
      expect(find('.caveats-expand')).to.not.exist;
    }
  );

  it(
    'has only name and revoked fields in edition mode, when mode is "edit"',
    async function () {
      await render(hbs `{{token-editor mode="edit"}}`);

      expect(find('.token-editor')).to.have.class('edit-mode');
      const editFields = findAll('.field-edit-mode');
      expect(editFields).to.have.length(2);
      expect(editFields[0].matches('.name-field')).to.be.true;
      expect(editFields[1].matches('.revoked-field')).to.be.true;
    }
  );

  it(
    'represents token values in edit fields in component "edit" mode',
    async function () {
      const token = {
        name: 'token1',
        revoked: true,
      };
      this.set('token', token);

      await render(hbs `{{token-editor mode="edit" token=token}}`);

      expect(getFieldElement('name').querySelector('input'))
        .to.have.value('token1');
      expect(getFieldElement('revoked').querySelector('.one-way-toggle'))
        .to.have.class('checked');
    }
  );

  it(
    'does not change values in edit fields, when token data changes in edit mode',
    async function () {
      const token = {
        name: 'token1',
        revoked: true,
      };
      this.set('token', token);

      await render(hbs `{{token-editor mode="edit" token=token}}`);

      this.set('token', {
        name: 'anothertoken',
        revoked: false,
      });

      expect(getFieldElement('name').querySelector('input'))
        .to.have.value('token1');
      expect(getFieldElement('revoked').querySelector('.one-way-toggle'))
        .to.have.class('checked');
    }
  );

  it('renders submit and cancel buttons in edit mode', async function () {
    const token = {
      name: 'token1',
      revoked: true,
    };
    this.set('token', token);

    await render(hbs `{{token-editor mode="edit" token=token}}`);

    const submit = find('.submit-token');
    const cancel = find('.cancel-edition');
    expect(submit).to.exist;
    expect(submit).to.have.trimmed.text('Save');
    expect(submit).to.not.have.attr('disabled');
    expect(cancel).to.exist;
    expect(cancel).to.have.trimmed.text('Cancel');
    expect(cancel).to.not.have.attr('disabled');
  });

  it(
    'renders disabled submit button when form becomes invalid in edit mode',
    async function () {
      const token = {
        name: 'token1',
        revoked: true,
      };
      this.set('token', token);

      await render(hbs `{{token-editor mode="edit" token=token}}`);

      await fillIn('.name-field input', '');
      expect(find('.submit-token')).to.have.attr('disabled');
    }
  );

  it(
    'calls injected onSubmit on submit click with empty diff object in edit mode',
    async function () {
      const token = {
        name: 'token1',
        revoked: true,
      };
      this.set('token', token);
      const submitStub = sinon.stub().resolves();
      this.set('submit', submitStub);

      await render(hbs `{{token-editor mode="edit" token=token onSubmit=(action submit)}}`);

      await click('.submit-token');
      expect(submitStub).to.be.calledOnce;
      expect(submitStub).to.be.calledWithMatch(v => Object.keys(v).length === 0);
    }
  );

  it(
    'calls injected onSubmit on submit click with diff object containing changed fields in edit mode',
    async function () {
      const token = {
        name: 'token1',
        revoked: true,
      };
      this.set('token', token);
      const submitStub = sinon.stub().resolves();
      this.set('submit', submitStub);

      await render(hbs `{{token-editor mode="edit" token=token onSubmit=(action submit)}}`);

      await fillIn('.name-field input', 'token2');
      await click('.revoked-field .one-way-toggle');
      await click('.submit-token');
      expect(submitStub).to.be.calledOnce;
      expect(submitStub).to.be.calledWithMatch({ name: 'token2', revoked: false });
    }
  );

  it(
    'disables all fields and shows spinner in submit button when submit promise is pending in edit mode',
    async function () {
      const token = {
        name: 'token1',
        revoked: true,
      };
      this.set('token', token);
      let submitResolve;
      const submitStub = sinon.stub()
        .returns(new Promise(resolve => submitResolve = resolve));
      this.set('submit', submitStub);
      await render(hbs `{{token-editor mode="edit" token=token onSubmit=(action submit)}}`);

      await click('.submit-token');
      expect(find('input:not([disabled])')).to.not.exist;
      expect(find('.submit-token [role="progressbar"]')).to.exist;
      expect(find('.cancel-edition')).to.have.attr('disabled');
      submitResolve();
      await settled();
      expect(find('input:not([disabled])')).to.exist;
      expect(find('.submit-token [role="progressbar"]')).to.not.exist;
      expect(find('.cancel-edition')).to.not.have.attr('disabled');
    }
  );

  it(
    'calls injected onCancel on cancel click in edit mode',
    async function () {
      const cancelSpy = sinon.spy();
      this.set('cancel', cancelSpy);

      await render(hbs `{{token-editor mode="edit" onCancel=(action cancel)}}`);

      await click('.cancel-edition');
      expect(cancelSpy).to.be.calledOnce;
    }
  );

  it(
    'prefills form with injected token in "create" mode (access token with all caveats)',
    async function () {
      const now = new Date();
      const token = {
        name: 'my token',
        typeName: 'access',
        caveats: [{
          type: 'time',
          validUntil: Math.floor(now.valueOf() / 1000),
        }, {
          type: 'geo.region',
          filter: 'blacklist',
          list: ['Europe'],
        }, {
          type: 'geo.country',
          filter: 'blacklist',
          list: ['PL'],
        }, {
          type: 'asn',
          whitelist: [3],
        }, {
          type: 'ip',
          whitelist: ['1.2.3.4/12'],
        }, {
          type: 'consumer',
          whitelist: [
            'usr-user1',
            'usr-usrunknown',
            'usr-*',
            'grp-group1',
            'grp-grpunknown',
            'grp-*',
            'prv-provider1',
            'prv-prvunknown',
            'prv-*',
          ],
        }, {
          type: 'service',
          whitelist: [
            'opw-provider0',
            'opw-prvunknown',
            'ozw-onezone',
            'opw-*',
            'opp-cluster1',
            'opp-prvpunknown',
            'ozp-onezone',
            'opp-*',
          ],
        }, {
          type: 'interface',
          interface: 'oneclient',
        }, {
          type: 'data.readonly',
        }, {
          type: 'data.path',
          whitelist: [
            'L3NwYWNlMS9hYmMvZGVm', // /space1/abc/def
            'L3NwYWNlMQ==', // /space1
          ],
        }, {
          type: 'data.objectid',
          whitelist: [
            'abc',
            'def',
          ],
        }],
      };
      this.set('token', token);

      await render(hbs `{{token-editor mode="create" token=token}}`);

      expect(getFieldElement('name').querySelector('input'))
        .to.have.value('my token');
      expect(getFieldElement('type').querySelector('.option-access input'))
        .to.have.property('checked', true);
      expect(areAllCaveatsExpanded()).to.be.true;
      expect(getFieldElement('expire').querySelector('input'))
        .to.have.value(moment(now).format('YYYY/MM/DD H:mm'));
      expect(getFieldElement('regionType')).to.contain.text('Deny');
      expect(getFieldElement('regionList')).to.contain.text('Europe');
      expect(getFieldElement('countryType')).to.contain.text('Deny');
      expect(getFieldElement('countryList')).to.contain.text('PL');
      expect(getFieldElement('asn')).to.contain.text('3');
      expect(getFieldElement('ip')).to.contain.text('1.2.3.4/12');
      const consumerCaveatText = getFieldElement('consumer').textContent;
      [
        'user1',
        'ID: usrunknown',
        'Any user',
        'group1',
        'ID: grpunknown',
        'Any group',
        'provider1',
        'ID: prvunknown',
        'Any Oneprovider',
      ].forEach(consumer => expect(consumerCaveatText).to.contain(consumer));
      const serviceCaveatText = getFieldElement('service').textContent;
      [
        'provider0',
        'ID: prvunknown',
        'onezone',
        'Any Oneprovider',
        'cluster1',
        'ID: prvpunknown',
        'cluster2',
        'Any Oneprovider Onepanel',
      ].forEach(service => expect(serviceCaveatText).to.contain(service));
      expect(
        getFieldElement('interface').querySelector('.option-oneclient input')
      ).to.have.property('checked', true);
      expectCaveatToggleState('readonly', true);
      const pathsFields = getFieldElement('path')
        .querySelectorAll('.pathEntry-field');
      expect(pathsFields).to.have.length(2);
      expect(pathsFields[0].querySelector('.pathSpace-field')).to.contain.text('space1');
      expect(pathsFields[0].querySelector('.pathString-field input')).to.have.value('/abc/def');
      expect(pathsFields[1].querySelector('.pathSpace-field')).to.contain.text('space1');
      expect(pathsFields[1].querySelector('.pathString-field input')).to.have.value('/');
      const objectIdsFields =
        getFieldElement('objectId').querySelectorAll('.objectIdEntry-field');
      expect(objectIdsFields).to.have.length(2);
      expect(objectIdsFields[0].querySelector('input')).to.have.value('abc');
      expect(objectIdsFields[1].querySelector('input')).to.have.value('def');
    }
  );

  it(
    'prefills form with injected token in "create" mode (invite token with no caveats)',
    async function () {
      const token = {
        name: 'my token',
        typeName: 'invite',
        inviteType: 'userJoinSpace',
        tokenTargetProxy: PromiseObject.create({
          promise: resolve(this.get('mockedRecords').space[0]),
        }),
      };
      this.set('token', token);

      await render(hbs `{{token-editor mode="create" token=token}}`);

      expect(getFieldElement('name').querySelector('input'))
        .to.have.value('my token');
      expect(getFieldElement('type').querySelector('.option-invite input'))
        .to.have.property('checked', true);
      expect(getFieldElement('inviteType'))
        .to.contain.text('Invite user to space');
      expect(getFieldElement('target')).to.contain.text('space2');
      expect(areAllCaveatsCollapsed()).to.be.true;
    }
  );
});

// class InviteTypeHelper extends EmberPowerSelectHelper {
//   constructor() {
//     super('.inviteType-field', '.ember-basic-dropdown-content');
//   }
// }

// class TargetHelper extends EmberPowerSelectHelper {
//   constructor() {
//     super('.target-field', '.ember-basic-dropdown-content');
//   }
// }

// class RegionTypeHelper extends EmberPowerSelectHelper {
//   constructor() {
//     super('.regionType-field', '.ember-basic-dropdown-content');
//   }
// }

// class CountryTypeHelper extends EmberPowerSelectHelper {
//   constructor() {
//     super('.countryType-field', '.ember-basic-dropdown-content');
//   }
// }

// class PathSpaceHelper extends EmberPowerSelectHelper {
//   constructor() {
//     super('.pathSpace-field', '.ember-basic-dropdown-content');
//   }
// }

function getTagsSelector() {
  return document.querySelector('.webui-popover.in .tags-selector');
}

// class TagsSelectorDropdownHelper extends EmberPowerSelectHelper {
//   constructor() {
//     super('.webui-popover.in .tags-selector .ember-basic-dropdown');
//   }
// }

const basicFieldNameToFieldPath = {
  name: 'basic.name',
  revoked: 'basic.revoked',
  tokenString: 'basic.tokenString',
  type: 'basic.type',
  inviteType: 'basic.inviteDetails.inviteType',
  target: 'basic.inviteDetails.inviteTargetDetails.target',
  privileges: 'basic.inviteDetails.inviteTargetDetails.invitePrivilegesDetails.privileges',
  usageLimit: 'basic.inviteDetails.usageLimit',
  usageCount: 'basic.inviteDetails.usageCount',
};

const caveatsWithAllowDenyMode = [
  'region',
  'country',
];

const caveatGroups = {
  expire: 'timeCaveats',
  region: 'geoCaveats',
  country: 'geoCaveats',
  asn: 'networkCaveats',
  ip: 'networkCaveats',
  consumer: 'endpointCaveats',
  service: 'endpointCaveats',
  interface: 'endpointCaveats',
  readonly: 'dataAccessCaveats',
  path: 'dataAccessCaveats',
  objectId: 'dataAccessCaveats',
};

function expectToBeValid(testCase, fieldName) {
  expectValidationState(testCase, fieldName, true);
}

function expectToBeInvalid(testCase, fieldName) {
  expectValidationState(testCase, fieldName, false);
}

function expectValidationState(testCase, fieldName, shouldBeValid) {
  const invalidFields = testCase.get('changeSpy').lastCall.args[0].invalidFields;
  const fieldPath = basicFieldNameToFieldPath[fieldName];
  let valuePath;
  if (fieldPath) {
    valuePath = fieldPath;
  } else {
    // Not found, probably a caveat field
    expect(invalidFields).to.not.include(caveatEnabledFieldPath(fieldName));
    valuePath = caveatValueValidationPath(fieldName);
  }
  const invalidField = invalidFields.filter(path => path.startsWith(valuePath));
  if (shouldBeValid) {
    expect(invalidField).to.be.empty;
  } else {
    expect(invalidField).to.not.be.empty;
  }
}

function caveatEnabledFieldPath(caveatName) {
  if (caveatGroups[caveatName]) {
    return `caveats.${caveatGroups[caveatName]}.${caveatName}Caveat.${caveatName}Enabled`;
  } else {
    return `caveats.${caveatName}Caveat.${caveatName}Enabled`;
  }
}

function caveatValueFieldPath(caveatName) {
  if (caveatGroups[caveatName]) {
    return `caveats.${caveatGroups[caveatName]}.${caveatName}Caveat.${caveatName}`;
  } else {
    return `caveats.${caveatName}Caveat.${caveatName}`;
  }
}

function caveatValueValidationPath(caveatName) {
  const path = caveatValueFieldPath(caveatName);
  return caveatsWithAllowDenyMode.includes(caveatName) ?
    `${path}.${caveatName}List` : path;
}

function expectToHaveValue(testCase, fieldName, value) {
  const fieldValuePath = `values.${basicFieldNameToFieldPath[fieldName]}`;
  expect(testCase.get('changeSpy').lastCall).to.have.been.calledWith(
    sinon.match.hasNested(fieldValuePath, value)
  );
}

function expectToHaveNoValue(testCase, fieldName) {
  const changeArg = testCase.get('changeSpy').lastCall.args[0];
  const fieldValuePath = `values.${basicFieldNameToFieldPath[fieldName]}`;
  expect(changeArg).to.have.nested.property(fieldValuePath, undefined);
}

function expectCaveatToHaveValue(
  testCase, caveatName, isEnabled, value = sinon.match.any
) {
  const lastCall = testCase.get('changeSpy').lastCall;
  const caveatValueValuePath = `values.${caveatValueFieldPath(caveatName)}`;
  expectCaveatToHaveEnabledState(testCase, caveatName, isEnabled);
  expect(lastCall).to.have.been.calledWith(
    sinon.match.hasNested(caveatValueValuePath, value)
  );
}

function expectCaveatToHaveEnabledState(testCase, caveatName, isEnabled) {
  const lastCall = testCase.get('changeSpy').lastCall;
  const caveatEnabledValuePath = `values.${caveatEnabledFieldPath(caveatName)}`;
  expect(lastCall).to.have.been.calledWith(
    sinon.match.hasNested(caveatEnabledValuePath, isEnabled)
  );
}

function expectLabelToEqual(fieldName, label, omitColon = false) {
  const isCaveat = !basicFieldNameToFieldPath[fieldName];
  const domFieldName = isCaveat ? `${fieldName}Enabled` : fieldName;
  label = (isCaveat || omitColon) ? label : `${label}:`;
  expect(find(`.${domFieldName}-field label`))
    .to.have.trimmed.text(label);
}

function expectCaveatToggleState(caveatName, isChecked) {
  const toggle = find(`.${caveatName}Enabled-field .one-way-toggle`);
  expect(toggle).to.exist;
  if (isChecked) {
    expect(toggle).to.have.class('checked');
  } else {
    expect(toggle).to.not.have.class('checked');
  }
}

function toggleCaveat(caveatName) {
  return click(`.${caveatName}Enabled-field .one-way-toggle`);
}

function toggleCaveatsSection() {
  return click('.caveats-expand');
}

function getFieldElement(fieldName) {
  return find(`.${fieldName}-field`);
}

function isCaveatExpanded(caveatName) {
  return find(`.${caveatName}Caveat-field > .field-component > .fields-group-collapse`)
    .matches('.in');
}

function areAllCaveatsExpanded() {
  return findAll('.caveat-group > .field-component > .fields-group-collapse:not(.in)')
    .length === 0;
}

function areAllCaveatsCollapsed() {
  return findAll('.caveat-group > .field-component > .fields-group-collapse.in')
    .length === 0;
}
