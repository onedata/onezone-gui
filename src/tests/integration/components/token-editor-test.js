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
import { resolve } from 'rsvp';
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
}, {
  subtype: 'supportSpace',
  label: 'Support space',
  icon: 'space',
  targetModelName: 'space',
  targetLabel: 'Space to be supported',
  targetPlaceholder: 'Select space...',
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
    const mockedRecords = {};
    [
      'space',
      'group',
      'harvester',
      'cluster',
    ].forEach(modelName => {
      const serviceName = `${modelName}-manager`;
      const getModelsMethodName = `get${_.upperFirst(modelName)}s`;
      const service = lookupService(this, serviceName);
      mockedRecords[modelName] = _.reverse(_.range(3)).map(index => ({
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

  it('renders "metadata" field', function () {
    this.render(hbs `{{token-editor}}`);

    expectLabelToEqual(this, 'metadata', 'Metadata');
    expect(this.$('.metadata-field textarea')).to.exist;
  });

  it('has valid "metadata" when it is empty', function () {
    this.render(hbs `{{token-editor onChange=(action "change")}}`);

    expectToHaveNoValue(this, 'metadata');
    expectToBeValid(this, 'metadata');
  });

  it('notifies about "metadata" field change', function () {
    this.render(hbs `{{token-editor onChange=(action "change")}}`);

    return wait()
      .then(() => fillIn('.metadata-field textarea', '{ "a": 1 }'))
      .then(() => {
        expectToHaveValue(this, 'metadata', '{ "a": 1 }');
        expectToBeValid(this, 'metadata');
      });
  });

  it('notifies about invalid "metadata" field value', function () {
    this.render(hbs `{{token-editor onChange=(action "change")}}`);

    return wait()
      .then(() => fillIn('.metadata-field textarea', '{ a: 1 }'))
      .then(() => {
        expectToHaveValue(this, 'metadata', '{ a: 1 }');
        expectToBeInvalid(this, 'metadata');
      });
  });

  caveats.forEach(({ name, label, disabledDescription }) => {
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

        expectCaveatToHaveValue(this, name, false);
        expectToBeValid(this, name);
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
            expect(getFieldElement(this, name)).to.exist;
            expect($disabledDescription).to.not.exist;
            expectCaveatToHaveValue(this, name, true);
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
    'region',
    'country',
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
            expectCaveatToHaveValue(this, 'region', true, sinon.match([value]));
            expectToBeValid(this, 'region');
          });
      }
    );
  });

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
          expectCaveatToHaveValue(this, 'region', true, sinon.match([
            'Asia',
            'Europe',
          ]));
          expectToBeValid(this, 'region');
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
            sinon.match(['CZ', 'DK', 'PL']));
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
          expectCaveatToHaveValue(this, 'country', true, sinon.match([]));
          expectToBeInvalid(this, 'country');
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

function getTagsSelector() {
  return $('.webui-popover.in .tags-selector');
}

const basicFieldNameToFieldPath = {
  name: 'basic.name',
  type: 'basic.type',
  subtype: 'basic.inviteDetails.subtype',
  target: 'basic.inviteDetails.inviteTargetDetails.target',
  metadata: 'basic.metadata',
};

function expectToBeValid(testCase, fieldName) {
  const invalidFields = testCase.get('changeSpy').lastCall.args[0].invalidFields;
  const fieldPath = basicFieldNameToFieldPath[fieldName];
  if (fieldPath) {
    expect(invalidFields).to.not.include(fieldPath);
  } else {
    // Not found, probably a caveat field
    expect(invalidFields).to.not.include(caveatEnabledFieldPath(fieldName));
    expect(invalidFields).to.not.include(caveatValueFieldPath(fieldName));
  }
}

function expectToBeInvalid(testCase, fieldName) {
  const invalidFields = testCase.get('changeSpy').lastCall.args[0].invalidFields;
  const fieldPath = basicFieldNameToFieldPath[fieldName];
  if (fieldPath) {
    expect(invalidFields).to.include(fieldPath);
  } else {
    // Not found, probably a caveat field
    expect(invalidFields).to.not.include(caveatEnabledFieldPath(fieldName));
    expect(invalidFields).to.include(caveatValueFieldPath(fieldName));
  }
}

function caveatEnabledFieldPath(caveatName) {
  return `caveats.${caveatName}Caveat.${caveatName}Enabled`;
}

function caveatValueFieldPath(caveatName) {
  return `caveats.${caveatName}Caveat.${caveatName}`;
}

function expectToHaveValue(testCase, fieldName, value) {
  const changeArg = testCase.get('changeSpy').lastCall.args[0];
  const fieldValuePath = `values.${basicFieldNameToFieldPath[fieldName]}`;
  expect(changeArg).to.have.nested.property(fieldValuePath, value);
}

function expectToHaveNoValue(testCase, fieldName) {
  const changeArg = testCase.get('changeSpy').lastCall.args[0];
  const fieldValuePath = `values.${basicFieldNameToFieldPath[fieldName]}`;
  expect(changeArg).to.not.have.nested.property(fieldValuePath);
}

function expectCaveatToHaveValue(testCase, caveatName, isEnabled, value = sinon.match.any) {
  const lastCall = testCase.get('changeSpy').lastCall;
  const caveatEnabledValuePath = `values.${caveatEnabledFieldPath(caveatName)}`;
  const caveatValueValuePath = `values.${caveatValueFieldPath(caveatName)}`;
  expect(lastCall).to.have.been.calledWith(
    sinon.match.hasNested(caveatEnabledValuePath, isEnabled)
  );
  expect(lastCall).to.have.been.calledWith(
    sinon.match.hasNested(caveatValueValuePath, value)
  );
}

function expectLabelToEqual(testCase, fieldName, label) {
  const isCaveat = !basicFieldNameToFieldPath[fieldName];
  const domFieldName = isCaveat ? `${fieldName}Enabled` : fieldName;
  label = isCaveat ? label : `${label}:`;
  expect(testCase.$(`.${domFieldName}-field label`).text().trim()).to.equal(label);
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
