/**
 * Harvester configuration section responsible for general harvester options.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import {
  get,
  observer,
  computed,
  getProperties,
  setProperties,
} from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import ClipboardField from 'onedata-gui-common/utils/form-component/clipboard-field';
import {
  tag,
  equal,
  notEqual,
  raw,
  or,
  not,
  and,
  conditional,
} from 'ember-awesome-macros';
import { resolve } from 'rsvp';
import _ from 'lodash';
import { scheduleOnce } from '@ember/runloop';

export default Component.extend(I18n, {
  classNames: ['harvester-configuration-general'],

  i18n: service(),
  harvesterManager: service(),
  harvesterActions: service(),
  onedataConnection: service(),
  router: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.harvesterConfiguration.general',

  /**
   * @type {Model.Harvester}
   */
  harvester: undefined,

  /**
   * One of: `view`, `edit`, `create`
   * @type {string}
   */
  mode: 'view',

  /**
   * @type {boolean}
   */
  disabled: false,

  /**
   * @type {Location}
   */
  _location: location,

  /**
   * @type {ComputedProperty<String>}
   */
  defaultHarvestingBackendType: reads('onedataConnection.defaultHarvestingBackendType'),

  /**
   * @type {ComputedProperty<String>}
   */
  defaultHarvestingBackendEndpoint: reads('onedataConnection.defaultHarvestingBackendEndpoint'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  hasDefaultHarvestingBackendSetup: and(
    'defaultHarvestingBackendType',
    'defaultHarvestingBackendEndpoint'
  ),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed(function fields() {
    const component = this;
    const {
      nameField,
      typeField,
      useDefaultHarvestingBackendField,
      endpointField,
      autoSetupField,
      publicField,
      publicUrlField,
    } = this.getProperties(
      'nameField',
      'typeField',
      'useDefaultHarvestingBackendField',
      'endpointField',
      'autoSetupField',
      'publicField',
      'publicUrlField'
    );

    return FormFieldsRootGroup.extend({
      i18nPrefix: tag `${'component.i18nPrefix'}.fields`,
      ownerSource: reads('component'),
      isEnabled: not('component.disabled'),
      onValueChange(value, field) {
        this._super(...arguments);

        if (this.get('component.mode') === 'create' &&
          get(field, 'name') === 'useDefaultHarvestingBackend' && value
        ) {
          scheduleOnce(
            'afterRender',
            this,
            () => this.getFieldByPath('harvestingBackendFields').reset()
          );
        }
      },
    }).create({
      component,
      fields: [
        nameField,
        useDefaultHarvestingBackendField,
        FormFieldsGroup.extend({
          isEnabled: or(
            notEqual('component.mode', raw('create')),
            not('component.hasDefaultHarvestingBackendSetup'),
            not('parent.value.useDefaultHarvestingBackend')
          ),
        }).create({
          component,
          name: 'harvestingBackendFields',
          fields: [
            typeField,
            endpointField,
          ],
        }),
        autoSetupField,
        publicField,
        FormFieldsGroup.extend({
          isExpanded: reads('parent.value.public'),
          isVisible: notEqual('component.mode', raw('create')),
        }).create({
          component,
          name: 'publicFields',
          fields: [
            publicUrlField,
          ],
        }),
      ],
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.TextField>}
   */
  nameField: computed(function nameField() {
    const component = this;
    return TextField.extend({
      defaultValue: conditional(
        equal('component.mode', raw('create')),
        raw(''),
        'component.harvester.name',
      ),
    }).create({
      component,
      name: 'name',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.ToggleField>}
   */
  useDefaultHarvestingBackendField: computed(function useDefaultHarvestingBackendField() {
    const component = this;
    return ToggleField.extend({
      isVisible: and(
        equal('component.mode', raw('create')),
        'component.hasDefaultHarvestingBackendSetup'
      ),
    }).create({
      component,
      name: 'useDefaultHarvestingBackend',
      defaultValue: true,
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.DropdownField>}
   */
  typeField: computed(function typeField() {
    const component = this;
    return DropdownField.extend({
      options: computed(
        'component.backendTypesListProxy.isFulfilled',
        function options() {
          const backendTypesListProxy = this.get('component.backendTypesListProxy');
          if (get(backendTypesListProxy, 'isFulfilled')) {
            return backendTypesListProxy
              .map(({ id, name }) => ({ value: id, label: name }));
          } else {
            return [];
          }
        }
      ),
      defaultValue: conditional(
        equal('component.mode', raw('create')),
        conditional(
          'component.hasDefaultHarvestingBackendSetup',
          'component.defaultHarvestingBackendType',
          'options.firstObject.value'
        ),
        'component.harvester.harvestingBackendType'
      ),
    }).create({
      component,
      name: 'type',
      showSearch: false,
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.TextField>}
   */
  endpointField: computed(function endpointField() {
    const component = this;
    return TextField.extend({
      defaultValue: conditional(
        equal('component.mode', raw('create')),
        conditional(
          'component.hasDefaultHarvestingBackendSetup',
          'component.defaultHarvestingBackendEndpoint',
          raw('')
        ),
        'component.harvester.harvestingBackendEndpoint',
      ),
    }).create({
      component,
      name: 'endpoint',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.ToggleField>}
   */
  autoSetupField: computed(function autoSetupField() {
    const component = this;
    return ToggleField.extend({
      isVisible: equal('component.mode', raw('create')),
    }).create({
      component,
      name: 'autoSetup',
      defaultValue: true,
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.ToggleField>}
   */
  publicField: computed(function publicField() {
    const component = this;
    return ToggleField.extend({
      isVisible: notEqual('component.mode', raw('create')),
      defaultValue: conditional(
        equal('component.mode', raw('create')),
        raw(false),
        'component.harvester.public',
      ),
    }).create({
      component,
      name: 'public',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.ClipboardField>}
   */
  publicUrlField: computed(function publicUrlField() {
    const component = this;
    return ClipboardField.extend({
      text: reads('component.publicUrlValue'),
    }).create({
      component,
      name: 'publicUrl',
    });
  }),

  /**
   * Available harvesting backend types list
   * @returns {Ember.ComputedProperty<PromiseArray<string>>}
   */
  backendTypesListProxy: reads('harvesterManager.backendTypesListProxy'),

  /**
   * @type {Ember.ComputedProperty<string|null>}
   */
  publicUrlValue: computed('harvester.entityId', function publicUrlValue() {
    const harvesterEntityId = this.get('harvester.entityId');
    if (harvesterEntityId) {
      const {
        router,
        _location,
      } = this.getProperties('router', '_location');

      const {
        origin,
        pathname,
      } = getProperties(_location, 'origin', 'pathname');

      return origin + pathname +
        router.urlFor('public.harvesters', harvesterEntityId);
    } else {
      return null;
    }
  }),

  harvesterObserver: observer('harvester', function harvesterObserver() {
    if (this.get('harvester')) {
      this.set('mode', 'view');
    }
  }),

  modeObserver: observer('mode', function modeObserver() {
    const {
      mode,
      fields,
    } = this.getProperties('mode', 'fields');

    fields.changeMode(mode === 'view' ? 'view' : 'edit');
    fields.reset();
  }),

  init() {
    this._super(...arguments);

    this.get('backendTypesListProxy').then(() => safeExec(this, () => {
      this.modeObserver();
    }));
  },

  didInsertElement() {
    this._super(...arguments);

    const {
      mode,
      backendTypesListProxy,
      element,
    } = this.getProperties('mode', 'backendTypesListProxy', 'element');
    if (mode === 'create') {
      backendTypesListProxy.then(() => {
        scheduleOnce(
          'afterRender',
          this,
          () => {
            const input = element.querySelector('.name-field input');
            if (input) {
              input.focus();
            }
          }
        );
      });
    }
  },

  actions: {
    edit() {
      this.set('mode', 'edit');
    },
    cancel() {
      this.set('mode', 'view');
    },
    submit() {
      const {
        fields,
        mode,
        harvester,
        harvesterActions,
      } = this.getProperties(
        'fields',
        'mode',
        'harvester',
        'harvesterActions'
      );
      const fieldsValues = fields.dumpValue();
      const normalizedFieldsValues = {
        name: fieldsValues.name,
        harvestingBackendType: fieldsValues.harvestingBackendFields.type,
        harvestingBackendEndpoint: fieldsValues.harvestingBackendFields.endpoint,
      };
      if (mode === 'edit') {
        normalizedFieldsValues.public = fieldsValues.public;
      }
      const preconfigureGui = mode === 'create' && fieldsValues.autoSetup;

      this.set('disabled', true);
      let promise;
      switch (mode) {
        case 'edit': {
          const oldValues =
            getProperties(harvester, ...Object.keys(normalizedFieldsValues));
          if (_.isEqual(oldValues, normalizedFieldsValues)) {
            promise = resolve()
              .then(() => safeExec(this, () => this.set('mode', 'view')));
          } else {
            setProperties(harvester, normalizedFieldsValues);
            promise = harvesterActions.updateHarvester(harvester)
              .then(() => safeExec(this, () => this.set('mode', 'view')))
              .catch(() => setProperties(harvester, oldValues));
          }
          break;
        }
        case 'create':
          promise =
            harvesterActions.createHarvester(normalizedFieldsValues, preconfigureGui);
      }
      return promise.finally(() =>
        safeExec(this, () => this.set('disabled', false))
      );
    },
  },
});
