import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, focus, blur, fillIn, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../../helpers/stub-service';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { resolve, Promise } from 'rsvp';
import { set, setProperties } from '@ember/object';
import EmberPowerSelectHelper from '../../../helpers/ember-power-select-helper';
import OneTooltipHelper from '../../../helpers/one-tooltip';
import sinon from 'sinon';

const exampleHarvester = {
  entityId: 'abc',
  name: 'harvester1',
  harvestingBackendType: 'elasticsearch_harvesting_backend',
  harvestingBackendEndpoint: 'someendpoint',
  public: true,
};

describe('Integration | Component | harvester configuration/general', function () {
  setupRenderingTest();

  beforeEach(function () {
    const plugins = [{
      id: 'postgre',
      name: 'Postgre',
    }, {
      id: 'elasticsearch_harvesting_backend',
      name: 'Elasticsearch',
    }];
    set(
      lookupService(this, 'harvester-manager'),
      'backendTypesListProxy',
      promiseArray(resolve(plugins))
    );
    setProperties(lookupService(this, 'onedata-connection'), {
      defaultHarvestingBackendType: 'elasticsearch_harvesting_backend',
      defaultHarvestingBackendEndpoint: 'default.endpoint',
    });
  });

  it('has class "harvester-configuration-general"', async function () {
    await render(hbs `{{harvester-configuration/general}}`);

    expect(this.$('.harvester-configuration-general')).to.have.length(1);
  });

  context('in create mode', function () {
    it('shows empty text field with "Name" label and no placeholder', async function () {
      await render(hbs `{{harvester-configuration/general mode="create"}}`);

      const $formGroup = this.$('.name-field');
      const $input = $formGroup.find('input');
      expect($formGroup).to.exist;
      expect($formGroup.find('.control-label').text().trim()).to.equal('Name:');
      expect($input).to.exist.and.to.have.attr('type', 'text');
      expect($input).to.have.value('');
      expect($input).to.not.have.attr('placeholder');
    });

    it(
      'shows preselected toggle field with "Use default backend" label and tip',
      async function () {
        await render(hbs `{{harvester-configuration/general mode="create"}}`);

        const tooltip = new OneTooltipHelper(
          '.useDefaultHarvestingBackend-field .one-label-tip .oneicon'
        );
        const $formGroup = this.$('.useDefaultHarvestingBackend-field');
        expect($formGroup).to.exist;
        expect($formGroup.find('.control-label').text().trim())
          .to.equal('Use default backend:');
        expect($formGroup.find('.one-way-toggle')).to.have.class('checked');

        return tooltip.getText()
          .then(tipText => expect(tipText).to.equal(
            'If enabled, the default harvesting backend configured for this Onezone (e.g Elasticsearch) will be used. If disabled, you will have to provide a type and location (endpoint) of your harvesting service.'
          ));
      }
    );

    it(
      'shows preselected toggle field with "auto setup" label and tip',
      async function () {
        await render(hbs `{{harvester-configuration/general mode="create"}}`);

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
            'If enabled, default configuration will be applied and default indices will be created in the harvester backend (e.g. Elasticsearch). The harvester will work out-of-the-box with the default GUI.If disabled, you will have to manually setup the harvester GUI, its configuration and required indices.'
          ));
      }
    );

    it(
      'shows dropdown field with "Backend type" label, tip, preselected option and types list',
      async function () {
        // reset default backend type to unlock the field and not set default value
        set(
          lookupService(this, 'onedata-connection'),
          'defaultHarvestingBackendType',
          ''
        );

        await render(hbs `{{harvester-configuration/general mode="create"}}`);

        const typeDropdown = new TypeHelper();
        const tooltip =
          new OneTooltipHelper('.type-field .one-label-tip .oneicon');
        return typeDropdown.open()
          .then(() => {
            const $formGroup = this.$('.type-field');
            const $trigger = typeDropdown.getTrigger();
            expect($formGroup).to.exist;
            expect($formGroup.find('.control-label').text().trim())
              .to.equal('Backend type:');
            expect($trigger.textContent.trim()).to.equal('Postgre');
            expect(typeDropdown.getNthOption(1).textContent.trim())
              .to.equal('Postgre');
            expect(typeDropdown.getNthOption(2).textContent.trim())
              .to.equal('Elasticsearch');
            expect(typeDropdown.getNthOption(3)).to.not.exist;

            return tooltip.getText();
          })
          .then(tipText => expect(tipText).to.equal(
            'Type of external harvesting backend that will provide persistence and analytics for harvested metadata. Can be chosen from predefined backends and optionally custom ones configured by Onezone admins.'
          ));
      }
    );

    it(
      'shows empty text field with "Backend endpoint" label, tip and no placeholder',
      async function () {
        // reset default backend endpoint to unlock the field and not set default value
        set(
          lookupService(this, 'onedata-connection'),
          'defaultHarvestingBackendEndpoint',
          ''
        );

        await render(hbs `{{harvester-configuration/general mode="create"}}`);

        const tooltip = new OneTooltipHelper(
          '.endpoint-field .one-label-tip .oneicon'
        );
        const $formGroup = this.$('.endpoint-field');
        const $input = $formGroup.find('input');
        expect($formGroup).to.exist;
        expect($formGroup.find('.control-label').text().trim())
          .to.equal('Backend endpoint:');
        expect($input).to.have.value('');
        expect($input).to.not.have.attr('placeholder');
        return tooltip.getText().then(tipText => expect(tipText).to.equal(
          'Endpoint where the specified harvesting backend can be reached by Onezone to feed incoming metadata and perform queries.'
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
      it(`does not show ${name} field`, async function () {
        await render(hbs `{{harvester-configuration/general mode="create"}}`);

        expect(this.$(selector)).to.not.exist;
      });
    });

    it(
      'shows enabled "Use default backend" toggle and disabled backend-related fields with default values',
      async function () {
        await render(hbs `{{harvester-configuration/general mode="create"}}`);

        const $defaultBackendToggle =
          this.$('.useDefaultHarvestingBackend-field .one-way-toggle');
        expect($defaultBackendToggle).to.exist.and.to.have.class('checked');
        expectBackendTypeState(this, false, 'Elasticsearch');
        expectBackendEndpointState(this, false, 'default.endpoint');
      }
    );

    it(
      'enables backend-related fields with default values when toggle "Use default backend" becomes unchecked',
      async function () {
        await render(hbs `{{harvester-configuration/general mode="create"}}`);

        return click('.useDefaultHarvestingBackend-field .one-way-toggle')
          .then(() => {
            expectBackendTypeState(this, true, 'Elasticsearch');
            expectBackendEndpointState(this, true, 'default.endpoint');
          });
      }
    );

    it(
      'resets backend-related fields to default values when toggle "Use default backend" becomes unchecked, fields are modified and then toggle again becomes checked',
      async function () {
        await render(hbs `{{harvester-configuration/general mode="create"}}`);

        return click('.useDefaultHarvestingBackend-field .one-way-toggle')
          .then(() => {
            const typeDropdown = new TypeHelper();
            return typeDropdown.selectOption(1);
          })
          .then(() => fillIn('.endpoint-field input', 'someendpoint'))
          .then(() => click('.useDefaultHarvestingBackend-field .one-way-toggle'))
          .then(() => {
            expectBackendTypeState(this, false, 'Elasticsearch');
            expectBackendEndpointState(this, false, 'default.endpoint');
          });
      }
    );

    it(
      'does not show "Use default backend" toggle and has enabled and empty backend-related fields when there is no default backend type',
      async function () {
        set(
          lookupService(this, 'onedata-connection'),
          'defaultHarvestingBackendType',
          ''
        );

        await render(hbs `{{harvester-configuration/general mode="create"}}`);

        expect(this.$('.useDefaultHarvestingBackend-field')).to.not.exist;
        expectBackendTypeState(this, true, 'Postgre');
        expectBackendEndpointState(this, true, '');
      }
    );

    it(
      'does not show "Use default backend" toggle and has enabled and empty backend-related fields when there is no default backend endpoint',
      async function () {
        set(
          lookupService(this, 'onedata-connection'),
          'defaultHarvestingBackendEndpoint',
          ''
        );

        await render(hbs `{{harvester-configuration/general mode="create"}}`);

        expect(this.$('.useDefaultHarvestingBackend-field')).to.not.exist;
        expectBackendTypeState(this, true, 'Postgre');
        expectBackendEndpointState(this, true, '');
      }
    );

    it('shows validation error when name field is empty', async function () {
      await render(hbs `{{harvester-configuration/general mode="create"}}`);

      return focus('.name-field input')
        .then(() => blur('.name-field input'))
        .then(() => expect(this.$('.name-field')).to.have.class('has-error'));
    });

    it('shows validation error when endpoint field is empty', async function () {
      await render(hbs `{{harvester-configuration/general mode="create"}}`);

      return click('.useDefaultHarvestingBackend-field .one-way-toggle')
        .then(() => fillIn('.endpoint-field input', ''))
        .then(() => expect(this.$('.endpoint-field')).to.have.class('has-error'));
    });

    it(
      'has disabled "Create" button on init and no "Cancel" button',
      async function () {
        await render(hbs `{{harvester-configuration/general mode="create"}}`);

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
      async function () {
        await render(hbs `{{harvester-configuration/general mode="create"}}`);

        return fillIn('.name-field input', 'abc')
          .then(() => expect(this.$('.submit-btn')).to.not.have.attr('disabled'));
      }
    );

    it(
      'has disabled "Create" button when form is filled in but endpoint is empty',
      async function () {
        await render(hbs `{{harvester-configuration/general mode="create"}}`);

        return fillIn('.name-field input', 'abc')
          .then(() => click('.useDefaultHarvestingBackend-field .one-way-toggle'))
          .then(() => fillIn('.endpoint-field input', ''))
          .then(() => expect(this.$('.submit-btn')).to.have.attr('disabled'));
      }
    );

    it(
      'has enabled "Create" button when form if filled in and endpoint is provided',
      async function () {
        await render(hbs `{{harvester-configuration/general mode="create"}}`);

        return fillIn('.name-field input', 'abc')
          .then(() => click('.useDefaultHarvestingBackend-field .one-way-toggle'))
          .then(() => fillIn('.endpoint-field input', 'def'))
          .then(() => expect(this.$('.submit-btn')).to.not.have.attr('disabled'));
      }
    );

    it('tries to create harvester on "Create" click using default endpoint', async function () {
      const harvesterActions = lookupService(this, 'harvester-actions');
      const createStub = sinon.stub(harvesterActions, 'createHarvester').resolves();

      await render(hbs `{{harvester-configuration/general mode="create"}}`);

      return fillIn('.name-field input', 'abc')
        .then(() => click('.submit-btn'))
        .then(() => {
          expect(createStub).to.be.calledOnce.and.to.be.calledWith(sinon.match({
            name: 'abc',
            harvestingBackendType: 'elasticsearch_harvesting_backend',
            harvestingBackendEndpoint: 'default.endpoint',
          }), true);
        });
    });

    it(
      'tries to create harvester on "Create" click using custom backend type, endpoint and no auto setup',
      async function () {
        const harvesterActions = lookupService(this, 'harvester-actions');
        const createStub = sinon.stub(harvesterActions, 'createHarvester').resolves();

        await render(hbs `{{harvester-configuration/general mode="create"}}`);

        return fillIn('.name-field input', 'abc')
          .then(() => click('.useDefaultHarvestingBackend-field .one-way-toggle'))
          .then(() => {
            const typeDropdown = new TypeHelper();
            return typeDropdown.selectOption(1);
          })
          .then(() => fillIn('.endpoint-field input', 'def'))
          .then(() => click('.autoSetup-field .one-way-toggle'))
          .then(() => click('.submit-btn'))
          .then(() => {
            expect(createStub).to.be.calledOnce.and.to.be.calledWith(sinon.match({
              name: 'abc',
              harvestingBackendType: 'postgre',
              harvestingBackendEndpoint: 'def',
            }), false);
          });
      }
    );

    it(
      'disables buttons and fields after "Create" button click when creating promise is pending',
      async function () {
        const harvesterActions = lookupService(this, 'harvester-actions');
        sinon.stub(harvesterActions, 'createHarvester').returns(new Promise(() => {}));

        await render(hbs `{{harvester-configuration/general mode="create"}}`);

        return fillIn('.name-field input', 'abc')
          .then(() => click('.submit-btn'))
          .then(() => {
            expect(this.$('input:not([disabled])')).to.not.exist;
            expect(this.$('.submit-btn')).to.have.attr('disabled');
            expect(this.$('.submit-btn [role="progressbar"]')).to.exist;
          });
      }
    );

    it('does not have any field in "view" mode', async function () {
      await render(hbs `{{harvester-configuration/general mode="create"}}`);

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

    it('does not have any field in "edit" mode', async function () {
      await render(hbs `{{harvester-configuration/general
        mode="view"
        harvester=harvester
      }}`);

      expect(this.$('.field-edit-mode')).to.not.exist;
    });

    it('shows harvester data and public URL field', async function () {
      await render(hbs `{{harvester-configuration/general
        mode="view"
        harvester=harvester
      }}`);

      expect(this.$('.name-field .field-component').text().trim()).to.equal('harvester1');
      expect(this.$('.type-field .field-component').text().trim())
        .to.equal('Elasticsearch');
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

    it('does not show "Public URL" field when harvester is not public', async function () {
      this.get('harvester').public = false;

      await render(hbs `{{harvester-configuration/general
        mode="view"
        harvester=harvester
      }}`);

      expect(this.$('.public-field .one-way-toggle')).to.not.have.class('checked');
      expect(this.$('.publicFields-collapse')).to.not.have.class('in');
    });

    it(
      'does not show fields "Use default harvesting backend" and "Auto setup"',
      async function () {
        await render(hbs `{{harvester-configuration/general
          mode="view"
          harvester=harvester
        }}`);

        expect(this.$('.useDefaultHarvestingBackend-field')).to.not.exist;
        expect(this.$('.autoSetup-field')).to.not.exist;
      }
    );

    it('shows enabled "Edit" button and no "Cancel" button', async function () {
      await render(hbs `{{harvester-configuration/general
        mode="view"
        harvester=harvester
      }}`);

      const $editBtn = this.$('.edit-btn');
      expect($editBtn).to.exist.and.to.not.have.attr('disabled');
      expect($editBtn.text().trim()).to.equal('Edit');
      expect(this.$('button:not(.copy-btn)')).to.have.length(1);
    });

    it('changes mode to "edit" on "Edit" button click', async function () {
      await render(hbs `{{harvester-configuration/general
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

    it('does not have any field in "view" mode', async function () {
      await render(hbs `{{harvester-configuration/general
        mode="view"
        harvester=harvester
      }}`);

      return click('.edit-btn')
        .then(() => expect(this.$('.field-view-mode')).to.not.exist);
    });

    it('sets form values to data taken from harvester record', async function () {
      await render(hbs `{{harvester-configuration/general
        mode="view"
        harvester=harvester
      }}`);

      return click('.edit-btn')
        .then(() => {
          expect(this.$('.name-field input')).to.have.value('harvester1');
          expect(this.$('.type-field .field-component').text().trim())
            .to.equal('Elasticsearch');
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
      async function () {
        await render(hbs `{{harvester-configuration/general
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
      async function () {
        await render(hbs `{{harvester-configuration/general
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

    it('shows "Cancel" and "Save" enabled buttons', async function () {
      await render(hbs `{{harvester-configuration/general
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

    it('stops edition and resets changes on "Cancel" button click', async function () {
      await render(hbs `{{harvester-configuration/general
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
      async function () {
        await render(hbs `{{harvester-configuration/general
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

    it('does not save harvester if there are no changes', async function () {
      const harvesterActions = lookupService(this, 'harvester-actions');
      const updateStub = sinon.stub(harvesterActions, 'updateHarvester').resolves();

      await render(hbs `{{harvester-configuration/general
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

    it('saves harvester changes', async function () {
      const harvesterActions = lookupService(this, 'harvester-actions');
      const updateStub = sinon.stub(harvesterActions, 'updateHarvester').resolves();

      await render(hbs `{{harvester-configuration/general
        mode="view"
        harvester=harvester
      }}`);

      return click('.edit-btn')
        .then(() => fillIn('.name-field input', 'newname'))
        .then(() => {
          const typeDropdown = new TypeHelper();
          return typeDropdown.selectOption(1);
        })
        .then(() => fillIn('.endpoint-field input', 'newendpoint'))
        .then(() => click('.public-field .one-way-toggle'))
        .then(() => click('.submit-btn'))
        .then(() => {
          expect(updateStub).to.be.called.and.to.be.calledWith(sinon.match({
            name: 'newname',
            harvestingBackendType: 'postgre',
            harvestingBackendEndpoint: 'newendpoint',
            public: false,
          }));
          expect(this.$('.field-edit-mode')).to.not.exist;
          // check if in view mode new value is present
          expect(this.$().text()).to.include('newname');
        });
    });

    it(
      'disables buttons and fields after "Save" button click when saving promise is pending',
      async function () {
        const harvesterActions = lookupService(this, 'harvester-actions');
        sinon.stub(harvesterActions, 'updateHarvester').returns(new Promise(() => {}));

        await render(hbs `{{harvester-configuration/general
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

class TypeHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.type-field', '.ember-basic-dropdown-content');
  }
}

function expectBackendTypeState(testCase, isEnabled, value) {
  const $typeTrigger = testCase.$('.type-field .dropdown-field-trigger');

  if (isEnabled) {
    expect($typeTrigger).to.not.have.attr('aria-disabled');
  } else {
    expect($typeTrigger).to.have.attr('aria-disabled');
  }
  expect($typeTrigger.text().trim()).to.equal(value);
}

function expectBackendEndpointState(testCase, isEnabled, value) {
  const $endpointInput = testCase.$('.endpoint-field input');

  if (isEnabled) {
    expect($endpointInput).to.not.have.attr('disabled');
  } else {
    expect($endpointInput).to.have.attr('disabled');
  }
  expect($endpointInput).to.have.value(value);
}
