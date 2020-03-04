import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { fillIn, click } from 'ember-native-dom-helpers';
import EmberPowerSelectHelper from '../../helpers/ember-power-select-helper';
import OneDatetimePickerHelper from '../../helpers/one-datetime-picker';
import $ from 'jquery';
import wait from 'ember-test-helpers/wait';
import _ from 'lodash';
import { lookupService } from '../../helpers/stub-service';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { resolve, Promise } from 'rsvp';
import moment from 'moment';
import OneTooltipHelper from '../../helpers/one-tooltip';

const tokenInviteTypes = [{
  inviteType: 'userJoinGroup',
  label: 'Invite user to group',
  icon: 'group',
  targetModelName: 'group',
  targetPlaceholder: 'Select group...',
}, {
  inviteType: 'groupJoinGroup',
  label: 'Invite group to parent group',
  icon: 'group',
  targetModelName: 'group',
  targetPlaceholder: 'Select parent group...',
}, {
  inviteType: 'userJoinSpace',
  label: 'Invite user to space',
  icon: 'space',
  targetModelName: 'space',
  targetPlaceholder: 'Select space...',
}, {
  inviteType: 'groupJoinSpace',
  label: 'Invite group to space',
  icon: 'space',
  targetModelName: 'space',
  targetPlaceholder: 'Select space...',
}, {
  inviteType: 'userJoinCluster',
  label: 'Invite user to cluster',
  icon: 'cluster',
  targetModelName: 'cluster',
  targetPlaceholder: 'Select cluster...',
}, {
  inviteType: 'groupJoinCluster',
  label: 'Invite group to cluster',
  icon: 'cluster',
  targetModelName: 'cluster',
  targetPlaceholder: 'Select cluster...',
}, {
  inviteType: 'userJoinHarvester',
  label: 'Invite user to harvester',
  icon: 'light-bulb',
  targetModelName: 'harvester',
  targetPlaceholder: 'Select harvester...',
}, {
  inviteType: 'groupJoinHarvester',
  label: 'Invite group to harvester',
  icon: 'light-bulb',
  targetModelName: 'harvester',
  targetPlaceholder: 'Select harvester...',
}, {
  inviteType: 'spaceJoinHarvester',
  label: 'Invite space to harvester',
  icon: 'light-bulb',
  targetModelName: 'harvester',
  targetPlaceholder: 'Select harvester...',
  noPrivileges: true,
}, {
  inviteType: 'supportSpace',
  label: 'Support space',
  icon: 'space',
  targetModelName: 'space',
  targetPlaceholder: 'Select space...',
  noPrivileges: true,
}, {
  inviteType: 'registerOneprovider',
  label: 'Register Oneprovider',
  icon: 'provider',
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
  this.timeout(15000);
  setupComponentTest('token-editor', {
    integration: true,
  });

  beforeEach(function () {
    const currentUser = {
      entityId: 'currentuser',
      name: 'currentuser',
    };
    sinon.stub(lookupService(this, 'current-user'), 'getCurrentUserRecord')
      .resolves(currentUser);
    const onedataGraphStub =
      sinon.stub(lookupService(this, 'onedata-graph'), 'request');
    const mockedRecords = {};
    [
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
      const serviceName = `${modelName}-manager`;
      const getModelsMethodName = `get${_.upperFirst(modelName)}s`;
      const service = lookupService(this, serviceName);
      mockedRecords[modelName] = _.reverse(_.range(3)).map(index => ({
        entityId: `${modelName}${index}`,
        entityType: modelName,
        name: `${modelName}${index}`,
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
      sinon.stub(service, getModelsMethodName)
        .resolves({
          list: PromiseArray.create({
            promise: resolve(mockedRecords[modelName]),
          }),
        });
    });
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
    this.render(hbs `{{token-editor}}`);

    expectLabelToEqual(this, 'name', 'Name');
    expect(this.$('.name-field input')).to.exist;
  });

  it('has not valid "name" when it is empty', function () {
    this.render(hbs `{{token-editor onChange=(action "change")}}`);

    expectToHaveNoValue(this, 'name');
    expectToBeInvalid(this, 'name');
  });

  it('has valid "name" when it has been changed to not empty value', function () {
    this.render(hbs `{{token-editor onChange=(action "change")}}`);

    return wait()
      .then(() => fillIn('.name-field input', 'abc'))
      .then(() => {
        expectToHaveValue(this, 'name', 'abc');
        expectToBeValid(this, 'name');
      });
  });

  it('renders "type" field', function () {
    this.render(hbs `{{token-editor}}`);

    expectLabelToEqual(this, 'type', 'Type');
    [
      'access',
      'identity',
      'invite',
    ].forEach(type =>
      expect(this.$(`.type-field .option-${type}`).text().trim()).to.equal(_.upperFirst(type))
    );
  });

  it('has "type" field with preselected "access" option', function () {
    this.render(hbs `{{token-editor onChange=(action "change")}}`);

    expectToHaveValue(this, 'type', 'access');
    expectToBeValid(this, 'type');
    expect(this.$('.type-field .option-access input').prop('checked')).to.be.true;
  });

  [
    'identity',
    'invite',
  ].forEach(type => {
    it(`notifies about "type" field change to ${type}`, function () {
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      return click(`.type-field .option-${type}`)
        .then(() => {
          expectToHaveValue(this, 'type', type);
          expectToBeValid(this, 'type');
        });
    });
  });

  [
    'access',
    'identity',
  ].forEach(type => {
    it(
      `does not show invitation related basic fields if "type" is "${type}"`,
      function () {
        this.render(hbs `{{token-editor}}`);

        return click(`.type-field .option-${type}`)
          .then(() =>
            expect(this.$('.inviteDetails-collapse')).to.not.have.class('in')
          );
      }
    );
  });

  it(
    'shows invitation related basic fields only if "type" is "invite"',
    function () {
      this.render(hbs `{{token-editor}}`);

      return click('.type-field .option-invite')
        .then(() => expect(this.$('.inviteDetails-collapse')).to.have.class('in'));
    }
  );

  it('renders "inviteType" field', function () {
    this.render(hbs `{{token-editor}}`);

    const inviteTypeHelper = new InviteTypeHelper();

    return click('.type-field .option-invite')
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
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      return click('.type-field .option-invite')
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
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      expectToBeValid(this, 'target');
    }
  );

  it(
    'has not valid "target" field when it is empty',
    function () {
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      return click('.type-field .option-invite')
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
  }, index) => {
    it(`notifies about "inviteType" field change to "${label}"`, function () {
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      const inviteTypeHelper = new InviteTypeHelper();

      return click('.type-field .option-invite')
        .then(() => inviteTypeHelper.selectOption(index + 1))
        .then(() => {
          expectToHaveValue(this, 'inviteType', inviteType);
          expectToBeValid(this, 'inviteType');
        });
    });

    if (targetModelName) {
      it(
        `shows correct "target" field when "inviteType" field is "${label}"`,
        function () {
          this.render(hbs `{{token-editor}}`);

          const targetHelper = new TargetHelper();
          return click('.type-field .option-invite')
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
          this.render(hbs `{{token-editor onChange=(action "change")}}`);

          return click('.type-field .option-invite')
            .then(() => new InviteTypeHelper().selectOption(index + 1))
            .then(() => new TargetHelper().selectOption(1))
            .then(() => {
              const selectedTarget =
                this.get(`mockedRecords.${targetModelName}.lastObject`);
              expectToHaveValue(this, 'target', selectedTarget);
              expectToBeValid(this, 'target');
            });
        }
      );

      if (!noPrivileges) {
        it(
          `shows correct privileges field when "inviteType" field is "${label}"`,
          function () {
            this.render(hbs `{{token-editor}}`);

            return click('.type-field .option-invite')
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
                expect(this.$('.privileges-field .one-way-toggle.checked')).to.have.length(1);
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
            this.render(hbs `{{token-editor onChange=(action "change")}}`);

            return click('.type-field .option-invite')
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
            this.render(hbs `{{token-editor onChange=(action "change")}}`);

            return click('.type-field .option-invite')
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
          this.render(hbs `{{token-editor onChange=(action "change")}}`);

          return click('.type-field .option-invite')
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
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      return click('.type-field .option-invite')
        .then(() => new TargetHelper().selectOption(1))
        .then(() => new InviteTypeHelper().selectOption(3))
        .then(() => expectToHaveNoValue(this, 'target'));
    }
  );

  it('renders "usageLimit" field', function () {
    this.render(hbs `{{token-editor}}`);

    return click('.type-field .option-invite')
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
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      return click('.type-field .option-invite')
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
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      return click('.type-field .option-invite')
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
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      return click('.type-field .option-invite')
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
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      return click('.type-field .option-invite')
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
    'has collapsed caveats section on init by default',
    function () {
      this.render(hbs `{{token-editor}}`);

      expect(this.$('.caveats-collapse')).to.not.have.class('in');
    }
  );

  it(
    'has expanded caveats section on init when expandCaveats is true',
    function () {
      this.render(hbs `{{token-editor expandCaveats=true}}`);

      expect(this.$('.caveats-collapse')).to.have.class('in');
    }
  );

  caveats.forEach(({ name, label, disabledDescription, tip, dontTestValue }) => {
    it(
      `renders unchecked toggle, label, tip and disabled description for ${name} caveat on init`,
      function () {
        this.render(hbs `{{token-editor expandCaveats=true}}`);

        const $disabledDescription = this.$(`.${name}DisabledText-field`);

        expectCaveatToggleState(this, name, false);
        expectLabelToEqual(this, name, label);
        expect(getFieldElement(this, name)).to.not.exist;
        expect($disabledDescription.text().trim()).to.equal(disabledDescription);
        return new OneTooltipHelper(`.${name}Caveat-field .one-label-tip .oneicon`)
          .getText().then(text => expect(text).to.equal(tip));
      }
    );

    it(
      `has valid and disabled ${name} caveat on init`,
      function () {
        this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

        expectToBeValid(this, name);
        if (!dontTestValue) {
          expectCaveatToHaveValue(this, name, false);
        } else {
          expectCaveatToHaveEnabledState(this, name, false);
        }
      }
    );

    it(
      `hides disabled description and shows form field on ${name} caveat toggle change`,
      function () {
        this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

        return toggleCaveat(name)
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
  });

  it(
    'renders expire caveat form elements when that caveat is enabled',
    function () {
      const tomorrow = moment().add(1, 'day').endOf('day');
      const dayAfterTomorrow = moment(tomorrow).add(1, 'day');

      this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

      return toggleCaveat('expire')
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
      this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

      let oldExpire;
      return toggleCaveat('expire')
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
      this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

      return toggleCaveat('interface')
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
      this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

      return toggleCaveat('interface')
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
        this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

        return toggleCaveat(caveatName)
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
      this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

      return toggleCaveat('asn')
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
      this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

      return toggleCaveat('asn')
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
      this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

      return toggleCaveat('ip')
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
      this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

      return toggleCaveat('ip')
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
      this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

      return toggleCaveat('region')
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
        this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

        return toggleCaveat('region')
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
      this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

      let regionTypeHelper;
      return toggleCaveat('region')
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
      this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

      return toggleCaveat('region')
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
      this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

      return toggleCaveat('country')
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
      this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

      return toggleCaveat('country')
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
      this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

      return toggleCaveat('country')
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
      this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

      let countryTypeHelper;
      return toggleCaveat('country')
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
      this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

      return toggleCaveat('consumer')
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
        this.render(hbs `{{token-editor expandCaveats=true}}`);

        let typeSelectorHelper;
        return toggleCaveat('consumer')
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
    this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

    return toggleCaveat('consumer')
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
        this.render(hbs `{{token-editor expandCaveats=true}}`);

        return toggleCaveat('consumer')
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
    this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

    return toggleCaveat('consumer')
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
    'renders empty, invalid service caveat when it is enabled',
    function () {
      this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

      return toggleCaveat('service')
        .then(() => {
          expectCaveatToHaveValue(this, 'service', true, []);
          expectToBeInvalid(this, 'service');
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
        this.render(hbs `{{token-editor expandCaveats=true}}`);

        let typeSelectorHelper;
        return toggleCaveat('service')
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
    this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

    return toggleCaveat('service')
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
        this.render(hbs `{{token-editor expandCaveats=true}}`);

        return toggleCaveat('service')
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
    this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

    return toggleCaveat('service')
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
      this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

      return toggleCaveat('path')
        .then(() => {
          expectCaveatToHaveValue(this, 'path', true,
            sinon.match.has('__fieldsValueNames', sinon.match([])));
          expectToBeValid(this, 'path');
        });
    }
  );

  it(
    'preselects first available space and path "" for new entry in path caveat',
    function () {
      this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

      return toggleCaveat('path')
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
          expect(getFieldElement(this, 'path').find('.pathString-field input'))
            .to.have.value('');
          expectToBeValid(this, 'path');
        });
    }
  );

  it(
    'allows to choose between available spaces in path caveat entry',
    function () {
      this.render(hbs `{{token-editor expandCaveats=true}}`);

      let pathSpaceHelper;
      return toggleCaveat('path')
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
      this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

      let pathSpaceHelper;
      return toggleCaveat('path')
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
    '/asd',
    '/asd/xcv.cpp',
  ].forEach(pathString => {
    it(
      `notifies about correct path caveat string ${JSON.stringify(pathString)}`,
      function () {
        this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

        return toggleCaveat('path')
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
    '/',
    '//',
    'asd/',
    ' /asd',
  ].forEach(pathString => {
    it(
      `notifies about incorrect path caveat string ${JSON.stringify(pathString)}`,
      function () {
        this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

        return toggleCaveat('path')
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
      this.render(hbs `{{token-editor expandCaveats=true}}`);

      expect(this.$('.readonlyEnabledText-field')).to.not.exist;
    }
  );

  it(
    'renders readonly caveat form elements when that caveat is enabled',
    function () {
      this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

      return toggleCaveat('readonly')
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
      this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

      return toggleCaveat('objectId')
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
      this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

      return toggleCaveat('objectId')
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
      this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

      return toggleCaveat('objectId')
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

      this.render(hbs `{{token-editor expandCaveats=true}}`);

      caveatsToCheck.forEach(caveatName => {
        const caveatSelector =
          `.dataAccessCaveats-field .${caveatName}Caveat-field.caveat-group`;
        expect(this.$(caveatSelector)).to.exist;
      });
      expect(this.$('.dataAccessCaveats-field .caveat-group'))
        .to.have.length(caveatsToCheck.length);
    }
  );

  it(
    'shows access token caveats when token type is changed to access',
    function () {
      this.render(hbs `{{token-editor expandCaveats=true}}`);

      return click('.type-field .option-access')
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
      this.render(hbs `{{token-editor expandCaveats=true}}`);

      return click('.type-field .option-identity')
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
      this.render(hbs `{{token-editor expandCaveats=true}}`);

      return click('.type-field .option-invite')
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
      this.render(hbs `{{token-editor expandCaveats=true onChange=(action "change")}}`);

      return toggleCaveat('objectId')
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

  it('renders disabled submit button', function () {
    this.render(hbs `{{token-editor}}`);

    const $submit = this.$('.submit-token');
    expect($submit).to.exist;
    expect($submit.text().trim()).to.equal('Create token');
    expect($submit).to.have.attr('disabled');
  });

  it('renders enabled submit button when form becomes valid', function () {
    this.render(hbs `{{token-editor}}`);

    return fillIn('.name-field input', 'abc')
      .then(() =>
        expect(this.$('.submit-token')).to.not.have.attr('disabled')
      );
  });

  it('calls injected onSubmit on submit click', function () {
    const submitSpy = sinon.spy();
    this.on('submit', submitSpy);
    this.render(hbs `{{token-editor onSubmit=(action "submit")}}`);

    return fillIn('.name-field input', 'abc')
      .then(() => click('.submit-token'))
      .then(() => {
        expect(submitSpy).to.be.calledOnce;
      });
  });

  it(
    'passess token raw model via injected onSubmit on submit click (access token example with all caveats)',
    function () {
      const submitSpy = sinon.spy();
      this.on('submit', submitSpy);
      this.render(hbs `{{token-editor expandCaveats=true onSubmit=(action "submit")}}`);

      return fillIn('.name-field input', 'somename')
        .then(() => click('.type-field .option-access'))
        // expire
        .then(() => toggleCaveat('expire'))
        // region
        .then(() => toggleCaveat('region'))
        .then(() => new RegionTypeHelper().selectOption(2))
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
        .then(() => toggleCaveat('service'))
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
          const rawToken = submitSpy.lastCall.args[0];
          expect(rawToken).to.have.property('name', 'somename');
          expect(rawToken).to.have.nested.property('type.accessToken');

          const caveats = rawToken.caveats;
          expect(caveats.length).to.equal(11);
          expect(caveats.findBy('type', 'time')).to.have.property('validUntil');
          expect(caveats.findBy('type', 'geo.region')).to.deep.include({
            filter: 'blacklist',
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
      const submitSpy = sinon.spy();
      this.on('submit', submitSpy);
      this.render(hbs `{{token-editor onSubmit=(action "submit")}}`);

      return fillIn('.name-field input', 'somename')
        .then(() => click('.type-field .option-invite'))
        .then(() => new InviteTypeHelper().selectOption(1))
        .then(() => new TargetHelper().selectOption(1))
        .then(() => click('.usageLimit-field .option-number'))
        .then(() => fillIn('.usageLimitNumber-field input', '10'))
        .then(() => click('.submit-token'))
        .then(() => {
          const rawToken = submitSpy.lastCall.args[0];
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
      const submitSpy = sinon.spy();
      this.on('submit', submitSpy);
      this.render(hbs `{{token-editor onSubmit=(action "submit")}}`);

      const registerOneproviderDropdownIndex = tokenInviteTypes.indexOf(
        tokenInviteTypes.findBy('inviteType', 'registerOneprovider')
      ) + 1;
      return fillIn('.name-field input', 'somename')
        .then(() => click('.type-field .option-invite'))
        .then(() =>
          new InviteTypeHelper().selectOption(registerOneproviderDropdownIndex)
        )
        .then(() => click('.submit-token'))
        .then(() => {
          const rawToken = submitSpy.lastCall.args[0];
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
      this.render(hbs `{{token-editor onSubmit=(action "submit")}}`);

      return fillIn('.name-field input', 'abc')
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
  type: 'basic.type',
  inviteType: 'basic.inviteDetails.inviteType',
  target: 'basic.inviteDetails.inviteTargetDetails.target',
  privileges: 'basic.inviteDetails.inviteTargetDetails.invitePrivilegesDetails.privileges',
  usageLimit: 'basic.inviteDetails.usageLimit',
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
