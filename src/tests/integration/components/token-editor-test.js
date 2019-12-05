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
}, {
  subtype: 'registerOneprovider',
  label: 'Register Oneprovider',
  icon: 'provider',
}];
const preselectedSubtype = tokenSubtypes[0];

describe('Integration | Component | token editor', function () {
  setupComponentTest('token-editor', {
    integration: true,
  });

  beforeEach(function () {
    [
      'space',
      'group',
      'harvester',
      'cluster',
    ].forEach(modelName => {
      const serviceName = `${modelName}-manager`;
      const getModelsMethodName = `get${_.upperFirst(modelName)}s`;
      const service = lookupService(this, serviceName);
      sinon.stub(service, getModelsMethodName)
        .resolves({
          list: PromiseArray.create({
            promise: resolve(
              _.reverse(_.range(3)).map(index => ({
                name: `${modelName}${index}`,
              }))
            ),
          }),
        });
    });
  });

  it('has class "token-editor"', function () {
    this.render(hbs `{{token-editor}}`);

    expect(this.$('.token-editor')).to.exist;
  });

  it('renders "name" field', function () {
    this.render(hbs `{{token-editor}}`);

    expect(this.$('.name-field label').text().trim()).to.equal('Name:');
    expect(this.$('.name-field input')).to.exist;
  });

  it('has not valid "name" when it is empty', function () {
    const changeSpy = sinon.spy();
    this.on('change', changeSpy);

    this.render(hbs `{{token-editor onChange=(action "change")}}`);

    const arg = changeSpy.lastCall.args[0];
    expect(arg).to.not.have.nested.property('values.basic.name');
    expect(arg.invalidFields).to.include('basic.name');
  });

  it('has valid "name" when it has been changed to not empty value', function () {
    const changeSpy = sinon.spy();
    this.on('change', changeSpy);

    this.render(hbs `{{token-editor onChange=(action "change")}}`);

    return wait()
      .then(() => fillIn('.name-field input', 'abc'))
      .then(() => {
        const arg = changeSpy.lastCall.args[0];
        expect(arg).to.have.nested.property('values.basic.name', 'abc');
        expect(arg.invalidFields).to.not.include('basic.name');
      });
  });

  it('renders "type" field', function () {
    this.render(hbs `{{token-editor}}`);

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
    const changeSpy = sinon.spy();
    this.on('change', changeSpy);

    this.render(hbs `{{token-editor onChange=(action "change")}}`);

    return wait().then(() => {
      const arg = changeSpy.lastCall.args[0];
      expect(arg).to.have.nested.property('values.basic.type', 'access');
      expect(arg.invalidFields).to.not.include('basic.type');
      expect(this.$('.type-field .option-access input').prop('checked')).to.be
        .true;
    });
  });

  it('notifies about "type" field change', function () {
    const changeSpy = sinon.spy();
    this.on('change', changeSpy);

    this.render(hbs `{{token-editor onChange=(action "change")}}`);

    return wait()
      .then(() => click('.type-field .option-invite'))
      .then(() => {
        const arg = changeSpy.lastCall.args[0];
        expect(arg).to.have.nested.property('values.basic.type', 'invite');
        expect(arg.invalidFields).to.not.include('basic.type');
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
    expect(this.$('.subtype-field .control-label').text().trim())
      .to.equal('Invitation type:');
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
      const changeSpy = sinon.spy();
      this.on('change', changeSpy);

      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      return wait()
        .then(() => click('.type-field .option-invite'))
        .then(() => {
          const arg = changeSpy.lastCall.args[0];
          expect(arg).to.have.nested.property(
            'values.basic.inviteDetails.subtype',
            preselectedSubtype.subtype
          );
          expect(arg.invalidFields).to.not.include('basic.inviteDetails.subtype');
          const $dropdownTrigger = $(new SubtypeHelper().getTrigger());
          expect($dropdownTrigger.text().trim())
            .to.equal(preselectedSubtype.label);
        });
    }
  );

  it(
    'has not valid "target" field when it is empty',
    function () {
      const changeSpy = sinon.spy();
      this.on('change', changeSpy);

      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      return wait()
        .then(() => click('.type-field .option-invite'))
        .then(() => {
          expect(changeSpy.lastCall.args[0]).to.not.have.nested.property(
            'values.basic.inviteDetails.inviteTargetDetails.target',
          );
          expect(changeSpy.lastCall.args[0].invalidFields).to.include(
            'basic.inviteDetails.inviteTargetDetails.target'
          );
        });
    }
  );

  it(
    'does not inform about invalid "target" field when it is hidden',
    function () {
      const changeSpy = sinon.spy();
      this.on('change', changeSpy);

      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      return wait()
        .then(() => {
          expect(changeSpy.lastCall.args[0].invalidFields).to.not.include(
            'basic.inviteDetails.inviteTargetDetails.target'
          );
        });
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
      const changeSpy = sinon.spy();
      this.on('change', changeSpy);

      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      const subtypeHelper = new SubtypeHelper();

      return wait()
        .then(() => click('.type-field .option-invite'))
        .then(() => subtypeHelper.selectOption(index + 1))
        .then(() => {
          expect(changeSpy.lastCall.args[0]).to.have
            .nested.property('values.basic.inviteDetails.subtype', subtype);
          expect(changeSpy.lastCall.args[0].invalidFields)
            .to.not.include('basic.inviteDetails.subtype');
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
              const $label = this.$('.target-field .control-label');
              const $placeholder =
                this.$('.target-field .ember-power-select-placeholder');
              expect($collapse).to.have.class('in');
              expect($label.text().trim()).to.equal(targetLabel + ':');
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
          const changeSpy = sinon.spy();
          this.on('change', changeSpy);

          this.render(hbs `{{token-editor onChange=(action "change")}}`);

          const subtypeHelper = new SubtypeHelper();
          const targetHelper = new TargetHelper();

          return wait()
            .then(() => click('.type-field .option-invite'))
            .then(() => subtypeHelper.selectOption(index + 1))
            .then(() => targetHelper.selectOption(1))
            .then(() => {
              expect(changeSpy.lastCall.args[0]).to.have.nested.property(
                'values.basic.inviteDetails.inviteTargetDetails.target.name',
                `${targetModelName}0`
              );
              expect(changeSpy.lastCall.args[0].invalidFields).to.not.include(
                'basic.inviteDetails.inviteTargetDetails.target'
              );
            });
        }
      );
    } else {
      it(
        `does not show invite target details when "subtype" field is "${label}"`,
        function () {
          const changeSpy = sinon.spy();
          this.on('change', changeSpy);

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
      const changeSpy = sinon.spy();
      this.on('change', changeSpy);

      this.render(hbs `{{token-editor onChange=(action "change")}}`);

      const subtypeHelper = new SubtypeHelper();
      const targetHelper = new TargetHelper();

      return wait()
        .then(() => click('.type-field .option-invite'))
        .then(() => targetHelper.selectOption(1))
        .then(() => subtypeHelper.selectOption(3))
        .then(() => {
          expect(changeSpy.lastCall.args[0]).to.not.have.nested.property(
            'values.basic.inviteDetails.inviteTargetDetails.target'
          );
        });
    }
  );

  it('renders "metadata" field', function () {
    this.render(hbs `{{token-editor}}`);

    expect(this.$('.metadata-field label').text().trim()).to.equal('Metadata:');
    expect(this.$('.metadata-field textarea')).to.exist;
  });

  it('has valid "metadata" when it is empty', function () {
    const changeSpy = sinon.spy();
    this.on('change', changeSpy);

    this.render(hbs `{{token-editor onChange=(action "change")}}`);

    const arg = changeSpy.lastCall.args[0];
    expect(arg).to.not.have.nested.property('values.basic.metadata');
    expect(arg.invalidFields).to.not.include('basic.metadata');
  });

  it('notifies about "metadata" field change', function () {
    const changeSpy = sinon.spy();
    this.on('change', changeSpy);

    this.render(hbs `{{token-editor onChange=(action "change")}}`);

    return wait()
      .then(() => fillIn('.metadata-field textarea', '{ "a": 1 }'))
      .then(() => {
        const arg = changeSpy.lastCall.args[0];
        expect(arg)
          .to.have.nested.property('values.basic.metadata', '{ "a": 1 }');
        expect(arg.invalidFields).to.not.include('basic.metadata');
      });
  });

  it('notifies about invalid "metadata" field value', function () {
    const changeSpy = sinon.spy();
    this.on('change', changeSpy);

    this.render(hbs `{{token-editor onChange=(action "change")}}`);

    return wait()
      .then(() => fillIn('.metadata-field textarea', '{ a: 1 }'))
      .then(() => {
        const arg = changeSpy.lastCall.args[0];
        expect(arg).to.have.nested.property('values.basic.metadata', '{ a: 1 }');
        expect(arg.invalidFields).to.include('basic.metadata');
      });
  });
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
