import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { fillIn, click, focus, blur } from 'ember-native-dom-helpers';
import EmberPowerSelectHelper from '../../helpers/ember-power-select-helper';
import OneDatetimePickerHelper from '../../helpers/one-datetime-picker';
import $ from 'jquery';
import wait from 'ember-test-helpers/wait';
import _ from 'lodash';
import { lookupService } from '../../helpers/stub-service';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { resolve, reject, Promise } from 'rsvp';
import moment from 'moment';
import { set } from '@ember/object';
import OneTooltipHelper from '../../helpers/one-tooltip';

const tokenInviteTypes = [{
  inviteType: 'userJoinGroup',
  label: 'Invite user to group',
  icon: 'group',
  targetModelName: 'group',
  targetPlaceholder: 'Select group...',
  tokenName: /Inv\. usr\. grp\..*/,
}, {
  inviteType: 'groupJoinGroup',
  label: 'Invite group to parent group',
  icon: 'group',
  targetModelName: 'group',
  targetPlaceholder: 'Select parent group...',
  tokenName: /Inv\. grp\. grp\..*/,
}, {
  inviteType: 'userJoinSpace',
  label: 'Invite user to space',
  icon: 'space',
  targetModelName: 'space',
  targetPlaceholder: 'Select space...',
  tokenName: /Inv\. usr\. spc\..*/,
}, {
  inviteType: 'groupJoinSpace',
  label: 'Invite group to space',
  icon: 'space',
  targetModelName: 'space',
  targetPlaceholder: 'Select space...',
  tokenName: /Inv\. grp\. spc\..*/,
}, {
  inviteType: 'harvesterJoinSpace',
  label: 'Invite harvester to space',
  icon: 'space',
  targetModelName: 'space',
  targetPlaceholder: 'Select space...',
  noPrivileges: true,
  tokenName: /Inv\. hrv\. spc\..*/,
}, {
  inviteType: 'userJoinCluster',
  label: 'Invite user to cluster',
  icon: 'cluster',
  targetModelName: 'cluster',
  targetPlaceholder: 'Select cluster...',
  tokenName: /Inv\. usr\. cls\..*/,
}, {
  inviteType: 'groupJoinCluster',
  label: 'Invite group to cluster',
  icon: 'cluster',
  targetModelName: 'cluster',
  targetPlaceholder: 'Select cluster...',
  tokenName: /Inv\. grp\. cls\..*/,
}, {
  inviteType: 'userJoinHarvester',
  label: 'Invite user to harvester',
  icon: 'light-bulb',
  targetModelName: 'harvester',
  targetPlaceholder: 'Select harvester...',
  tokenName: /Inv\. usr\. hrv\..*/,
}, {
  inviteType: 'groupJoinHarvester',
  label: 'Invite group to harvester',
  icon: 'light-bulb',
  targetModelName: 'harvester',
  targetPlaceholder: 'Select harvester...',
  tokenName: /Inv\. grp\. hrv\..*/,
}, {
  inviteType: 'spaceJoinHarvester',
  label: 'Invite space to harvester',
  icon: 'light-bulb',
  targetModelName: 'harvester',
  targetPlaceholder: 'Select harvester...',
  noPrivileges: true,
  tokenName: /Inv\. spc\. hrv\..*/,
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
  isEnabledByDefault: true,
  dontTestValue: true,
}, {
  name: 'readonly',
  label: 'Read only',
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
  setupComponentTest('token-editor', {
    integration: true,
  });

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
    ].forEach(modelName => {
      onedataGraphStub.withArgs({
        gri: `${modelName}.null.privileges:private`,
        operation: 'get',
        subscribe: false,
      }).resolves({ member: [`${modelName}_view`] });
      mockedRecords[modelName] = _.reverse(_.range(3)).map(index => ({
        entityId: `${modelName}${index}`,
        entityType: modelName,
        name: `${modelName}${index}`,
        constructor: {
          modelName,
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
    mockedRecords['cluster'].forEach(cluster => cluster.type = 'oneprovider');
    const ozCluster = mockedRecords['cluster'][0];
    ozCluster.type = 'onezone';
    set(lookupService(this, 'gui-context'), 'clusterId', ozCluster.entityId);
    const changeSpy = sinon.spy();
    this.on('change', changeSpy);
    this.setProperties({
      changeSpy,
      mockedRecords,
      currentUser,
    });
  });

  it('has class "token-editor"', function () {
    this.render(hbs `{{token-editor}}`);

    expect(this.$('.token-editor')).to.exist;
  });

  it('renders "name" field', function () {
    this.render(hbs `{{token-editor mode="create"}}`);

    return wait().then(() => {
      expectLabelToEqual(this, 'name', 'Name');
      expect(this.$('.name-field input')).to.exist;
    });
  });

  it('has not valid "name" when it is empty', function () {
    this.render(hbs `{{token-editor mode="create" onChange=(action "change")}}`);

    return wait()
      .then(() => fillIn('.name-field input', ''))
      .then(() => {
        expectToHaveValue(this, 'name', '');
        expectToBeInvalid(this, 'name');
      });
  });

  it('has valid "name" when it has been changed to not empty value', function () {
    this.render(hbs `{{token-editor mode="create" onChange=(action "change")}}`);

    return wait()
      .then(() => fillIn('.name-field input', 'abc'))
      .then(() => {
        expectToHaveValue(this, 'name', 'abc');
        expectToBeValid(this, 'name');
      });
  });

  it('renders "type" field', function () {
    this.render(hbs `{{token-editor mode="create"}}`);

    return wait()
      .then(() => {
        expectLabelToEqual(this, 'type', 'Type');
        [
          'access',
          'identity',
          'invite',
        ].forEach(type =>
          expect(this.$(`.type-field .option-${type}`).text().trim())
          .to.equal(_.upperFirst(type))
        );
      });
  });

  it(
    'has "type" field with preselected "access" option and corresponding autogenerated name',
    function () {
      this.render(hbs `{{token-editor mode="create" onChange=(action "change")}}`);

      return wait()
        .then(() => {
          expectToHaveValue(this, 'type', 'access');
          expectToBeValid(this, 'type');
          expect(this.$('.type-field .option-access input').prop('checked')).to.be.true;
          expectToHaveValue(this, 'name', sinon.match(/Access .+/));
          expectToBeValid(this, 'name');
        });
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
      function () {
        this.render(hbs `{{token-editor mode="create" onChange=(action "change")}}`);

        return wait()
          .then(() => click(`.type-field .option-${type}`))
          .then(() => {
            expectToHaveValue(this, 'type', type);
            expectToBeValid(this, 'type');
            expectToHaveValue(this, 'name', sinon.match(newName));
            expectToBeValid(this, 'name');
          });
      }
    );
  });

  it(
    'marking name field as modified stops updating by name autogenerator',
    function () {
      this.render(hbs `{{token-editor mode="create" onChange=(action "change")}}`);

      return wait()
        .then(() => focus('.name-field input'))
        .then(() => blur('.name-field input'))
        .then(() => click('.type-field .option-invite'))
        .then(() => expectToHaveValue(this, 'name', sinon.match(/Access .*/)));
    }
  );

  [
    'access',
    'identity',
  ].forEach(type => {
    it(
      `does not show invitation related basic fields if "type" is "${type}"`,
      function () {
        this.render(hbs `{{token-editor mode="create"}}`);

        return wait()
          .then(() => click(`.type-field .option-${type}`))
          .then(() =>
            expect(this.$('.inviteDetails-collapse')).to.not.have.class('in')
          );
      }
    );
  });

  it(
    'shows invitation related basic fields only if "type" is "invite"',
    function () {
      this.render(hbs `{{token-editor mode="create"}}`);

      return wait()
        .then(() => click('.type-field .option-invite'))
        .then(() => expect(this.$('.inviteDetails-collapse')).to.have.class('in'));
    }
  );

  it('renders "inviteType" field', function () {
    this.render(hbs `{{token-editor mode="create"}}`);

    const inviteTypeHelper = new InviteTypeHelper();

    return wait()
      .then(() => click('.type-field .option-invite'))
      .then(() => {
        expectLabelToEqual(this, 'inviteType', 'Invite type');
        return inviteTypeHelper.open();
      })
      .then(() => {
        tokenInviteTypes.forEach(({ label, icon }, index) => {
          const $option = $(inviteTypeHelper.getNthOption(index + 1));
          expect($option.text().trim()).to.equal(label);
          expect($option.find('.one-icon')).to.have.class(`oneicon-${icon}`);
        });
      });
  });

  it(
    `has "inviteType" field with preselected "${preselectedInviteType.label}" option`,
    function () {
      this.render(hbs `{{token-editor mode="create" onChange=(action "change")}}`);

      return wait()
        .then(() => click('.type-field .option-invite'))
        .then(() => {
          expectToHaveValue(this, 'inviteType', preselectedInviteType.inviteType);
          expectToBeValid(this, 'inviteType');
          const $dropdownTrigger = $(new InviteTypeHelper().getTrigger());
          expect($dropdownTrigger.text().trim()).to.equal(preselectedInviteType.label);
        });
    }
  );

  it(
    'does not inform about invalid "target" field when it is hidden',
    function () {
      this.render(hbs `{{token-editor mode="create" onChange=(action "change")}}`);

      return wait()
        .then(() => expectToBeValid(this, 'target'));
    }
  );

  it(
    'has not valid "target" field when it is empty',
    function () {
      this.render(hbs `{{token-editor mode="create" onChange=(action "change")}}`);

      return wait()
        .then(() => click('.type-field .option-invite'))
        .then(() => {
          expectToHaveNoValue(this, 'target');
          expectToBeInvalid(this, 'target');
        });
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
  }, index) => {
    it(
      `notifies about "inviteType" field change to "${label}" and changes autogenerated name`,
      function () {
        this.render(hbs `{{token-editor mode="create" onChange=(action "change")}}`);

        const inviteTypeHelper = new InviteTypeHelper();

        return wait()
          .then(() => click('.type-field .option-invite'))
          .then(() => inviteTypeHelper.selectOption(index + 1))
          .then(() => {
            expectToHaveValue(this, 'inviteType', inviteType);
            expectToBeValid(this, 'inviteType');
            expectToHaveValue(this, 'name', sinon.match(tokenName));
            expectToBeValid(this, 'name');
          });
      }
    );

    if (targetModelName) {
      it(
        `shows correct "target" field when "inviteType" field is "${label}"`,
        function () {
          this.render(hbs `{{token-editor mode="create"}}`);

          const targetHelper = new TargetHelper();
          return wait()
            .then(() => click('.type-field .option-invite'))
            .then(() => new InviteTypeHelper().selectOption(index + 1))
            .then(() => {
              const $collapse = this.$('.inviteTargetDetails-collapse');
              const $placeholder =
                this.$('.target-field .ember-power-select-placeholder');
              expect($collapse).to.have.class('in');
              expectLabelToEqual(this, 'target', '', true);
              expect($placeholder.text().trim()).to.equal(targetPlaceholder);
              return targetHelper.open();
            })
            .then(() => {
              const $thirdOption = $(targetHelper.getNthOption(3));
              expect($thirdOption).to.exist;
              expect(targetHelper.getNthOption(4)).to.not.exist;
              expect($thirdOption.find('.one-icon')).to.have.class(`oneicon-${icon}`);
              expect($thirdOption.find('.text').text().trim())
                .to.equal(`${targetModelName}2`);
            });
        }
      );

      it(
        `notifies about "target" field change when "inviteType" field is "${label}"`,
        function () {
          this.render(hbs `{{token-editor mode="create" onChange=(action "change")}}`);

          return wait()
            .then(() => click('.type-field .option-invite'))
            .then(() => new InviteTypeHelper().selectOption(index + 1))
            .then(() => new TargetHelper().selectOption(1))
            .then(() => {
              const selectedTarget =
                this.get(`mockedRecords.${targetModelName}.lastObject`);
              expectToHaveValue(this, 'target', selectedTarget);
              expectToBeValid(this, 'target');
              expectToHaveValue(
                this,
                'name',
                sinon.match(tokenName).and(name => name.includes(selectedTarget.name))
              );
              expectToBeValid(this, 'name');
            });
        }
      );

      if (!noPrivileges) {
        it(
          `shows correct privileges field when "inviteType" field is "${label}"`,
          function () {
            this.render(hbs `{{token-editor mode="create"}}`);

            return wait()
              .then(() => click('.type-field .option-invite'))
              .then(() => new InviteTypeHelper().selectOption(index + 1))
              .then(() => {
                expect(this.$('.invitePrivilegesDetails-collapse'))
                  .to.have.class('in');
                expectLabelToEqual(this, 'privileges', 'Privileges');
                expect(
                  this.$('.privileges-field .node-text').eq(0).text().trim()
                ).to.equal(`${_.upperFirst(targetModelName)} management`);
                expect(this.$(
                  `.node-text:contains(View ${targetModelName}) + .form-group .one-way-toggle`
                )).to.have.class('checked');
                expect(this.$('.privileges-field .one-way-toggle.checked'))
                  .to.have.length(1);
                return new OneTooltipHelper('.privileges-field .one-label-tip .oneicon')
                  .getText();
              })
              .then(tooltipText => expect(tooltipText).to.equal(
                'These privileges will be granted to a new member after joining with this invite token.'
              ));
          }
        );

        it(
          `notifies about "privileges" field change when "inviteType" field is "${label}"`,
          function () {
            this.render(hbs `{{token-editor mode="create" onChange=(action "change")}}`);

            return wait()
              .then(() => click('.type-field .option-invite'))
              .then(() => new InviteTypeHelper().selectOption(index + 1))
              .then(() => click(this.$(
                `.node-text:contains(Modify ${targetModelName}) + .form-group .one-way-toggle`
              )[0]))
              .then(() => {
                expectToHaveValue(this, 'privileges', [
                  `${targetModelName}_view`,
                  `${targetModelName}_update`,
                ]);
                expectToBeValid(this, 'privileges');
              });
          }
        );
      } else {
        it(
          `does not show privileges when "inviteType" field is "${label}"`,
          function () {
            this.render(hbs `{{token-editor mode="create" onChange=(action "change")}}`);

            return wait()
              .then(() => click('.type-field .option-invite'))
              .then(() => new InviteTypeHelper().selectOption(index + 1))
              .then(() => {
                expect(this.$('.invitePrivilegesDetails-collapse'))
                  .to.not.have.class('in');
              });
          }
        );
      }
    } else {
      it(
        `does not show invite target details when "inviteType" field is "${label}"`,
        function () {
          this.render(hbs `{{token-editor mode="create" onChange=(action "change")}}`);

          return wait()
            .then(() => click('.type-field .option-invite'))
            .then(() => new InviteTypeHelper().selectOption(index + 1))
            .then(() => {
              expect(this.$('.inviteTargetDetails-collapse'))
                .to.not.have.class('in');
            });
        }
      );
    }
  });

  it(
    'resets "target" field after change to inviteType which requires different model',
    function () {
      this.render(hbs `{{token-editor mode="create" onChange=(action "change")}}`);

      return wait()
        .then(() => click('.type-field .option-invite'))
        .then(() => new TargetHelper().selectOption(1))
        .then(() => new InviteTypeHelper().selectOption(3))
        .then(() => expectToHaveNoValue(this, 'target'));
    }
  );

  it('renders "usageLimit" field', function () {
    this.render(hbs `{{token-editor mode="create"}}`);

    return wait()
      .then(() => click('.type-field .option-invite'))
      .then(() => {
        expectLabelToEqual(this, 'usageLimit', 'Usage limit');
        expect(this.$('.usageLimit-field .control-label').text().trim())
          .to.equal('Usage limit:');
        expect(this.$('.usageLimit-field .option-infinity').text().trim())
          .to.equal('infinity');
        expect(this.$('.usageLimit-field .option-number').text().trim())
          .to.equal('');
      });
  });

  it(
    'has "usageLimit" field with preselected "infinity" option and disabled number input',
    function () {
      this.render(hbs `{{token-editor mode="create" onChange=(action "change")}}`);

      return wait()
        .then(() => click('.type-field .option-invite'))
        .then(() => {
          expectToHaveValue(this, 'usageLimit', sinon.match({
            usageLimitType: 'infinity',
          }));
          expectToBeValid(this, 'usageLimit');
          expect(this.$('.usageLimit-field .option-infinity input'))
            .to.have.prop('checked');
          expect(this.$('.usageLimit-field .usageLimitNumber-field input'))
            .to.have.attr('disabled');
        });
    }
  );

  it(
    'notifies about empty limit input error when usageLimit is set to use number',
    function () {
      this.render(hbs `{{token-editor mode="create" onChange=(action "change")}}`);

      return wait()
        .then(() => click('.type-field .option-invite'))
        .then(() => click('.usageLimit-field .option-number'))
        .then(() => {
          expectToHaveValue(this, 'usageLimit', sinon.match({
            usageLimitType: 'number',
          }));
          expectToBeInvalid(this, 'usageLimit');
        });
    }
  );

  it(
    'notifies about correct limit input value when usageLimit is set to use number',
    function () {
      this.render(hbs `{{token-editor mode="create" onChange=(action "change")}}`);

      return wait()
        .then(() => click('.type-field .option-invite'))
        .then(() => click('.usageLimit-field .option-number'))
        .then(() => fillIn('.usageLimitNumber-field input', '1'))
        .then(() => {
          expectToHaveValue(this, 'usageLimit', sinon.match({
            usageLimitType: 'number',
            usageLimitNumber: '1',
          }));
          expectToBeValid(this, 'usageLimit');
        });
    }
  );

  it(
    'notifies about too low limit input error when usageLimit is set to use number',
    function () {
      this.render(hbs `{{token-editor mode="create" onChange=(action "change")}}`);

      return wait()
        .then(() => click('.type-field .option-invite'))
        .then(() => click('.usageLimit-field .option-number'))
        .then(() => fillIn('.usageLimitNumber-field input', '0'))
        .then(() => {
          expectToHaveValue(this, 'usageLimit', sinon.match({
            usageLimitType: 'number',
            usageLimitNumber: '0',
          }));
          expectToBeInvalid(this, 'usageLimit');
        });
    }
  );

  it(
    'has expanded caveats section on init by default',
    function () {
      this.render(hbs `{{token-editor mode="create"}}`);

      return wait()
        .then(() => expect(this.$('.caveats-collapse')).to.have.class('in'));
    }
  );

  it(
    'has collapsed caveats section on init when expandCaveats is false',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=false}}`);

      return wait()
        .then(() => expect(this.$('.caveats-collapse')).to.not.have.class('in'));
    }
  );

  it(
    'has expanded caveats section on init when expandCaveats is true',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true}}`);

      return wait()
        .then(() => expect(this.$('.caveats-collapse')).to.have.class('in'));
    }
  );

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
      function () {
        this.render(hbs `{{token-editor mode="create" expandCaveats=true}}`);

        return wait()
          .then(() => (isEnabledByDefault ? toggleCaveat(name) : resolve()))
          .then(() => {
            const $disabledDescription = this.$(`.${name}DisabledText-field`);

            expectCaveatToggleState(this, name, false);
            expectLabelToEqual(this, name, label);
            expect(getFieldElement(this, name)).to.not.exist;
            expect($disabledDescription.text().trim()).to.equal(disabledDescription);
            return new OneTooltipHelper(`.${name}Caveat-field .one-label-tip .oneicon`)
              .getText().then(text => expect(text).to.equal(tip));
          });
      }
    );

    it(
      `has valid and ${isEnabledByDefault ? 'enabled' : 'disabled'} ${name} caveat on init`,
      function () {
        this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

        return wait()
          .then(() => {
            expectToBeValid(this, name);
            if (!dontTestValue) {
              expectCaveatToHaveValue(this, name, Boolean(isEnabledByDefault));
            } else {
              expectCaveatToHaveEnabledState(this, name, Boolean(isEnabledByDefault));
            }
          });
      }
    );

    if (!isEnabledByDefault) {
      it(
        `hides disabled description and shows form field on ${name} caveat toggle change`,
        function () {
          this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

          return wait()
            .then(() => toggleCaveat(name))
            .then(() => {
              expectCaveatToggleState(this, name, true);
              expect(this.$(`.${name}DisabledText-field`)).to.not.exist;

              if (!dontTestValue) {
                expect(getFieldElement(this, name)).to.exist;
                expectCaveatToHaveValue(this, name, true);
              } else {
                expectCaveatToHaveEnabledState(this, name, true);
              }
            });
        }
      );
    }
  });

  it(
    'renders expire caveat form elements when that caveat is enabled',
    function () {
      const tomorrow = moment().add(1, 'day').endOf('day');
      const dayAfterTomorrow = moment(tomorrow).add(1, 'day');

      this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('expire'))
        .then(() => {
          expectCaveatToHaveValue(this, 'expire', true, sinon.match(value =>
            tomorrow.isSame(value) || dayAfterTomorrow.isSame(value)
          ));
          expectToBeValid(this, 'expire');
        });
    }
  );

  it(
    'notifies about expire caveat change',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

      let oldExpire;
      return wait()
        .then(() => toggleCaveat('expire'))
        .then(() => {
          oldExpire =
            this.get('changeSpy').lastCall.args[0].values.caveats.expireCaveat.expire;
          return new OneDatetimePickerHelper(this.$('.expire-field input')).selectToday();
        })
        .then(() => {
          expectCaveatToHaveValue(this, 'expire', true, sinon.match(value =>
            !moment(oldExpire).isSame(value)
          ));
          expectToBeValid(this, 'expire');
        });
    }
  );

  it(
    'renders interface caveat form elements when that caveat is enabled',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('interface'))
        .then(() => {
          const $restOption = this.$('.option-rest');
          const $oneclientOption = this.$('.option-oneclient');
          expect($restOption).to.exist;
          expect($restOption.text().trim()).to.equal('REST');
          expect($oneclientOption).to.exist;
          expect($oneclientOption.text().trim()).to.equal('Oneclient');

          expectCaveatToHaveValue(this, 'interface', true, 'rest');
          expectToBeValid(this, 'interface');
        });
    }
  );

  it(
    'notifies about interface caveat change',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('interface'))
        .then(() => click('.option-oneclient'))
        .then(() => {
          expectCaveatToHaveValue(this, 'interface', true, 'oneclient');
          expectToBeValid(this, 'interface');
          return click('.option-rest');
        })
        .then(() => {
          expectCaveatToHaveValue(this, 'interface', true, 'rest');
          expectToBeValid(this, 'interface');
        });
    }
  );

  [
    'asn',
    'ip',
  ].forEach(caveatName => {
    it(
      `renders empty, invalid ${caveatName} caveat when it is enabled`,
      function () {
        this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

        return wait()
          .then(() => toggleCaveat(caveatName))
          .then(() => {
            expectCaveatToHaveValue(this, caveatName, true, sinon.match([]));
            expectToBeInvalid(this, caveatName);
          });
      }
    );
  });

  it(
    'notifies about asn caveat change',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('asn'))
        .then(() => click('.asn-field .tags-input'))
        .then(() => fillIn('.asn-field .text-editor-input', '123,2,123,'))
        .then(() => {
          expectCaveatToHaveValue(this, 'asn', true, [2, 123]);
          expectToBeValid(this, 'asn');
        });
    }
  );

  it(
    'not allows to input invalid asn',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('asn'))
        .then(() => click('.asn-field .tags-input'))
        .then(() => fillIn('.asn-field .text-editor-input', 'abc,'))
        .then(() => {
          expectCaveatToHaveValue(this, 'asn', true, sinon.match([]));
          expectToBeInvalid(this, 'asn');
        });
    }
  );

  it(
    'notifies about ip caveat change',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('ip'))
        .then(() => click('.ip-field .tags-input'))
        .then(() => fillIn(
          '.ip-field .text-editor-input',
          '1.1.1.1/24,1.1.1.1/23,1.1.1.1,255.255.255.255,1.1.1.1/24,'
        ))
        .then(() => {
          expectCaveatToHaveValue(this, 'ip', true, [
            '1.1.1.1',
            '1.1.1.1/23',
            '1.1.1.1/24',
            '255.255.255.255',
          ]);
          expectToBeValid(this, 'ip');
        });
    }
  );

  it(
    'not allows to input invalid ip',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('ip'))
        .then(() => click('.ip-field .tags-input'))
        .then(() => fillIn('.ip-field .text-editor-input', '123.123.123.123/33,'))
        .then(() => {
          expectCaveatToHaveValue(this, 'ip', true, sinon.match([]));
          expectToBeInvalid(this, 'ip');
        });
    }
  );

  it(
    'renders empty, invalid region caveat when it is enabled',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('region'))
        .then(() => {
          expectCaveatToHaveValue(this, 'region', true,
            sinon.match.has('regionList', sinon.match([])));
          expectCaveatToHaveValue(this, 'region', true,
            sinon.match.has('regionType', 'whitelist'));
          expectToBeInvalid(this, 'region');
        });
    }
  );

  regions.forEach(({ label, value }) => {
    it(
      `notifies about region caveat change to ["${value}"]`,
      function () {
        this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

        return wait()
          .then(() => toggleCaveat('region'))
          .then(() => click('.region-field .tags-input'))
          .then(() => click(
            getTagsSelector().find(`.selector-item:contains(${label})`)[0]
          ))
          .then(() => {
            expectCaveatToHaveValue(this, 'region', true,
              sinon.match.has('regionList', sinon.match([value])));
            expectToBeValid(this, 'region');
          });
      }
    );
  });

  it(
    'notifies about region caveat type change to "deny"',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

      let regionTypeHelper;
      return wait()
        .then(() => toggleCaveat('region'))
        .then(() => {
          regionTypeHelper = new RegionTypeHelper();
          return regionTypeHelper.selectOption(2);
        })
        .then(() => {
          expect(regionTypeHelper.getTrigger().innerText).to.equal('Deny');
          expectCaveatToHaveValue(this, 'region', true,
            sinon.match.has('regionType', 'blacklist'));
          expectToBeInvalid(this, 'region');
        });
    }
  );

  it(
    'sorts tags in region caveat input',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('region'))
        .then(() => click('.region-field .tags-input'))
        .then(() => click(
          getTagsSelector().find('.selector-item:contains("Europe")')[0]
        ))
        .then(() => click(
          getTagsSelector().find('.selector-item:contains("Asia")')[0]
        ))
        .then(() => {
          expectCaveatToHaveValue(this, 'region', true,
            sinon.match.has('regionList', sinon.match([
              'Asia',
              'Europe',
            ]))
          );
          expectToBeValid(this, 'region');
        });
    }
  );

  it(
    'renders empty, invalid country caveat when it is enabled',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('country'))
        .then(() => {
          expectCaveatToHaveValue(this, 'country', true,
            sinon.match.has('countryList', sinon.match([])));
          expectCaveatToHaveValue(this, 'country', true,
            sinon.match.has('countryType', 'whitelist'));
          expectToBeInvalid(this, 'country');
          return click('.country-field .tags-input');
        })
        .then(() =>
          expect(this.$('.country-field .text-editor-input').attr('placeholder'))
          .to.equal('Example: PL')
        );
    }
  );

  it(
    'notifies about country caveat change',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('country'))
        .then(() => click('.country-field .tags-input'))
        .then(() => fillIn('.country-field .text-editor-input', 'pl,cz,pl,DK,dk,'))
        .then(() => {
          expectCaveatToHaveValue(this, 'country', true,
            sinon.match.has('countryList', ['CZ', 'DK', 'PL']));
          expectToBeValid(this, 'country');
        });
    }
  );

  it(
    'not allows to input invalid country',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('country'))
        .then(() => click('.country-field .tags-input'))
        .then(() => fillIn('.country-field .text-editor-input', 'a1,usa,b,a_,'))
        .then(() => {
          expectCaveatToHaveValue(this, 'country', true,
            sinon.match.has('countryList', []));
          expectToBeInvalid(this, 'country');
        });
    }
  );

  it(
    'notifies about country caveat type change to "deny"',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

      let countryTypeHelper;
      return wait()
        .then(() => toggleCaveat('country'))
        .then(() => {
          countryTypeHelper = new CountryTypeHelper();
          return countryTypeHelper.selectOption(2);
        })
        .then(() => {
          expect(countryTypeHelper.getTrigger().innerText).to.equal('Deny');
          expectCaveatToHaveValue(this, 'country', true,
            sinon.match.has('countryType', 'blacklist'));
          expectToBeInvalid(this, 'country');
        });
    }
  );

  it(
    'renders empty, invalid consumer caveat when it is enabled',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('consumer'))
        .then(() => {
          expectCaveatToHaveValue(this, 'consumer', true, []);
          expectToBeInvalid(this, 'consumer');
        });
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
  }].forEach(({ model, name, list }, index) => {
    it(
      `shows ${model} list in consumer caveat`,
      function () {
        this.render(hbs `{{token-editor mode="create" expandCaveats=true}}`);

        let typeSelectorHelper;
        return wait()
          .then(() => toggleCaveat('consumer'))
          .then(() => click('.consumer-field .tags-input'))
          .then(() => {
            typeSelectorHelper = new TagsSelectorDropdownHelper();
            return typeSelectorHelper.selectOption(index + 1);
          })
          .then(() => {
            expect(typeSelectorHelper.getTrigger().innerText.trim()).to.equal(name);
            const $selectorItems = getTagsSelector().find('.selector-item');
            expect($selectorItems).to.have.length(list.length + 1);
            list.forEach(recordName => {
              expect($selectorItems.filter(`:contains(${recordName})`)).to.exist;
            });
          });
      }
    );
  });

  it('notifies about adding new consumer in consumer caveat', function () {
    this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

    return wait()
      .then(() => toggleCaveat('consumer'))
      .then(() => click('.consumer-field .tags-input'))
      .then(() => click(getTagsSelector().find('.record-item')[0]))
      .then(() => {
        expectCaveatToHaveValue(this, 'consumer', true, [{
          model: 'user',
          record: this.get('currentUser'),
        }]);
        expectToBeValid(this, 'consumer');
      });
  });

  [
    'user',
    'group',
    'provider',
  ].forEach((typeName, index) => {
    it(
      `removes concrete ${typeName} tags when "all" ${typeName} tag has been selected in consumer caveat`,
      function () {
        this.render(hbs `{{token-editor mode="create" expandCaveats=true}}`);

        return wait()
          .then(() => toggleCaveat('consumer'))
          .then(() => click('.consumer-field .tags-input'))
          .then(() => new TagsSelectorDropdownHelper().selectOption(index + 1))
          .then(() => click(getTagsSelector().find('.record-item')[0]))
          .then(() => click(getTagsSelector().find('.record-item')[0]))
          .then(() => {
            expect(getFieldElement(this, 'consumer').find('.tag-item')).to.have.length(2);
            return click(getTagsSelector().find('.all-item')[0]);
          })
          .then(() => {
            const $tagItems = getFieldElement(this, 'consumer').find('.tag-item');
            expect($tagItems).to.have.length(1);
            expect($tagItems.text()).to.contain('Any');
          });
      }
    );
  });

  it('sorts selected tags in consumer caveat', function () {
    this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

    return wait()
      .then(() => toggleCaveat('consumer'))
      .then(() => click('.consumer-field .tags-input'))
      .then(() => click(getTagsSelector().find('.record-item')[1]))
      .then(() => click(getTagsSelector().find('.record-item')[0]))
      .then(() => {
        const $tagItems = getFieldElement(this, 'consumer').find('.tag-item');
        expect($tagItems.eq(0).text().trim()).to.equal('currentuser');
        expect($tagItems.eq(1).text().trim()).to.equal('group0user');
      });
  });

  it(
    'renders valid service caveat with "Any Oneprovider" preselected on init',
    function () {
      this.render(hbs `
        {{token-editor mode="create" expandCaveats=true onChange=(action "change")}}
      `);

      return wait()
        .then(() => {
          expectCaveatToHaveValue(this, 'service', true, sinon.match([
            sinon.match({
              record: sinon.match({ representsAll: 'service' }),
              model: 'service',
            }),
          ]));
          expectToBeValid(this, 'service');
        });
    }
  );

  [
    'service',
    'service onepanel',
  ].forEach((typeName, index) => {
    it(
      `shows ${typeName} list in service caveat`,
      function () {
        this.render(hbs `{{token-editor mode="create" expandCaveats=true}}`);

        let typeSelectorHelper;
        return wait()
          // Remove tag to clean default
          .then(() => click('.service-field .tags-input .tag-remove'))
          .then(() => click('.service-field .tags-input'))
          .then(() => {
            typeSelectorHelper = new TagsSelectorDropdownHelper();
            return typeSelectorHelper.selectOption(index + 1);
          }).then(() => {
            expect(typeSelectorHelper.getTrigger().innerText.trim())
              .to.equal(_.startCase(typeName));
            const $selectorItems = getTagsSelector().find('.selector-item');
            expect($selectorItems).to.have.length(4);
            // 3 because one selector-item is an "all" item
            _.times(3, i => {
              expect($selectorItems.filter(`:contains(cluster${i})`)).to.exist;
            });
          });
      }
    );
  });

  it('notifies about adding new service in service caveat', function () {
    this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

    return wait()
      // Remove tag to clean default
      .then(() => click('.service-field .tags-input .tag-remove'))
      .then(() => click('.service-field .tags-input'))
      .then(() => click(getTagsSelector().find('.record-item')[0]))
      .then(() => {
        expectCaveatToHaveValue(this, 'service', true, [{
          model: 'service',
          record: this.get('mockedRecords.cluster')[2],
        }]);
        expectToBeValid(this, 'service');
      });
  });

  [
    'service',
    'service onepanel',
  ].forEach((typeName, index) => {
    it(
      `removes concrete ${typeName} tags when "all" ${typeName} tag has been selected in service caveat`,
      function () {
        this.render(hbs `{{token-editor mode="create" expandCaveats=true}}`);

        return wait()
          // Remove tag to clean default
          .then(() => click('.service-field .tags-input .tag-remove'))
          .then(() => click('.service-field .tags-input'))
          .then(() => new TagsSelectorDropdownHelper().selectOption(index + 1))
          .then(() => click(getTagsSelector().find('.record-item')[0]))
          .then(() => click(getTagsSelector().find('.record-item')[0]))
          .then(() => {
            expect(getFieldElement(this, 'service').find('.tag-item')).to.have.length(2);
            return click(getTagsSelector().find('.all-item')[0]);
          })
          .then(() => {
            const $tagItems = getFieldElement(this, 'service').find('.tag-item');
            expect($tagItems).to.have.length(1);
            expect($tagItems.text()).to.contain('Any');
          });
      }
    );
  });

  it('sorts selected tags in service caveat', function () {
    this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

    return wait()
      // Remove tag to clean default
      .then(() => click('.service-field .tags-input .tag-remove'))
      .then(() => click('.service-field .tags-input'))
      .then(() => click(getTagsSelector().find('.record-item')[1]))
      .then(() => click(getTagsSelector().find('.record-item')[0]))
      .then(() => {
        const $tagItems = getFieldElement(this, 'service').find('.tag-item');
        expect($tagItems.eq(0).text().trim()).to.equal('cluster0');
        expect($tagItems.eq(1).text().trim()).to.equal('cluster1');
      });
  });

  it(
    'renders empty, valid path caveat when it is enabled',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('path'))
        .then(() => {
          expectCaveatToHaveValue(this, 'path', true,
            sinon.match.has('__fieldsValueNames', sinon.match([])));
          expectToBeValid(this, 'path');
        });
    }
  );

  it(
    'preselects first available space and path "" with placeholder for new entry in path caveat',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('path'))
        .then(() => click(getFieldElement(this, 'path').find('.add-field-button')[0]))
        .then(() => {
          const selectedSpace = this.get('mockedRecords.space.lastObject');
          expectCaveatToHaveValue(this, 'path', true,
            sinon.match.hasNested('pathEntry0.pathSpace', selectedSpace));
          expectCaveatToHaveValue(this, 'path', true,
            sinon.match.hasNested('pathEntry0.pathString', ''));
          expectToBeValid(this, 'path');

          const $selectorTrigger = $(new PathSpaceHelper().getTrigger());
          expect($selectorTrigger.find('.text').text().trim()).to.equal('space0');
          const $entryInput = getFieldElement(this, 'path').find('.pathString-field input');
          expect($entryInput).to.have.value('');
          expect($entryInput.attr('placeholder')).to.equal('Example: /my/directory/path');
          expectToBeValid(this, 'path');
        });
    }
  );

  it(
    'allows to choose between available spaces in path caveat entry',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true}}`);

      let pathSpaceHelper;
      return wait()
        .then(() => toggleCaveat('path'))
        .then(() => click(getFieldElement(this, 'path').find('.add-field-button')[0]))
        .then(() => {
          pathSpaceHelper = new PathSpaceHelper();
          return pathSpaceHelper.open();
        })
        .then(() => {
          const $thirdOption = $(pathSpaceHelper.getNthOption(3));
          expect($thirdOption).to.exist;
          expect(pathSpaceHelper.getNthOption(4)).to.not.exist;
          expect($thirdOption.find('.one-icon')).to.have.class('oneicon-space');
          expect($thirdOption.find('.text').text().trim()).to.equal('space2');
        });
    }
  );

  it(
    'notifies about path caveat entry space change',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

      let pathSpaceHelper;
      return wait()
        .then(() => toggleCaveat('path'))
        .then(() => click(getFieldElement(this, 'path').find('.add-field-button')[0]))
        .then(() => {
          pathSpaceHelper = new PathSpaceHelper();
          return pathSpaceHelper.selectOption(3);
        })
        .then(() => {
          const $selectorTrigger = $(pathSpaceHelper.getTrigger());
          expect($selectorTrigger.find('.text').text().trim()).to.equal('space2');

          const selectedSpace = this.get('mockedRecords.space.firstObject');
          expectCaveatToHaveValue(this, 'path', true,
            sinon.match.hasNested('pathEntry0.pathSpace', selectedSpace));
          expectToBeValid(this, 'path');
        });
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
      function () {
        this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

        return wait()
          .then(() => toggleCaveat('path'))
          .then(() => click(getFieldElement(this, 'path').find('.add-field-button')[0]))
          .then(() => fillIn(
            getFieldElement(this, 'path').find('.pathString-field input')[0],
            pathString
          ))
          .then(() => expectToBeValid(this, 'path'));
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
      function () {
        this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

        return wait()
          .then(() => toggleCaveat('path'))
          .then(() => click(getFieldElement(this, 'path').find('.add-field-button')[0]))
          .then(() => fillIn(
            getFieldElement(this, 'path').find('.pathString-field input')[0],
            pathString
          ))
          .then(() => expectToBeInvalid(this, 'path'));
      }
    );
  });

  it(
    'hides enabled description when readonly caveat is disabled',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true}}`);

      return wait()
        .then(() => expect(this.$('.readonlyEnabledText-field')).to.not.exist);
    }
  );

  it(
    'renders readonly caveat form elements when that caveat is enabled',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('readonly'))
        .then(() => {
          expect(this.$('.readonlyEnabledText-field').text().trim())
            .to.equal('This token allows only read access to user files.');

          expectToBeValid(this, 'readonly');
        });
    }
  );

  it(
    'renders empty, valid objectId caveat when it is enabled',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('objectId'))
        .then(() => {
          expectCaveatToHaveValue(this, 'objectId', true,
            sinon.match.has('__fieldsValueNames', sinon.match([])));
          expectToBeValid(this, 'objectId');
        });
    }
  );

  it(
    'notifies about objectId caveat change',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('objectId'))
        .then(() =>
          click(getFieldElement(this, 'objectId').find('.add-field-button')[0])
        )
        .then(() => fillIn(getFieldElement(this, 'objectId').find('input')[0], 'abc'))
        .then(() => {
          expectCaveatToHaveValue(this, 'objectId', true,
            sinon.match.has('objectIdEntry0', 'abc'));
          expectToBeValid(this, 'objectId');
        });
    }
  );

  it(
    'informs about invalid (empty) objectId entry',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('objectId'))
        .then(() =>
          click(getFieldElement(this, 'objectId').find('.add-field-button')[0])
        )
        .then(() => expectToBeInvalid(this, 'objectId'));
    }
  );

  it(
    'has readonly, path and objectId caveats under dataAccessCaveats group',
    function () {
      const caveatsToCheck = [
        'readonly',
        'path',
        'objectId',
      ];

      this.render(hbs `{{token-editor mode="create" expandCaveats=true}}`);

      return wait()
        .then(() => {
          caveatsToCheck.forEach(caveatName => {
            const caveatSelector =
              `.dataAccessCaveats-field .${caveatName}Caveat-field.caveat-group`;
            expect(this.$(caveatSelector)).to.exist;
          });
          expect(this.$('.dataAccessCaveats-field .caveat-group'))
            .to.have.length(caveatsToCheck.length);
        });
    }
  );

  it(
    'shows access token caveats when token type is changed to access',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true}}`);

      return wait()
        .then(() => click('.type-field .option-access'))
        .then(() => {
          expect(this.$('.serviceCaveat-collapse')).to.have.class('in');
          expect(this.$('.interfaceCaveat-collapse')).to.have.class('in');
          expect(this.$('.dataAccessCaveats-collapse')).to.have.class('in');
        });
    }
  );

  it(
    'shows indentity token caveats when token type is changed to identity',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true}}`);

      return wait()
        .then(() => click('.type-field .option-identity'))
        .then(() => {
          expect(this.$('.serviceCaveat-collapse')).to.not.have.class('in');
          expect(this.$('.interfaceCaveat-collapse')).to.have.class('in');
          expect(this.$('.dataAccessCaveats-collapse')).to.not.have.class('in');
        });
    }
  );

  it(
    'shows invite token caveats when token type is changed to invite',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true}}`);

      return wait()
        .then(() => click('.type-field .option-invite'))
        .then(() => {
          expect(this.$('.serviceCaveat-collapse')).to.not.have.class('in');
          expect(this.$('.interfaceCaveat-collapse')).to.not.have.class('in');
          expect(this.$('.dataAccessCaveats-collapse')).to.not.have.class('in');
        });
    }
  );

  it(
    'ignores validation errors in access only caveats when token type is not access',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('objectId'))
        .then(() =>
          click(getFieldElement(this, 'objectId').find('.add-field-button')[0])
        )
        .then(() => toggleCaveat('path'))
        .then(() =>
          click(getFieldElement(this, 'path').find('.add-field-button')[0])
        )
        .then(() => click('.type-field .option-invite'))
        .then(() => {
          expectToBeValid(this, 'objectId');
          expectToBeValid(this, 'path');
        });
    }
  );

  it('does not show service caveat warning in initial values configuration', function () {
    this.render(hbs `{{token-editor mode="create"}}`);

    return wait()
      .then(() => expect(this.$('.service-caveat-warning')).to.not.exist);
  });

  it(
    'shows service caveat warning when service caveat is disabled',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true}}`);

      return wait()
        .then(() => toggleCaveat('service'))
        .then(() => expect(this.$('.service-caveat-warning')).to.exist);
    }
  );

  it(
    'does not show service caveat warning when service caveat is disabled and not available',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true}}`);

      return wait()
        .then(() => toggleCaveat('service'))
        .then(() => click('.type-field .option-invite'))
        .then(() => expect(this.$('.service-caveat-warning')).to.not.exist);
    }
  );

  it(
    'shows service caveat warning when service caveat has Onezone service selected',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true}}`);

      return wait()
        .then(() => click('.service-field .tags-input'))
        .then(() => click(getTagsSelector().find('.record-item:contains("cluster2")')[0]))
        .then(() => expect(this.$('.service-caveat-warning')).to.exist);
    }
  );

  it(
    'shows service caveat warning when service caveat is enabled, but empty',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true}}`);

      return wait()
        .then(() => click('.service-field .tags-input .tag-remove'))
        .then(() => expect(this.$('.service-caveat-warning')).to.exist);
    }
  );

  it(
    'does not show service caveat warning when service caveat is disabled and interface caveat is set to oneclient',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true}}`);

      return wait()
        .then(() => toggleCaveat('service'))
        .then(() => toggleCaveat('interface'))
        .then(() => click('.interface-field .option-oneclient'))
        .then(() => expect(this.$('.service-caveat-warning')).to.not.exist);
    }
  );

  it(
    'shows service caveat warning when service caveat is disabled and interface caveat is set to REST',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true}}`);

      return wait()
        .then(() => toggleCaveat('service'))
        .then(() => toggleCaveat('interface'))
        .then(() => click('.interface-field .option-rest'))
        .then(() => expect(this.$('.service-caveat-warning')).to.exist);
    }
  );

  it(
    'does not show service caveat warning when service caveat is disabled and readonly caveat is enabled',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true}}`);

      return wait()
        .then(() => toggleCaveat('service'))
        .then(() => toggleCaveat('readonly'))
        .then(() => expect(this.$('.service-caveat-warning')).to.not.exist);
    }
  );

  it(
    'shows service caveat warning when service caveat is disabled and path caveat is enabled without any path',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true}}`);

      return wait()
        .then(() => toggleCaveat('service'))
        .then(() => toggleCaveat('path'))
        .then(() => expect(this.$('.service-caveat-warning')).to.exist);
    }
  );

  it(
    'does not show service caveat warning when service caveat is disabled and path caveat is enabled with one path included',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true}}`);

      return wait()
        .then(() => toggleCaveat('service'))
        .then(() => toggleCaveat('path'))
        .then(() => click(getFieldElement(this, 'path').find('.add-field-button')[0]))
        .then(() => expect(this.$('.service-caveat-warning')).to.not.exist);
    }
  );

  it(
    'shows service caveat warning when service caveat is disabled and objectId caveat is enabled without any object id',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true}}`);

      return wait()
        .then(() => toggleCaveat('service'))
        .then(() => toggleCaveat('objectId'))
        .then(() => expect(this.$('.service-caveat-warning')).to.exist);
    }
  );

  it(
    'does not show service caveat warning when service caveat is disabled and objectId caveat is enabled with one object id included',
    function () {
      this.render(hbs `{{token-editor mode="create" expandCaveats=true}}`);

      return wait()
        .then(() => toggleCaveat('service'))
        .then(() => toggleCaveat('objectId'))
        .then(() => click(getFieldElement(this, 'objectId').find('.add-field-button')[0]))
        .then(() => expect(this.$('.service-caveat-warning')).to.not.exist);
    }
  );

  it('renders disabled submit button when form is invalid', function () {
    this.render(hbs `{{token-editor mode="create"}}`);

    return wait()
      .then(() => fillIn('.name-field input', ''))
      .then(() => {
        const $submit = this.$('.submit-token');
        expect($submit).to.exist;
        expect($submit.text().trim()).to.equal('Create token');
        expect($submit).to.have.attr('disabled');
      });
  });

  it('renders enabled submit button when form becomes valid', function () {
    this.render(hbs `{{token-editor mode="create"}}`);

    return wait()
      .then(() => fillIn('.name-field input', 'abc'))
      .then(() =>
        expect(this.$('.submit-token')).to.not.have.attr('disabled')
      );
  });

  it('calls injected onSubmit on submit click', function () {
    const submitStub = sinon.stub().resolves();
    this.on('submit', submitStub);
    this.render(hbs `{{token-editor mode="create" onSubmit=(action "submit")}}`);

    return wait()
      .then(() => fillIn('.name-field input', 'abc'))
      .then(() => click('.submit-token'))
      .then(() => {
        expect(submitStub).to.be.calledOnce;
      });
  });

  it(
    'passess token raw model via injected onSubmit on submit click (access token example with all caveats)',
    function () {
      const submitStub = sinon.stub().resolves();
      this.on('submit', submitStub);
      this.render(hbs `{{token-editor mode="create" expandCaveats=true onSubmit=(action "submit")}}`);

      return wait()
        .then(() => fillIn('.name-field input', 'somename'))
        .then(() => click('.type-field .option-access'))
        // expire
        .then(() => toggleCaveat('expire'))
        // region
        .then(() => toggleCaveat('region'))
        // Not testing white/blacklist dropdown, due to unknown bug, that is related to
        // region tip and appears only on bamboo. Due to that bug this test cannot select
        // blacklist option. Removing tip from region fixes problem.
        .then(() => click('.region-field .tags-input'))
        .then(() => click(
          getTagsSelector().find('.selector-item:contains("Europe")')[0]
        ))
        // country
        .then(() => toggleCaveat('country'))
        .then(() => new CountryTypeHelper().selectOption(2))
        .then(() => click('.country-field .tags-input'))
        .then(() => fillIn('.country-field .text-editor-input', 'pl,'))
        // asn
        .then(() => toggleCaveat('asn'))
        .then(() => click('.asn-field .tags-input'))
        .then(() => fillIn('.asn-field .text-editor-input', '123,2,'))
        // ip
        .then(() => toggleCaveat('ip'))
        .then(() => click('.ip-field .tags-input'))
        .then(() => fillIn('.ip-field .text-editor-input', '255.255.255.255,'))
        // consumer
        .then(() => toggleCaveat('consumer'))
        .then(() => click('.consumer-field .tags-input'))
        .then(() => click(getTagsSelector().find('.record-item')[0]))
        // service
        .then(() => click('.service-field .tags-input .tag-remove'))
        .then(() => click('.service-field .tags-input'))
        .then(() => click(getTagsSelector().find('.record-item')[0]))
        // interface
        .then(() => toggleCaveat('interface'))
        .then(() => click('.option-oneclient'))
        // readonly
        .then(() => toggleCaveat('readonly'))
        // path
        .then(() => toggleCaveat('path'))
        .then(() =>
          click(getFieldElement(this, 'path').find('.add-field-button')[0])
        )
        .then(() => new PathSpaceHelper().selectOption(1))
        .then(() => fillIn(
          getFieldElement(this, 'path').find('.pathString-field input')[0],
          '/abc'
        ))
        // objectid
        .then(() => toggleCaveat('objectId'))
        .then(() =>
          click(getFieldElement(this, 'objectId').find('.add-field-button')[0])
        )
        .then(() => fillIn(
          getFieldElement(this, 'objectId').find('input')[0],
          'objectid1'
        ))
        .then(() => click('.submit-token'))
        .then(() => {
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
            whitelist: ['opw-cluster0'],
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
        });
    }
  );

  it(
    'passess token raw model via injected onSubmit on submit click (invite token example without caveats)',
    function () {
      const submitStub = sinon.stub().resolves();
      this.on('submit', submitStub);
      this.render(hbs `{{token-editor mode="create" onSubmit=(action "submit")}}`);

      return wait()
        .then(() => fillIn('.name-field input', 'somename'))
        .then(() => click('.type-field .option-invite'))
        .then(() => new InviteTypeHelper().selectOption(1))
        .then(() => new TargetHelper().selectOption(1))
        .then(() => click('.usageLimit-field .option-number'))
        .then(() => fillIn('.usageLimitNumber-field input', '10'))
        .then(() => click('.submit-token'))
        .then(() => {
          const rawToken = submitStub.lastCall.args[0];
          expect(rawToken).to.have.property('name', 'somename');
          expect(rawToken).to.have.deep.nested.property('type.inviteToken', {
            inviteType: 'userJoinGroup',
            groupId: 'group0',
          });
          expect(rawToken).to.have.deep.property('privileges', ['group_view']);
          expect(rawToken).to.have.property('usageLimit', 10);
          expect(rawToken).to.not.have.property('caveats');
        });
    }
  );

  it(
    'passess token raw model via injected onSubmit on submit click (register Oneprovider example without caveats)',
    function () {
      const submitStub = sinon.stub().resolves();
      this.on('submit', submitStub);
      this.render(hbs `{{token-editor mode="create" onSubmit=(action "submit")}}`);

      const registerOneproviderDropdownIndex = tokenInviteTypes.indexOf(
        tokenInviteTypes.findBy('inviteType', 'registerOneprovider')
      ) + 1;
      return wait()
        .then(() => fillIn('.name-field input', 'somename'))
        .then(() => click('.type-field .option-invite'))
        .then(() =>
          new InviteTypeHelper().selectOption(registerOneproviderDropdownIndex)
        )
        .then(() => click('.submit-token'))
        .then(() => {
          const rawToken = submitStub.lastCall.args[0];
          expect(rawToken).to.have.property('name', 'somename');
          expect(rawToken).to.have.deep.nested.property('type.inviteToken', {
            inviteType: 'registerOneprovider',
            adminUserId: 'currentuser',
          });
          expect(rawToken).to.not.have.property('caveats');
        });
    }
  );

  it(
    'disables all fields and shows spinner in submit button when submit promise is pending',
    function () {
      let submitResolve;
      const submitStub = sinon.stub()
        .returns(new Promise(resolve => submitResolve = resolve));
      this.on('submit', submitStub);
      this.render(hbs `{{token-editor mode="create" onSubmit=(action "submit")}}`);

      return wait()
        .then(() => fillIn('.name-field input', 'abc'))
        .then(() => click('.submit-token'))
        .then(() => {
          expect(this.$('input:not([disabled])')).to.not.exist;
          expect(this.$('.submit-token [role="progressbar"]')).to.exist;
          submitResolve();
          return wait();
        })
        .then(() => {
          expect(this.$('input:not([disabled])')).to.exist;
          expect(this.$('.submit-token [role="progressbar"]')).to.not.exist;
        });
    }
  );

  it(
    'is in mode "create" by default',
    function () {
      this.render(hbs `{{token-editor}}`);

      return wait()
        .then(() => expect(this.$('.token-editor')).to.have.class('create-mode'));
    }
  );

  it(
    'has all fields in edition mode, when mode is "create"',
    function () {
      this.render(hbs `{{token-editor mode="create"}}`);

      return wait()
        .then(() => {
          expect(this.$('.token-editor')).to.have.class('create-mode');
          expect(this.$('.field-view-mode')).to.not.exist;
        });
    }
  );

  it(
    'has all fields in view mode, when mode is "view"',
    function () {
      this.render(hbs `{{token-editor mode="view"}}`);

      return wait()
        .then(() => {
          expect(this.$('.token-editor')).to.have.class('view-mode');
          expect(this.$('.field-edit-mode')).to.not.exist;
        });
    }
  );

  it(
    'renders fields from view mode when component is in view mode',
    function () {
      this.render(hbs `{{token-editor mode="view"}}`);

      return wait()
        .then(() => {
          expectLabelToEqual(this, 'revoked', 'Revoked');
          expect(getFieldElement(this, 'revoked').find('.one-way-toggle')).to.exist;
          expectLabelToEqual(this, 'tokenString', 'Token');
          expect(getFieldElement(this, 'tokenString').find('textarea')).to.exist;
        });
    }
  );

  it(
    'does not show fields from view mode, when is in create mode',
    function () {
      this.render(hbs `{{token-editor mode="create"}}`);

      return wait()
        .then(() => {
          expect(getFieldElement(this, 'tokenString')).to.not.exist;
          expect(getFieldElement(this, 'revoked')).to.not.exist;
        });
    }
  );

  it(
    'shows passed token data in view mode (access token, all caveats)',
    function () {
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
            'opw-cluster0',
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

      this.render(hbs `{{token-editor mode="view" token=token}}`);

      return wait().then(() => {
        expect(getFieldElement(this, 'name').text()).to.contain('token1');
        expect(getFieldElement(this, 'revoked').find('.one-way-toggle'))
          .to.have.class('checked');
        expect(getFieldElement(this, 'tokenString').find('textarea').val())
          .to.contain('abc');
        expect(getFieldElement(this, 'type').text()).to.contain('Access');
        expect(getFieldElement(this, 'expire').text())
          .to.contain(moment(now).format('YYYY/MM/DD H:mm'));
        expect(getFieldElement(this, 'regionType').text()).to.contain('Deny');
        expect(getFieldElement(this, 'regionList').text()).to.contain('Europe');
        expect(getFieldElement(this, 'countryType').text()).to.contain('Deny');
        expect(getFieldElement(this, 'countryList').text()).to.contain('PL');
        expect(getFieldElement(this, 'asn').text()).to.contain('3');
        expect(getFieldElement(this, 'ip').text()).to.contain('1.2.3.4/12');
        const consumerCaveatText = getFieldElement(this, 'consumer').text();
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
        const serviceCaveatText = getFieldElement(this, 'service').text();
        [
          'cluster0',
          'ID: prvunknown',
          'Any Oneprovider',
          'cluster1',
          'ID: prvpunknown',
          'Any Oneprovider Onepanel',
        ].forEach(service => expect(serviceCaveatText).to.contain(service));
        // onezone cluster should occur twice
        expect(serviceCaveatText.split('cluster2')).to.have.length(3);
        expect(getFieldElement(this, 'interface').text()).to.contain('Oneclient');
        expect(getFieldElement(this, 'readonlyView').find('.one-way-toggle'))
          .to.have.class('checked');
        expect(getFieldElement(this, 'readonlyEnabledText')).to.not.exist;
        const pathsFields = getFieldElement(this, 'path').find('.pathEntry-field');
        expect(pathsFields).to.have.length(3);
        expect(pathsFields.eq(0).find('.pathSpace-field .oneicon-space')).to.exist;
        expect(pathsFields.eq(0).find('.pathSpace-field').text()).to.contain('space1');
        expect(pathsFields.eq(0).find('.pathString-field').text()).to.contain('/abc/def');
        expect(pathsFields.eq(1).find('.pathSpace-field .oneicon-space')).to.exist;
        expect(pathsFields.eq(1).find('.pathSpace-field').text()).to.contain('space1');
        expect(pathsFields.eq(1).find('.pathString-field').text()).to.contain('/');
        expect(pathsFields.eq(2).find('.pathSpace-field .oneicon-space')).to.exist;
        expect(pathsFields.eq(2).find('.pathSpace-field').text()).to.contain('ID: unknown');
        expect(pathsFields.eq(2).find('.pathString-field').text()).to.contain('/abc/def/ghi');
        const objectIdsFields = getFieldElement(this, 'objectId').find('.objectIdEntry-field');
        expect(objectIdsFields).to.have.length(2);
        expect(objectIdsFields.eq(0).text()).to.contain('abc');
        expect(objectIdsFields.eq(1).text()).to.contain('def');
        expect(this.$('.submit-token')).to.not.exist;
      });
    }
  );

  it(
    'shows passed token data in view mode (invite token, no caveats)',
    function () {
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

      this.render(hbs `{{token-editor mode="view" token=token}}`);

      return wait().then(() => {
        expect(getFieldElement(this, 'name').text()).to.contain('token1');
        expect(getFieldElement(this, 'revoked').find('.one-way-toggle'))
          .to.not.have.class('checked');
        expect(getFieldElement(this, 'type').text()).to.contain('Invite');
        expect(getFieldElement(this, 'inviteType').text()).to.contain('Invite user to space');
        expect(getFieldElement(this, 'target').text()).to.contain('space1');
        expect(getFieldElement(this, 'privileges').find('.one-way-toggle.checked'))
          .to.have.length(3);
        expect(getFieldElement(this, 'usageLimit')).to.not.exist;
        expectLabelToEqual(this, 'usageCount', 'Usage count');
        expect(getFieldElement(this, 'usageCount').text()).to.contain('5 / 10');
        expect(this.$('.caveat-group-toggle')).to.not.exist;
        expect(this.$('.caveats-expand')).to.not.exist;
      });
    }
  );

  it(
    'shows passed token data in view mode (invite token with unknown target, no caveats)',
    function () {
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

      this.render(hbs `{{token-editor mode="view" token=token}}`);

      return wait().then(() => {
        expect(getFieldElement(this, 'name').text()).to.contain('token1');
        expect(getFieldElement(this, 'type').text()).to.contain('Invite');
        expect(getFieldElement(this, 'inviteType').text()).to.contain('Invite user to space');
        expect(getFieldElement(this, 'target').text()).to.contain('ID: space1');
        expect(getFieldElement(this, 'privileges').find('.one-way-toggle.checked'))
          .to.have.length(3);
        expect(getFieldElement(this, 'usageLimit')).to.not.exist;
        expectLabelToEqual(this, 'usageCount', 'Usage count');
        expect(getFieldElement(this, 'usageCount').text()).to.contain('5 / 10');
        expect(this.$('.caveat-group-toggle')).to.not.exist;
        expect(this.$('.caveats-expand')).to.not.exist;
      });
    }
  );

  it(
    'has only name and revoked fields in edition mode, when mode is "edit"',
    function () {
      this.render(hbs `{{token-editor mode="edit"}}`);

      return wait()
        .then(() => {
          expect(this.$('.token-editor')).to.have.class('edit-mode');
          const $editFields = this.$('.field-edit-mode');
          expect($editFields).to.have.length(2);
          expect($editFields.filter('.name-field')).to.exist;
          expect($editFields.filter('.revoked-field')).to.exist;
        });
    }
  );

  it(
    'represents token values in edit fields in component "edit" mode',
    function () {
      const token = {
        name: 'token1',
        revoked: true,
      };
      this.set('token', token);

      this.render(hbs `{{token-editor mode="edit" token=token}}`);

      return wait()
        .then(() => {
          expect(getFieldElement(this, 'name').find('input').val()).to.equal('token1');
          expect(getFieldElement(this, 'revoked').find('.one-way-toggle'))
            .to.have.class('checked');
        });
    }
  );

  it(
    'does not change values in edit fields, when token data changes in edit mode',
    function () {
      const token = {
        name: 'token1',
        revoked: true,
      };
      this.set('token', token);

      this.render(hbs `{{token-editor mode="edit" token=token}}`);

      this.set('token', {
        name: 'anothertoken',
        revoked: false,
      });

      return wait()
        .then(() => {
          expect(getFieldElement(this, 'name').find('input').val()).to.equal('token1');
          expect(getFieldElement(this, 'revoked').find('.one-way-toggle'))
            .to.have.class('checked');
        });
    }
  );

  it('renders submit and cancel buttons in edit mode', function () {
    const token = {
      name: 'token1',
      revoked: true,
    };
    this.set('token', token);

    this.render(hbs `{{token-editor mode="edit" token=token}}`);

    return wait()
      .then(() => {
        const $submit = this.$('.submit-token');
        const $cancel = this.$('.cancel-edition');
        expect($submit).to.exist;
        expect($submit.text().trim()).to.equal('Save');
        expect($submit).to.not.have.attr('disabled');
        expect($cancel).to.exist;
        expect($cancel.text().trim()).to.equal('Cancel');
        expect($cancel).to.not.have.attr('disabled');
      });
  });

  it(
    'renders disabled submit button when form becomes invalid in edit mode',
    function () {
      const token = {
        name: 'token1',
        revoked: true,
      };
      this.set('token', token);

      this.render(hbs `{{token-editor mode="edit" token=token}}`);

      return wait()
        .then(() => fillIn('.name-field input', ''))
        .then(() => expect(this.$('.submit-token')).to.have.attr('disabled'));
    }
  );

  it(
    'calls injected onSubmit on submit click with empty diff object in edit mode',
    function () {
      const token = {
        name: 'token1',
        revoked: true,
      };
      this.set('token', token);
      const submitStub = sinon.stub().resolves();
      this.on('submit', submitStub);

      this.render(hbs `{{token-editor mode="edit" token=token onSubmit=(action "submit")}}`);

      return wait()
        .then(() => click('.submit-token'))
        .then(() => {
          expect(submitStub).to.be.calledOnce;
          expect(submitStub).to.be.calledWithMatch(v => Object.keys(v).length === 0);
        });
    }
  );

  it(
    'calls injected onSubmit on submit click with diff object containing changed fields in edit mode',
    function () {
      const token = {
        name: 'token1',
        revoked: true,
      };
      this.set('token', token);
      const submitStub = sinon.stub().resolves();
      this.on('submit', submitStub);

      this.render(hbs `{{token-editor mode="edit" token=token onSubmit=(action "submit")}}`);

      return wait()
        .then(() => fillIn('.name-field input', 'token2'))
        .then(() => click('.revoked-field .one-way-toggle'))
        .then(() => click('.submit-token'))
        .then(() => {
          expect(submitStub).to.be.calledOnce;
          expect(submitStub).to.be.calledWithMatch({ name: 'token2', revoked: false });
        });
    }
  );

  it(
    'disables all fields and shows spinner in submit button when submit promise is pending in edit mode',
    function () {
      const token = {
        name: 'token1',
        revoked: true,
      };
      this.set('token', token);
      let submitResolve;
      const submitStub = sinon.stub()
        .returns(new Promise(resolve => submitResolve = resolve));
      this.on('submit', submitStub);
      this.render(hbs `{{token-editor mode="edit" token=token onSubmit=(action "submit")}}`);

      return wait()
        .then(() => click('.submit-token'))
        .then(() => {
          expect(this.$('input:not([disabled])')).to.not.exist;
          expect(this.$('.submit-token [role="progressbar"]')).to.exist;
          expect(this.$('.cancel-edition')).to.have.attr('disabled');
          submitResolve();
          return wait();
        })
        .then(() => {
          expect(this.$('input:not([disabled])')).to.exist;
          expect(this.$('.submit-token [role="progressbar"]')).to.not.exist;
          expect(this.$('.cancel-edition')).to.not.have.attr('disabled');
        });
    }
  );

  it(
    'calls injected onCancel on cancel click in edit mode',
    function () {
      const cancelSpy = sinon.spy();
      this.on('cancel', cancelSpy);

      this.render(hbs `{{token-editor mode="edit" onCancel=(action "cancel")}}`);

      return wait()
        .then(() => click('.cancel-edition'))
        .then(() => expect(cancelSpy).to.be.calledOnce);
    }
  );
});

class InviteTypeHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.inviteType-field .ember-basic-dropdown');
  }
}

class TargetHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.target-field .ember-basic-dropdown');
  }
}

class RegionTypeHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.regionType-field .ember-basic-dropdown');
  }
}

class CountryTypeHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.countryType-field .ember-basic-dropdown');
  }
}

class PathSpaceHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.pathSpace-field .ember-basic-dropdown');
  }
}

function getTagsSelector() {
  return $('.webui-popover.in .tags-selector');
}

class TagsSelectorDropdownHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.webui-popover.in .tags-selector .ember-basic-dropdown');
  }
}

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

const dataAccessCaveats = [
  'readonly',
  'path',
  'objectId',
];

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
  if (dataAccessCaveats.includes(caveatName)) {
    return `caveats.dataAccessCaveats.${caveatName}Caveat.${caveatName}Enabled`;
  } else {
    return `caveats.${caveatName}Caveat.${caveatName}Enabled`;
  }
}

function caveatValueFieldPath(caveatName) {
  if (dataAccessCaveats.includes(caveatName)) {
    return `caveats.dataAccessCaveats.${caveatName}Caveat.${caveatName}`;
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
  expect(changeArg).to.not.have.nested.property(fieldValuePath);
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

function expectLabelToEqual(testCase, fieldName, label, omitColon = false) {
  const isCaveat = !basicFieldNameToFieldPath[fieldName];
  const domFieldName = isCaveat ? `${fieldName}Enabled` : fieldName;
  label = (isCaveat || omitColon) ? label : `${label}:`;
  expect(testCase.$(`.${domFieldName}-field label`).eq(0).text().trim()).to.equal(label);
}

function expectCaveatToggleState(testCase, caveatName, isChecked) {
  const $toggle = testCase.$(`.${caveatName}Enabled-field .one-way-toggle`);
  expect($toggle).to.exist;
  if (isChecked) {
    expect($toggle).to.have.class('checked');
  } else {
    expect($toggle).to.not.have.class('checked');
  }
}

function toggleCaveat(caveatName) {
  return click(`.${caveatName}Enabled-field .one-way-toggle`);
}

function getFieldElement(testCase, fieldName) {
  return testCase.$(`.${fieldName}-field`);
}
