import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../../helpers/stub-service';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { resolve, Promise } from 'rsvp';
import { set } from '@ember/object';
import EmberPowerSelectHelper from '../../../helpers/ember-power-select-helper';
import OneTooltipHelper from '../../../helpers/one-tooltip';
import { focus, blur, fillIn, click } from 'ember-native-dom-helpers';
import sinon from 'sinon';

const exampleHarvester = {
  entityId: 'abc',
  name: 'harvester1',
  plugin: 'elasticsearch_plugin',
  endpoint: 'someendpoint',
  public: true,
};

describe('Integration | Component | harvester configuration/general', function () {
  setupComponentTest('harvester-configuration/general', {
    integration: true,
  });

  beforeEach(function () {
    const plugins = [{
      id: 'elasticsearch_plugin',
      name: 'Elasticsearch plugin',
    }];
    set(
      lookupService(this, 'harvester-manager'),
      'pluginsListProxy',
      promiseArray(resolve(plugins))
    );
    set(
      lookupService(this, 'onedata-connection'),
      'defaultHarvesterEndpoint',
      'default.endpoint'
    );
  });

  it('has class "harvester-configuration-general"', function () {
    this.render(hbs `{{harvester-configuration/general}}`);

    expect(this.$('.harvester-configuration-general')).to.have.length(1);
  });

  context('in create mode', function () {
    it('shows empty text field with "Name" label and no placeholder', function () {
      this.render(hbs `{{harvester-configuration/general mode="create"}}`);

      const $formGroup = this.$('.name-field');
      const $input = $formGroup.find('input');
      expect($formGroup).to.exist;
      expect($formGroup.find('.control-label').text().trim()).to.equal('Name:');
      expect($input).to.exist.and.to.have.attr('type', 'text');
      expect($input).to.have.value('');
      expect($input).to.not.have.attr('placeholder');
    });

    it(
      'shows dropdown field with "Plugin" label, tip, preselected option and plugins list',
      function () {
        this.render(hbs `{{harvester-configuration/general mode="create"}}`);

        const pluginDropdown = new PluginHelper();
        const tooltip =
          new OneTooltipHelper('.plugin-field .one-label-tip .oneicon');
        return pluginDropdown.open()
          .then(() => {
            const $formGroup = this.$('.plugin-field');
            const $trigger = pluginDropdown.getTrigger();
            expect($formGroup).to.exist;
            expect($formGroup.find('.control-label').text().trim()).to.equal('Plugin:');
            expect($trigger.textContent.trim()).to.equal('Elasticsearch plugin');
            expect(pluginDropdown.getNthOption(1).textContent.trim())
              .to.equal('Elasticsearch plugin');
            expect(pluginDropdown.getNthOption(2)).to.not.exist;

            return tooltip.getText();
          })
          .then(tipText => expect(tipText).to.equal(
            'Onezone plugin used to integrate with an external harvesting service (e.g. Elasticsearch). Can provide persistence and analytics for harvested metadata.'
          ));
      }
    );

    it(
      'shows preselected toggle field with "Use default harvesting backend" label and tip',
      function () {
        this.render(hbs `{{harvester-configuration/general mode="create"}}`);

        const tooltip = new OneTooltipHelper(
          '.useDefaultHarvestingBackend-field .one-label-tip .oneicon'
        );
        const $formGroup = this.$('.useDefaultHarvestingBackend-field');
        expect($formGroup).to.exist;
        expect($formGroup.find('.control-label').text().trim())
          .to.equal('Use default harvesting backend:');
        expect($formGroup.find('.one-way-toggle')).to.have.class('checked');

        return tooltip.getText()
          .then(tipText => expect(tipText).to.equal(
            'If enabled, default harvesting backend configured for this Onezone (e.g Elasticsearch) will be used. If disabled, you will have to provide a location (endpoint) of your harvesting service.'
          ));
      }
    );

    it(
      'shows preselected toggle field with "auto setup" label and tip',
      function () {
        this.render(hbs `{{harvester-configuration/general mode="create"}}`);

        const tooltip = new OneTooltipHelper(
          '.autoSetup-field .one-label-tip .oneicon'
        );
        const $formGroup = this.$('.autoSetup-field');
        expect($formGroup).to.exist;
        expect($formGroup.find('.control-label').text().trim())
          .to.equal('Auto setup:');
        expect($formGroup.find('.one-way-toggle')).to.have.class('checked');

        return tooltip.getText()
          .then(tipText => expect(tipText).to.equal(
            'If enabled, default configuration will be applied and default indices will be created in the harvester backend (e.g. Elasticsearch). The harvester will work out-of-the-box with the default GUI.\n\nIf disabled, you will have to manually setup the harvester GUI, its configuration and required indices.'
          ));
      }
    );

    it('has hidden endpoint field by default', function () {
      this.render(hbs `{{harvester-configuration/general mode="create"}}`);

      expect(this.$('.endpointGroup-collapse')).to.not.have.class('in');
    });

    it(
      'shows empty text field with "Endpoint" label, tip and no placeholder when "Use default harvesting backend" toggle is unchecked',
      function () {
        this.render(hbs `{{harvester-configuration/general mode="create"}}`);

        const tooltip = new OneTooltipHelper(
          '.endpoint-field .one-label-tip .oneicon'
        );
        return click('.useDefaultHarvestingBackend-field .one-way-toggle')
          .then(() => {
            expect(this.$('.endpointGroup-collapse')).to.have.class('in');
            const $formGroup = this.$('.endpointGroup-collapse .endpoint-field');
            const $input = $formGroup.find('input');
            expect($formGroup).to.exist;
            expect($formGroup.find('.control-label').text().trim())
              .to.equal('Endpoint:');
            expect($input).to.have.value('');
            expect($input).to.not.have.attr('placeholder');
            return tooltip.getText();
          })
          .then(tipText => expect(tipText).to.equal(
            'Location of the harvesting backend (e.g. Elasticsearch) where the plugin will feed incoming metadata and perform queries.'
          ));
      }
    );

    [{
      selector: '.public-field',
      name: 'public',
    }, {
      selector: '.publicUrl-field',
      name: 'public url',
    }].forEach(({ selector, name }) => {
      it(`does not show ${name} field`, function () {
        this.render(hbs `{{harvester-configuration/general mode="create"}}`);

        expect(this.$(selector)).to.not.exist;
      });
    });

    it(
      'does not show "Use default harvesting backend" toggle and shows "Endpoint" input when there is no default endpoint',
      function () {
        set(
          lookupService(this, 'onedata-connection'),
          'defaultHarvesterEndpoint',
          ''
        );

        this.render(hbs `{{harvester-configuration/general mode="create"}}`);

        expect(this.$('.useDefaultHarvestingBackend-field')).to.not.exist;
        expect(this.$('.endpointGroup-collapse')).to.have.class('in');
      }
    );

    it('shows validation when name field is empty', function () {
      this.render(hbs `{{harvester-configuration/general mode="create"}}`);

      return focus('.name-field input')
        .then(() => blur('.name-field input'))
        .then(() => expect(this.$('.name-field')).to.have.class('has-error'));
    });

    it('shows validation when endpoint field is empty', function () {
      this.render(hbs `{{harvester-configuration/general mode="create"}}`);

      return click('.useDefaultHarvestingBackend-field .one-way-toggle')
        .then(() => focus('.endpoint-field input'))
        .then(() => blur('.endpoint-field input'))
        .then(() => expect(this.$('.endpoint-field')).to.have.class('has-error'));
    });

    it(
      'has disabled "Create" button on init and no "Cancel" button',
      function () {
        this.render(hbs `{{harvester-configuration/general mode="create"}}`);

        const $cancel = this.$('button.cancel-btn');
        const $create = this.$('button.submit-btn');
        expect($cancel).to.not.exist;
        expect($create).to.exist;
        expect($create).to.have.attr('disabled');
        expect($create.text().trim()).to.equal('Create');
      }
    );

    it(
      'has enabled "Create" button when name has been provided',
      function () {
        this.render(hbs `{{harvester-configuration/general mode="create"}}`);

        return fillIn('.name-field input', 'abc')
          .then(() => expect(this.$('.submit-btn')).to.not.have.attr('disabled'));
      }
    );

    it(
      'has disabled "Create" button when for is filled in but endpoint is empty',
      function () {
        this.render(hbs `{{harvester-configuration/general mode="create"}}`);

        return fillIn('.name-field input', 'abc')
          .then(() => click('.useDefaultHarvestingBackend-field .one-way-toggle'))
          .then(() => expect(this.$('.submit-btn')).to.have.attr('disabled'));
      }
    );

    it(
      'has enabled "Create" button when form if filled in and endpoint is provided',
      function () {
        this.render(hbs `{{harvester-configuration/general mode="create"}}`);

        return fillIn('.name-field input', 'abc')
          .then(() => click('.useDefaultHarvestingBackend-field .one-way-toggle'))
          .then(() => fillIn('.endpoint-field input', 'def'))
          .then(() => expect(this.$('.submit-btn')).to.not.have.attr('disabled'));
      }
    );

    it('tries to create harvester on "Create" click using default endpoint', function () {
      const harvesterActions = lookupService(this, 'harvester-actions');
      const createStub = sinon.stub(harvesterActions, 'createHarvester').resolves();

      this.render(hbs `{{harvester-configuration/general mode="create"}}`);

      return fillIn('.name-field input', 'abc')
        .then(() => click('.submit-btn'))
        .then(() => {
          expect(createStub).to.be.calledOnce.and.to.be.calledWith(sinon.match({
            name: 'abc',
            plugin: 'elasticsearch_plugin',
            endpoint: 'default.endpoint',
          }), true);
        });
    });

    it(
      'tries to create harvester on "Create" click using custom endpoint and no auto setup',
      function () {
        const harvesterActions = lookupService(this, 'harvester-actions');
        const createStub = sinon.stub(harvesterActions, 'createHarvester').resolves();

        this.render(hbs `{{harvester-configuration/general mode="create"}}`);

        return fillIn('.name-field input', 'abc')
          .then(() => click('.useDefaultHarvestingBackend-field .one-way-toggle'))
          .then(() => fillIn('.endpoint-field input', 'def'))
          .then(() => click('.autoSetup-field .one-way-toggle'))
          .then(() => click('.submit-btn'))
          .then(() => {
            expect(createStub).to.be.calledOnce.and.to.be.calledWith(sinon.match({
              name: 'abc',
              plugin: 'elasticsearch_plugin',
              endpoint: 'def',
            }), false);
          });
      }
    );

    it(
      'disables buttons and fields after "Create" button click when creating promise is pending',
      function () {
        const harvesterActions = lookupService(this, 'harvester-actions');
        sinon.stub(harvesterActions, 'createHarvester').returns(new Promise(() => {}));

        this.render(hbs `{{harvester-configuration/general mode="create"}}`);

        return fillIn('.name-field input', 'abc')
          .then(() => click('.submit-btn'))
          .then(() => {
            expect(this.$('input:not([disabled])')).to.not.exist;
            expect(this.$('.submit-btn')).to.have.attr('disabled');
            expect(this.$('.submit-btn [role="progressbar"]')).to.exist;
          });
      }
    );

    it('does not have any field in "view" mode', function () {
      this.render(hbs `{{harvester-configuration/general mode="create"}}`);

      expect(this.$('.field-view-mode')).to.not.exist;
    });
  });

  context('in view mode', function () {
    beforeEach(function () {
      this.set('harvester', Object.assign({}, exampleHarvester));

      sinon.stub(lookupService(this, 'router'), 'urlFor')
        .withArgs('public.harvesters', 'abc')
        .returns('internalPath');
    });

    it('does not have any field in "edit" mode', function () {
      this.render(hbs `{{harvester-configuration/general
        mode="view"
        harvester=harvester
      }}`);

      expect(this.$('.field-edit-mode')).to.not.exist;
    });

    it('shows harvester data and public URL field', function () {
      this.render(hbs `{{harvester-configuration/general
        mode="view"
        harvester=harvester
      }}`);

      expect(this.$('.name-field .field-component').text().trim()).to.equal('harvester1');
      expect(this.$('.plugin-field .field-component').text().trim())
        .to.equal('Elasticsearch plugin');
      expect(this.$('.endpoint-field .field-component').text().trim())
        .to.equal('someendpoint');
      expect(this.$('.public-field .one-way-toggle')).to.have.class('checked');

      expect(this.$('.publicFields-collapse')).to.have.class('in');
      const urlFormGroup = this.$('.publicFields-collapse .publicUrl-field');
      expect(urlFormGroup).to.exist.and.to.have.class('clipboard-field-renderer');
      expect(urlFormGroup.find('.control-label').text().trim()).to.equal('Public URL:');
      const correctUrl = `${location.origin}${location.pathname}internalPath`;
      expect(urlFormGroup.find('input')).to.have.value(correctUrl);
    });

    it('does not show "Public URL" field when harvester is not public', function () {
      this.get('harvester').public = false;

      this.render(hbs `{{harvester-configuration/general
        mode="view"
        harvester=harvester
      }}`);

      expect(this.$('.public-field .one-way-toggle')).to.not.have.class('checked');
      expect(this.$('.publicFields-collapse')).to.not.have.class('in');
    });

    it(
      'does not show fields "Use default harvesting backend" and "Auto setup"',
      function () {
        this.render(hbs `{{harvester-configuration/general
          mode="view"
          harvester=harvester
        }}`);

        expect(this.$('.useDefaultHarvestingBackend-field')).to.not.exist;
        expect(this.$('.autoSetup-field')).to.not.exist;
      }
    );

    it('shows enabled "Edit" button and no "Cancel" button', function () {
      this.render(hbs `{{harvester-configuration/general
        mode="view"
        harvester=harvester
      }}`);

      const $editBtn = this.$('.edit-btn');
      expect($editBtn).to.exist.and.to.not.have.attr('disabled');
      expect($editBtn.text().trim()).to.equal('Edit');
      expect(this.$('button:not(.copy-btn)')).to.have.length(1);
    });

    it('changes mode to "edit" on "Edit" button click', function () {
      this.render(hbs `{{harvester-configuration/general
        mode="view"
        harvester=harvester
      }}`);

      return click('.edit-btn')
        .then(() => expect(this.$('.field-edit-mode')).to.exist);
    });
  });

  context('in edit mode', function () {
    beforeEach(function () {
      this.set('harvester', Object.assign({}, exampleHarvester));

      sinon.stub(lookupService(this, 'router'), 'urlFor')
        .withArgs('public.harvesters', 'abc')
        .returns('internalPath');
    });

    it('does not have any field in "view" mode', function () {
      this.render(hbs `{{harvester-configuration/general
        mode="view"
        harvester=harvester
      }}`);

      return click('.edit-btn')
        .then(() => expect(this.$('.field-view-mode')).to.not.exist);
    });

    it('sets form values to data taken from harvester record', function () {
      this.render(hbs `{{harvester-configuration/general
        mode="view"
        harvester=harvester
      }}`);

      return click('.edit-btn')
        .then(() => {
          expect(this.$('.name-field input')).to.have.value('harvester1');
          expect(this.$('.plugin-field .field-component').text().trim())
            .to.equal('Elasticsearch plugin');
          expect(this.$('.endpoint-field input')).to.have.value('someendpoint');
          expect(this.$('.public-field .one-way-toggle')).to.have.class('checked');

          expect(this.$('.publicFields-collapse')).to.have.class('in');
          const correctUrl = `${location.origin}${location.pathname}internalPath`;
          expect(this.$('.publicFields-collapse .publicUrl-field input'))
            .to.have.value(correctUrl);
        });
    });

    it(
      'collapses "Public URL" field when "Public" toggle becomes unchecked',
      function () {
        this.render(hbs `{{harvester-configuration/general
          mode="view"
          harvester=harvester
        }}`);

        return click('.edit-btn')
          .then(() => click('.public-field .one-way-toggle'))
          .then(() => {
            expect(this.$('.public-field .one-way-toggle')).to.not.have.class('checked');
            expect(this.$('.publicFields-collapse')).to.not.have.class('in');
          });
      }
    );

    it(
      'does not show fields "Use default harvesting backend" and "Auto setup"',
      function () {
        this.render(hbs `{{harvester-configuration/general
          mode="view"
          harvester=harvester
        }}`);

        return click('.edit-btn')
          .then(() => {
            expect(this.$('.useDefaultHarvestingBackend-field')).to.not.exist;
            expect(this.$('.autoSetup-field')).to.not.exist;
          });
      }
    );

    it('shows "Cancel" and "Save" enabled buttons', function () {
      this.render(hbs `{{harvester-configuration/general
        mode="view"
        harvester=harvester
      }}`);

      return click('.edit-btn')
        .then(() => {
          const $cancel = this.$('button.cancel-btn');
          const $save = this.$('button.submit-btn');
          expect($cancel).to.exist;
          expect($cancel).to.not.have.attr('disabled');
          expect($cancel.text().trim()).to.equal('Cancel');
          expect($save).to.exist;
          expect($save).to.not.have.attr('disabled');
          expect($save.text().trim()).to.equal('Save');
          expect(this.$('button:not(.copy-btn)')).to.have.length(2);
        });
    });

    it('stops edition and resets changes on "Cancel" button click', function () {
      this.render(hbs `{{harvester-configuration/general
        mode="view"
        harvester=harvester
      }}`);

      return click('.edit-btn')
        .then(() => fillIn('.name-field input', 'newname'))
        .then(() => click('.cancel-btn'))
        .then(() => {
          expect(this.$('.field-edit-mode')).to.not.exist;
          expect(this.$('.name-field .field-component').text().trim())
            .to.equal('harvester1');
        });
    });

    it(
      'disables "Save" button and does not disable "Cancel" button when form is invalid',
      function () {
        this.render(hbs `{{harvester-configuration/general
          mode="view"
          harvester=harvester
        }}`);

        return click('.edit-btn')
          .then(() => fillIn('.name-field input', ''))
          .then(() => {
            expect(this.$('button.submit-btn')).to.have.attr('disabled');
            expect(this.$('button.cancel-btn')).to.not.have.attr('disabled');
          });
      }
    );

    it('does not save harvester if there are no changes', function () {
      const harvesterActions = lookupService(this, 'harvester-actions');
      const updateStub = sinon.stub(harvesterActions, 'updateHarvester').resolves();

      this.render(hbs `{{harvester-configuration/general
        mode="view"
        harvester=harvester
      }}`);

      return click('.edit-btn')
        .then(() => click('.submit-btn'))
        .then(() => {
          expect(updateStub).to.not.be.called;
          expect(this.$('.field-edit-mode')).to.not.exist;
        });
    });

    it('saves harvester changes', function () {
      const harvesterActions = lookupService(this, 'harvester-actions');
      const updateStub = sinon.stub(harvesterActions, 'updateHarvester').resolves();

      this.render(hbs `{{harvester-configuration/general
        mode="view"
        harvester=harvester
      }}`);

      return click('.edit-btn')
        .then(() => fillIn('.name-field input', 'newname'))
        .then(() => fillIn('.endpoint-field input', 'newendpoint'))
        .then(() => click('.public-field .one-way-toggle'))
        .then(() => click('.submit-btn'))
        .then(() => {
          expect(updateStub).to.be.called.and.to.be.calledWith(sinon.match({
            name: 'newname',
            endpoint: 'newendpoint',
            public: false,
          }));
          expect(this.$('.field-edit-mode')).to.not.exist;
          // check if in view mode new value is present
          expect(this.$().text()).to.include('newname');
        });
    });

    it(
      'disables buttons and fields after "Save" button click when saving promise is pending',
      function () {
        const harvesterActions = lookupService(this, 'harvester-actions');
        sinon.stub(harvesterActions, 'updateHarvester').returns(new Promise(() => {}));

        this.render(hbs `{{harvester-configuration/general
          mode="view"
          harvester=harvester
        }}`);

        return click('.edit-btn')
          .then(() => fillIn('.name-field input', 'abc'))
          .then(() => click('.submit-btn'))
          .then(() => {
            expect(this.$('input:not([disabled])')).to.have.length(1)
              .and.to.have.class('clipboard-input');
            expect(this.$('.cancel-btn')).to.have.attr('disabled');
            expect(this.$('.submit-btn')).to.have.attr('disabled');
            expect(this.$('.submit-btn [role="progressbar"]')).to.exist;
          });
      }
    );
  });
});

class PluginHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.plugin-field .ember-basic-dropdown');
  }
}
