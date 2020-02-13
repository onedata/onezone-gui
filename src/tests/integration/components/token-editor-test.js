import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { fillIn, click } from 'ember-native-dom-helpers';
import EmberPowerSelectHelper from '../../helpers/ember-power-select-helper';
import $ from 'jquery';
import wait from 'ember-test-helpers/wait';
import _ from 'lodash';
import { lookupService } from '../../helpers/stub-service';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { resolve, Promise } from 'rsvp';
import moment from 'moment';

const tokenSubtypes = [{
  subtype: 'userJoinGroup',
  label: 'Invite user to group',
  icon: 'group',
  targetModelName: 'group',
  targetLabel: 'Inviting group',
  targetPlaceholder: 'Select group...',
}, {
  subtype: 'groupJoinGroup',
  label: 'Invite group to group',
  icon: 'group',
  targetModelName: 'group',
  targetLabel: 'Inviting group',
  targetPlaceholder: 'Select group...',
}, {
  subtype: 'userJoinSpace',
  label: 'Invite user to space',
  icon: 'space',
  targetModelName: 'space',
  targetLabel: 'Inviting space',
  targetPlaceholder: 'Select space...',
}, {
  subtype: 'groupJoinSpace',
  label: 'Invite group to space',
  icon: 'space',
  targetModelName: 'space',
  targetLabel: 'Inviting space',
  targetPlaceholder: 'Select space...',
}, {
  subtype: 'userJoinCluster',
  label: 'Invite user to cluster',
  icon: 'cluster',
  targetModelName: 'cluster',
  targetLabel: 'Inviting cluster',
  targetPlaceholder: 'Select cluster...',
}, {
  subtype: 'groupJoinCluster',
  label: 'Invite group to cluster',
  icon: 'cluster',
  targetModelName: 'cluster',
  targetLabel: 'Inviting cluster',
  targetPlaceholder: 'Select cluster...',
}, {
  subtype: 'userJoinHarvester',
  label: 'Invite user to harvester',
  icon: 'light-bulb',
  targetModelName: 'harvester',
  targetLabel: 'Inviting harvester',
  targetPlaceholder: 'Select harvester...',
}, {
  subtype: 'groupJoinHarvester',
  label: 'Invite group to harvester',
  icon: 'light-bulb',
  targetModelName: 'harvester',
  targetLabel: 'Inviting harvester',
  targetPlaceholder: 'Select harvester...',
}, {
  subtype: 'spaceJoinHarvester',
  label: 'Invite space to harvester',
  icon: 'light-bulb',
  targetModelName: 'harvester',
  targetLabel: 'Inviting harvester',
  targetPlaceholder: 'Select harvester...',
  noPrivileges: true,
}, {
  subtype: 'supportSpace',
  label: 'Support space',
  icon: 'space',
  targetModelName: 'space',
  targetLabel: 'Space to be supported',
  targetPlaceholder: 'Select space...',
  noPrivileges: true,
}, {
  subtype: 'registerOneprovider',
  label: 'Register Oneprovider',
  icon: 'provider',
}];
const caveats = [{
  name: 'expire',
  label: 'Expire',
  disabledDescription: 'This token has unlimited lifetime',
}, {
  name: 'interface',
  label: 'Interface',
  disabledDescription: 'This token can be used with REST and Oneclient',
}, {
  name: 'asn',
  label: 'ASN',
  disabledDescription: 'This token can be used on any ASN',
}, {
  name: 'ip',
  label: 'IP',
  disabledDescription: 'This token can be used without any IP address restrictions',
}, {
  name: 'region',
  label: 'Region',
  disabledDescription: 'This token is valid in all regions',
}, {
  name: 'country',
  label: 'Country',
  disabledDescription: 'This token can be used regardless country',
}, {
  name: 'readonly',
  label: 'Read only',
  disabledDescription: 'This token can be used for both reading and writing data',
  dontTestValue: true,
}, {
  name: 'path',
  label: 'Path',
  disabledDescription: 'This token does not restrict access to any specific files path',
}, {
  name: 'objectId',
  label: 'Object ID',
  disabledDescription: 'This token allows to interact with all data objects in Onedata',
}];
const preselectedSubtype = tokenSubtypes[0];
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
    sinon.stub(lookupService(this, 'current-user'), 'getCurrentUserRecord')
      .resolves({ entityId: 'user1' });
    const onedataGraphStub =
      sinon.stub(lookupService(this, 'onedata-graph'), 'request');
    const mockedRecords = {};
    [
      'space',
      'group',
      'harvester',
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
    return wait().then(() => {
      expect(this.$('.type-field .control-label').text().trim())
        .to.equal('Type:');
      expect(this.$('.type-field .option-access').text().trim())
        .to.equal('access');
      expect(this.$('.type-field .option-invite').text().trim())
        .to.equal('invitation');
    });
  });

  it('has "type" field with preselected "access" option', function () {
    this.render(hbs `{{token-editor onChange=(action "change")}}`);

    return wait().then(() => {
      expectToHaveValue(this, 'type', 'access');
      expectToBeValid(this, 'type');
      expect(this.$('.type-field .option-access input').prop('checked')).to.be
        .true;
    });
  });

  it('notifies about "type" field change', function () {
    this.render(hbs `{{token-editor onChange=(action "change")}}`);

    return wait()
      .then(() => click('.type-field .option-invite'))
      .then(() => {
        expectToHaveValue(this, 'type', 'invite');
        expectToBeValid(this, 'type');
      });
  });

  it(
    'does not show invitation related basic fields if "type" is "access"',
    function () {
      this.render(hbs `{{token-editor}}`);

      expect(this.$('.inviteDetails-collapse')).to.not.have.class('in');
    }
  );

  it(
    'shows invitation related basic fields only if "type" is "invite"',
    function () {
      this.render(hbs `{{token-editor}}`);

      return wait()
        .then(() => click('.type-field .option-invite'))
        .then(() => {
          expect(this.$('.inviteDetails-collapse')).to.have.class('in');
        });
    }
  );

  it('renders "subtype" field', function () {
    this.render(hbs `{{token-editor}}`);

    const subtypeHelper = new SubtypeHelper();
    expectLabelToEqual(this, 'subtype', 'Invitation type');
    return wait()
      .then(() => click('.type-field .option-invite'))
      .then(() => subtypeHelper.open())
      .then(() => {
        tokenSubtypes.forEach(({ label, icon }, index) => {
          const $option = $(subtypeHelper.getNthOption(index + 1));
          expect($option.text().trim()).to.equal(label);
          expect($option.find('.one-icon')).to.have.class(`oneicon-${icon}`);
        });
      });
  });

  it(
    `has "subtype" field with preselected "${preselectedSubtype.label}" option`,
    function () {
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      return wait()
        .then(() => click('.type-field .option-invite'))
        .then(() => {
          expectToHaveValue(this, 'subtype', preselectedSubtype.subtype);
          expectToBeValid(this, 'subtype');
          const $dropdownTrigger = $(new SubtypeHelper().getTrigger());
          expect($dropdownTrigger.text().trim())
            .to.equal(preselectedSubtype.label);
        });
    }
  );

  it(
    'has not valid "target" field when it is empty',
    function () {
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      return wait()
        .then(() => click('.type-field .option-invite'))
        .then(() => {
          expectToHaveNoValue(this, 'target');
          expectToBeInvalid(this, 'target');
        });
    }
  );

  it(
    'does not inform about invalid "target" field when it is hidden',
    function () {
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      return wait()
        .then(() => expectToBeValid(this, 'target'));
    }
  );

  tokenSubtypes.forEach(({
    subtype,
    label,
    icon,
    targetModelName,
    targetLabel,
    targetPlaceholder,
    noPrivileges,
  }, index) => {
    it(`notifies about "subtype" field change to "${label}"`, function () {
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      const subtypeHelper = new SubtypeHelper();

      return wait()
        .then(() => click('.type-field .option-invite'))
        .then(() => subtypeHelper.selectOption(index + 1))
        .then(() => {
          expectToHaveValue(this, 'subtype', subtype);
          expectToBeValid(this, 'subtype');
        });
    });

    if (targetModelName) {
      it(
        `shows correct "target" field when "subtype" field is "${label}"`,
        function () {
          this.render(hbs `{{token-editor}}`);

          const subtypeHelper = new SubtypeHelper();
          const targetHelper = new TargetHelper();

          return wait()
            .then(() => click('.type-field .option-invite'))
            .then(() => subtypeHelper.selectOption(index + 1))
            .then(() => {
              const $collapse = this.$('.inviteTargetDetails-collapse');
              const $placeholder =
                this.$('.target-field .ember-power-select-placeholder');
              expect($collapse).to.have.class('in');
              expectLabelToEqual(this, 'target', targetLabel);
              expect($placeholder.text().trim()).to.equal(targetPlaceholder);
            })
            .then(() => targetHelper.open())
            .then(() => {
              const $thirdOption = $(targetHelper.getNthOption(3));
              expect($thirdOption).to.exist;
              expect(targetHelper.getNthOption(4)).to.not.exist;
              expect($thirdOption.find('.one-icon'))
                .to.have.class(`oneicon-${icon}`);
              expect($thirdOption.find('.text').text().trim())
                .to.equal(`${targetModelName}2`);
            });
        }
      );

      it(
        `notifies about "target" field change when "subtype" field is "${label}"`,
        function () {
          this.render(hbs `{{token-editor onChange=(action "change")}}`);

          const subtypeHelper = new SubtypeHelper();
          const targetHelper = new TargetHelper();

          return wait()
            .then(() => click('.type-field .option-invite'))
            .then(() => subtypeHelper.selectOption(index + 1))
            .then(() => targetHelper.selectOption(1))
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
          `shows correct privileges field when "subtype" field is "${label}"`,
          function () {
            this.render(hbs `{{token-editor}}`);

            return wait()
              .then(() => click('.type-field .option-invite'))
              .then(() => new SubtypeHelper().selectOption(index + 1))
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
                expect(this.$('.one-way-toggle.checked')).to.have.length(1);
              });
          }
        );

        it(
          `notifies about "privileges" field change when "subtype" field is "${label}"`,
          function () {
            this.render(hbs `{{token-editor onChange=(action "change")}}`);

            const subtypeHelper = new SubtypeHelper();

            return wait()
              .then(() => click('.type-field .option-invite'))
              .then(() => subtypeHelper.selectOption(index + 1))
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
          `does not show privileges when "subtype" field is "${label}"`,
          function () {
            this.render(hbs `{{token-editor onChange=(action "change")}}`);

            const subtypeHelper = new SubtypeHelper();

            return wait()
              .then(() => click('.type-field .option-invite'))
              .then(() => subtypeHelper.selectOption(index + 1))
              .then(() => {
                expect(this.$('.invitePrivilegesDetails-collapse'))
                  .to.not.have.class('in');
              });
          }
        );
      }
    } else {

      it(
        `does not show invite target details when "subtype" field is "${label}"`,
        function () {
          this.render(hbs `{{token-editor onChange=(action "change")}}`);

          const subtypeHelper = new SubtypeHelper();

          return wait()
            .then(() => click('.type-field .option-invite'))
            .then(() => subtypeHelper.selectOption(index + 1))
            .then(() => {
              expect(this.$('.inviteTargetDetails-collapse'))
                .to.not.have.class('in');
            });
        }
      );
    }
  });

  it(
    'resets "target" field after change to subtype which requires different model',
    function () {
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      const subtypeHelper = new SubtypeHelper();
      const targetHelper = new TargetHelper();

      return wait()
        .then(() => click('.type-field .option-invite'))
        .then(() => targetHelper.selectOption(1))
        .then(() => subtypeHelper.selectOption(3))
        .then(() => expectToHaveNoValue(this, 'target'));
    }
  );

  it('renders "usageLimit" field', function () {
    this.render(hbs `{{token-editor}}`);

    expectLabelToEqual(this, 'usageLimit', 'Usage limit');
    return wait()
      .then(() => click('.type-field .option-invite'))
      .then(() => {
        expect(this.$('.usageLimit-field .control-label').text().trim())
          .to.equal('Usage limit:');
        expect(this.$('.usageLimit-field .option-infinity').text().trim())
          .to.equal('infinity');
        expect(this.$('.usageLimit-field .option-number').text().trim())
          .to.equal('');
        expect(this.$('.usageLimitNumber-field input').attr('placeholder'))
          .to.equal('Enter exact number');
      });
  });

  it(
    'has "usageLimit" field with preselected "infinity" option and disabled number input',
    function () {
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      return wait()
        .then(() => click('.type-field .option-invite'))
        .then(() => {
          expectToHaveValue(this, 'usageLimit', sinon.match({
            usageLimitSelector: 'infinity',
          }));
          expectToBeValid(this, 'usageLimit');
          expect(this.$('.usageLimit-field .option-infinity input').prop('checked'))
            .to.be.true;
        });
    }
  );

  it(
    'notifies about empty limit input error when usageLimit is set to use number',
    function () {
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      return wait()
        .then(() => click('.type-field .option-invite'))
        .then(() => click('.usageLimit-field .option-number'))
        .then(() => {
          expectToHaveValue(this, 'usageLimit', sinon.match({
            usageLimitSelector: 'number',
          }));
          expectToBeInvalid(this, 'usageLimit');
        });
    }
  );

  it(
    'notifies about correct limit input value when usageLimit is set to use number',
    function () {
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      return wait()
        .then(() => click('.type-field .option-invite'))
        .then(() => click('.usageLimit-field .option-number'))
        .then(() => fillIn('.usageLimitNumber-field input', '10'))
        .then(() => {
          expectToHaveValue(this, 'usageLimit', sinon.match({
            usageLimitSelector: 'number',
            usageLimitNumber: '10',
          }));
          expectToBeValid(this, 'usageLimit');
        });
    }
  );

  it(
    'notifies about too low limit input error when usageLimit is set to use number',
    function () {
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      return wait()
        .then(() => click('.type-field .option-invite'))
        .then(() => click('.usageLimit-field .option-number'))
        .then(() => fillIn('.usageLimitNumber-field input', '0'))
        .then(() => {
          expectToHaveValue(this, 'usageLimit', sinon.match({
            usageLimitSelector: 'number',
            usageLimitNumber: '0',
          }));
          expectToBeInvalid(this, 'usageLimit');
        });
    }
  );

  caveats.forEach(({ name, label, disabledDescription, dontTestValue }) => {
    it(
      `renders unchecked toggle, label and disabled description for ${name} caveat on init`,
      function () {
        this.render(hbs `{{token-editor}}`);

        const $disabledDescription = this.$(`.${name}DisabledText-field`);

        expectCaveatToggleState(this, name, false);
        expectLabelToEqual(this, name, label);
        expect(getFieldElement(this, name)).to.not.exist;
        expect($disabledDescription.text().trim()).to.equal(disabledDescription);
      }
    );

    it(
      `has valid and disabled ${name} caveat on init`,
      function () {
        this.render(hbs `{{token-editor onChange=(action "change")}}`);

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
        this.render(hbs `{{token-editor onChange=(action "change")}}`);

        return wait()
          .then(() => toggleCaveat(name))
          .then(() => {
            const $disabledDescription = this.$(`.${name}DisabledText-field`);

            expectCaveatToggleState(this, name, true);
            expect($disabledDescription).to.not.exist;

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

      this.render(hbs `{{token-editor onChange=(action "change")}}`);

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
    'renders interface caveat form elements when that caveat is enabled',
    function () {
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      let $restOption, $oneclientOption;
      return wait()
        .then(() => toggleCaveat('interface'))
        .then(() => {
          $restOption = this.$('.option-rest');
          $oneclientOption = this.$('.option-oneclient');
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
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('interface'))
        .then(() => click('.option-oneclient'))
        .then(() => {
          expectCaveatToHaveValue(this, 'interface', true, 'oneclient');
          expectToBeValid(this, 'interface');
        })
        .then(() => click('.option-rest'))
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
        this.render(hbs `{{token-editor onChange=(action "change")}}`);

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
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

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
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

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
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('ip'))
        .then(() => click('.ip-field .tags-input'))
        .then(() => fillIn(
          '.ip-field .text-editor-input',
          '1.1.1.1/24,1.1.1.1/23,1.1.1.1,255.255.255.255,1.1.1.1/24,'))
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
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

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
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

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
        this.render(hbs `{{token-editor onChange=(action "change")}}`);

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
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

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
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

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
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('country'))
        .then(() => {
          expectCaveatToHaveValue(this, 'country', true,
            sinon.match.has('countryList', sinon.match([])));
          expectCaveatToHaveValue(this, 'country', true,
            sinon.match.has('countryType', 'whitelist'));
          expectToBeInvalid(this, 'country');
        });
    }
  );

  it(
    'notifies about country caveat change',
    function () {
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

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
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

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
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

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
    'renders empty, valid path caveat when it is enabled',
    function () {
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

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
    'preselects first available space and path "" for new entry in path caveat',
    function () {
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('path'))
        .then(() =>
          click(getFieldElement(this, 'path').find('.add-field-button')[0])
        )
        .then(() => {
          const selectedTarget =
            this.get('mockedRecords.space.lastObject');
          expectCaveatToHaveValue(this, 'path', true,
            sinon.match.hasNested('pathEntry0.pathSpace', selectedTarget));
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
      this.render(hbs `{{token-editor}}`);

      let pathSpaceHelper;
      return wait()
        .then(() => toggleCaveat('path'))
        .then(() =>
          click(getFieldElement(this, 'path').find('.add-field-button')[0])
        )
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
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      let pathSpaceHelper;
      return wait()
        .then(() => toggleCaveat('path'))
        .then(() =>
          click(getFieldElement(this, 'path').find('.add-field-button')[0])
        )
        .then(() => {
          pathSpaceHelper = new PathSpaceHelper();
          return pathSpaceHelper.selectOption(3);
        })
        .then(() => {
          const $selectorTrigger = $(pathSpaceHelper.getTrigger());
          expect($selectorTrigger.find('.text').text().trim()).to.equal('space2');

          const selectedTarget =
            this.get('mockedRecords.space.firstObject');
          expectCaveatToHaveValue(this, 'path', true,
            sinon.match.hasNested('pathEntry0.pathSpace', selectedTarget));
          expectToBeValid(this, 'path');
        });
    }
  );

  it(
    'notifies about path caveat entry path change',
    function () {
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('path'))
        .then(() =>
          click(getFieldElement(this, 'path').find('.add-field-button')[0])
        )
        .then(() => fillIn(
          getFieldElement(this, 'path').find('.pathString-field input')[0],
          '/abc'
        ))
        .then(() => {
          expectCaveatToHaveValue(this, 'path', true,
            sinon.match.hasNested('pathEntry0.pathString', '/abc'));
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
        this.render(hbs `{{token-editor onChange=(action "change")}}`);

        return wait()
          .then(() => toggleCaveat('path'))
          .then(() =>
            click(getFieldElement(this, 'path').find('.add-field-button')[0])
          )
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
        this.render(hbs `{{token-editor onChange=(action "change")}}`);

        return wait()
          .then(() => toggleCaveat('path'))
          .then(() =>
            click(getFieldElement(this, 'path').find('.add-field-button')[0])
          )
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
      this.render(hbs `{{token-editor}}`);

      expect(this.$('.readonlyEnabledText-field')).to.not.exist;
    }
  );

  it(
    'renders readonly caveat form elements when that caveat is enabled',
    function () {
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('readonly'))
        .then(() => {
          expect(this.$('.readonlyEnabledText-field').text().trim())
            .to.equal('This token allows only read access to user files');

          expectToBeValid(this, 'readonly');
        });
    }
  );

  it(
    'renders empty, valid objectId caveat when it is enabled',
    function () {
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

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
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

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
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('objectId'))
        .then(() =>
          click(getFieldElement(this, 'objectId').find('.add-field-button')[0])
        )
        .then(() => expectToBeInvalid(this, 'objectId'));
    }
  );

  it(
    'has interface, readonly, path and objectId caveats under accessOnlyCaveats',
    function () {
      const caveatsToCheck = [
        'interface',
        'readonly',
        'path',
        'objectId',
      ];

      this.render(hbs `{{token-editor}}`);

      return wait()
        .then(() => {
          caveatsToCheck.forEach(caveatName => {
            const caveatSelector =
              `.accessOnlyCaveats-field .${caveatName}Caveat-field.caveat-group`;
            expect(this.$(caveatSelector)).to.exist;
          });
          expect(this.$('.accessOnlyCaveats-field .caveat-group'))
            .to.have.length(caveatsToCheck.length);
        });
    }
  );

  it(
    'shows access only caveats when token type is changed to access',
    function () {
      this.render(hbs `{{token-editor}}`);

      return wait()
        .then(() => click('.type-field .option-access'))
        .then(() => {
          expect(this.$('.accessOnlyCaveats-collapse')).to.have.class('in');
        });
    }
  );

  it(
    'hides access only caveats when token type is changed to invitation',
    function () {
      this.render(hbs `{{token-editor}}`);

      return wait()
        .then(() => click('.type-field .option-invite'))
        .then(() => {
          expect(this.$('.accessOnlyCaveats-collapse')).to.not.have.class('in');
        });
    }
  );

  it(
    'ignores validation errors in access only caveats when token type is not access',
    function () {
      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      return wait()
        .then(() => toggleCaveat('objectId'))
        .then(() =>
          click(getFieldElement(this, 'objectId').find('.add-field-button')[0])
        )
        .then(() => click('.type-field .option-invite'))
        .then(() => expectToBeValid(this, 'objectId'));
    }
  );

  it('renders disabled submit button', function () {
    this.render(hbs `{{token-editor}}`);

    return wait()
      .then(() => {
        const $submit = this.$('.submit-token');
        expect($submit).to.exist;
        expect($submit.text().trim()).to.equal('Create token');
        expect($submit).to.have.attr('disabled');
      });
  });

  it('renders enabled submit button when form becomes valid', function () {
    this.render(hbs `{{token-editor}}`);

    return wait()
      .then(() => fillIn('.name-field input', 'abc'))
      .then(() =>
        expect(this.$('.submit-token')).to.not.have.attr('disabled')
      );
  });

  it('calls injected onSubmit on submit click', function () {
    const submitSpy = sinon.spy();
    this.on('submit', submitSpy);
    this.render(hbs `{{token-editor onSubmit=(action "submit")}}`);

    return wait()
      .then(() => fillIn('.name-field input', 'abc'))
      .then(() => click('.submit-token'))
      .then(() => {
        expect(submitSpy).to.be.calledOnce;
      });
  });

  it(
    'passess token raw model via injected onSubmit on submit click (access token example with all caveats)',
    function () {
      this.timeout(4000);
      const submitSpy = sinon.spy();
      this.on('submit', submitSpy);
      this.render(hbs `{{token-editor onSubmit=(action "submit")}}`);

      return wait()
        .then(() => fillIn('.name-field input', 'somename'))
        .then(() => click('.type-field .option-access'))
        // 
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
          expect(caveats.length).to.equal(9);
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

      return wait()
        .then(() => fillIn('.name-field input', 'somename'))
        .then(() => click('.type-field .option-invite'))
        .then(() => new SubtypeHelper().selectOption(1))
        .then(() => new TargetHelper().selectOption(1))
        .then(() => click('.usageLimit-field .option-number'))
        .then(() => fillIn('.usageLimitNumber-field input', '10'))
        .then(() => click('.submit-token'))
        .then(() => {
          const rawToken = submitSpy.lastCall.args[0];
          expect(rawToken).to.have.property('name', 'somename');
          expect(rawToken).to.have.deep.nested.property('type.inviteToken', {
            subtype: 'userJoinGroup',
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

      const registerOneproviderDropdownIndex = tokenSubtypes.indexOf(
        tokenSubtypes.findBy('subtype', 'registerOneprovider')
      ) + 1;
      return wait()
        .then(() => fillIn('.name-field input', 'somename'))
        .then(() => click('.type-field .option-invite'))
        .then(() => new SubtypeHelper().selectOption(1))
        .then(() => new TargetHelper().selectOption(1))
        .then(() =>
          new SubtypeHelper().selectOption(registerOneproviderDropdownIndex)
        )
        .then(() => click('.submit-token'))
        .then(() => {
          const rawToken = submitSpy.lastCall.args[0];
          expect(rawToken).to.have.property('name', 'somename');
          expect(rawToken).to.have.deep.nested.property('type.inviteToken', {
            subtype: 'registerOneprovider',
            adminUserId: 'user1',
          });
          expect(rawToken).to.not.have.property('caveats');
        });
    }
  );

  it(
    'disables all fields and shows spinner in submit when submit promise is pending',
    function () {
      let submitResolve;
      const submitStub = sinon.stub()
        .returns(new Promise(resolve => submitResolve = resolve));
      this.on('submit', submitStub);
      this.render(hbs `{{token-editor onSubmit=(action "submit")}}`);

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
});

class SubtypeHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.subtype-field .ember-basic-dropdown');
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

const basicFieldNameToFieldPath = {
  name: 'basic.name',
  type: 'basic.type',
  subtype: 'basic.inviteDetails.subtype',
  target: 'basic.inviteDetails.inviteTargetDetails.target',
  privileges: 'basic.inviteDetails.inviteTargetDetails.invitePrivilegesDetails.privileges',
  usageLimit: 'basic.inviteDetails.usageLimit',
};

const caveatsWithAllowDenyTags = [
  'region',
  'country',
];

const accessOnlyCaveats = [
  'interface',
  'readonly',
  'path',
  'objectId',
];

function expectToBeValid(testCase, fieldName) {
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
  expect(invalidFields.filter(path => path.startsWith(valuePath))).to.be.empty;
}

function expectToBeInvalid(testCase, fieldName) {
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
  expect(invalidFields.filter(path => path.startsWith(valuePath))).to.not.be.empty;
}

function caveatEnabledFieldPath(caveatName) {
  if (accessOnlyCaveats.includes(caveatName)) {
    return `caveats.accessOnlyCaveats.${caveatName}Caveat.${caveatName}Enabled`;
  } else {
    return `caveats.${caveatName}Caveat.${caveatName}Enabled`;
  }
}

function caveatValueFieldPath(caveatName) {
  if (accessOnlyCaveats.includes(caveatName)) {
    return `caveats.accessOnlyCaveats.${caveatName}Caveat.${caveatName}`;
  } else {
    return `caveats.${caveatName}Caveat.${caveatName}`;
  }
}

function caveatValueValidationPath(caveatName) {
  let caveatPath = caveatName;
  if (caveatsWithAllowDenyTags.includes(caveatName)) {
    caveatPath = `${caveatName}.${caveatName}List`;
  }
  if (accessOnlyCaveats.includes(caveatName)) {
    return `caveats.accessOnlyCaveats.${caveatName}Caveat.${caveatPath}`;
  } else {
    return `caveats.${caveatName}Caveat.${caveatPath}`;
  }
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

function expectLabelToEqual(testCase, fieldName, label) {
  const isCaveat = !basicFieldNameToFieldPath[fieldName];
  const domFieldName = isCaveat ? `${fieldName}Enabled` : fieldName;
  label = isCaveat ? label : `${label}:`;
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
