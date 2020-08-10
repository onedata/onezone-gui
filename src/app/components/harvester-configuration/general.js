/**
 * Harvester configuration section responsible for general harvester options.
 *
 * @module components/harvester-configuration/general
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
import { tag, equal, notEqual, raw, or, not, and, conditional } from 'ember-awesome-macros';
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
  defaultHarvesterEndpoint: reads('onedataConnection.defaultHarvesterEndpoint'),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed(function fields() {
    const component = this;
    const {
      nameField,
      pluginField,
      useDefaultHarvestingBackendField,
      endpointField,
      autoSetupField,
      publicField,
      publicUrlField,
    } = this.getProperties(
      'nameField',
      'pluginField',
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
    }).create({
      component,
      fields: [
        nameField,
        pluginField,
        useDefaultHarvestingBackendField,
        FormFieldsGroup.extend({
          isExpanded: or(
            notEqual('component.mode', raw('create')),
            not('component.defaultHarvesterEndpoint'),
            not('parent.value.useDefaultHarvestingBackend')
          ),
        }).create({
          component,
          name: 'endpointGroup',
          fields: [
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
   * @type {ComputedProperty<Utils.FormComponent.DropdownField>}
   */
  pluginField: computed(function pluginField() {
    const component = this;
    return DropdownField.extend({
      options: computed('component.pluginsListProxy.isFulfilled', function options() {
        const pluginsListProxy = this.get('component.pluginsListProxy');
        if (get(pluginsListProxy, 'isFulfilled')) {
          return pluginsListProxy.map(({ id, name }) => ({ value: id, label: name }));
        } else {
          return [];
        }
      }),
      defaultValue: conditional(
        equal('component.mode', raw('create')),
        'options.firstObject.value',
        'component.harvester.plugin'
      ),
    }).create({
      component,
      name: 'plugin',
      showSearch: false,
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
        'component.defaultHarvesterEndpoint'
      ),
    }).create({
      component,
      name: 'useDefaultHarvestingBackend',
      defaultValue: true,
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
        raw(''),
        'component.harvester.endpoint',
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
   * Available harvester plugins list
   * @returns {Ember.ComputedProperty<PromiseArray<string>>}
   */
  pluginsListProxy: reads('harvesterManager.pluginsListProxy'),

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

    this.get('pluginsListProxy').then(() => safeExec(this, () => {
      this.resetFormIfCreateMode();
      this.modeObserver();
    }));
  },

  resetFormIfCreateMode() {
    const {
      mode,
      fields,
    } = this.getProperties('mode', 'fields');

    if (mode === 'create') {
      fields.reset();
    }
  },

  didInsertElement() {
    this._super(...arguments);

    const {
      mode,
      pluginsListProxy,
    } = this.getProperties('mode', 'pluginsListProxy');
    if (mode === 'create') {
      pluginsListProxy.then(() => {
        scheduleOnce(
          'afterRender',
          this,
          () => this.$('.name-field input').focus()
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
        defaultHarvesterEndpoint,
      } = this.getProperties(
        'fields',
        'mode',
        'harvester',
        'harvesterActions',
        'defaultHarvesterEndpoint'
      );
      const fieldsValues = fields.dumpValue();
      const normalizedFieldsValues = {
        name: fieldsValues.name,
        plugin: fieldsValues.plugin,
      };
      if (mode === 'create') {
        const endpoint =
          fieldsValues.useDefaultHarvestingBackend && defaultHarvesterEndpoint ?
          defaultHarvesterEndpoint : fieldsValues.endpointGroup.endpoint;
        normalizedFieldsValues.endpoint = endpoint;
      } else {
        normalizedFieldsValues.public = fieldsValues.public;
        normalizedFieldsValues.endpoint = fieldsValues.endpointGroup.endpoint;
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
