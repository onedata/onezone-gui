/**
 * Allows to create and view harvester index.
 *
 * @module components/content-harvesters-indices/index-form
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer, get, trySet } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import TextareaField from 'onedata-gui-common/utils/form-component/textarea-field';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import {
  conditional,
  and,
  not,
  tag,
  equal,
  raw,
  array,
} from 'ember-awesome-macros';
import { reads } from '@ember/object/computed';
import { validator } from 'ember-cp-validations';
import _ from 'lodash';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import { scheduleOnce } from '@ember/runloop';

export default Component.extend(I18n, {
  classNames: ['content-harvesters-indices-index-form'],

  /**
   * @override
   */
  i18nPrefix: 'components.contentHarvestersIndices.indexForm',

  /**
   * One of: 'view', 'create'
   * @virtual optional
   * @type {String}
   */
  mode: 'view',

  /**
   * Needed only when mode == 'view'
   * @virtual optional
   * @type {Models.Index}
   */
  index: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  onCancel: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   * @param {Object} indexPrototype
   */
  onCreate: notImplementedReject,

  /**
   * @type {boolean}
   */
  isCreating: false,

  /**
   * @type {ComputedProperty<boolean>}
   */
  inViewMode: equal('mode', raw('view')),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed(function fields() {
    const component = this;
    const {
      nameField,
      schemaField,
      includeMetadataGroup,
      includeFileDetailsGroup,
      includeRejectionReasonField,
      retryOnRejectionField,
    } = this.getProperties(
      'nameField',
      'schemaField',
      'includeMetadataGroup',
      'includeFileDetailsGroup',
      'includeRejectionReasonField',
      'retryOnRejectionField'
    );

    return FormFieldsRootGroup
      .extend({
        i18nPrefix: tag `${'component.i18nPrefix'}.fields`,
        ownerSource: reads('component'),
      })
      .create({
        component,
        fields: [
          nameField,
          schemaField,
          includeMetadataGroup,
          includeFileDetailsGroup,
          includeRejectionReasonField,
          retryOnRejectionField,
        ],
      });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.TextField>}
   */
  nameField: computed(function nameField() {
    const component = this;
    return TextField.extend({
      isVisible: not('component.inViewMode'),
    }).create({
      component,
      name: 'name',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.TextareaField>}
   */
  schemaField: computed(function schemaField() {
    const component = this;
    return TextareaField.extend({
      defaultValue: conditional(
        'component.inViewMode',
        'component.index.schema',
        raw('')
      ),
    }).create({
      component,
      name: 'schema',
      isOptional: true,
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  includeMetadataGroup: computed(function includeMetadataGroup() {
    const component = this;
    return FormFieldsGroup.extend({
      allTogglesUnchecked: and(
        not('value.metadataXattrs'),
        not('value.metadataJson'),
        not('value.metadataRdf')
      ),
      errors: computed('allTogglesUnchecked', function errors() {
        if (this.get('allTogglesUnchecked')) {
          return [{
            message: this.t(`${this.get('path')}.nothingEnabledError`),
          }];
        }
      }),
    }).create({
      name: 'includeMetadata',
      classes: 'no-label-top-padding',
      areValidationClassesEnabled: true,
      fields: ['xattrs', 'json', 'rdf'].map(metadataType =>
        ToggleField.extend({
          defaultValue: conditional(
            'component.inViewMode',
            array.includes('component.index.includeMetadata', raw(metadataType)),
            raw(true)
          ),
        }).create({
          component,
          name: `metadata${_.upperFirst(metadataType)}`,
          addColonToLabel: false,
          classes: 'label-after',
          customValidators: [
            validator(function (value, options, model) {
              return !get(model, 'field.parent.allTogglesUnchecked');
            }, {
              dependentKeys: ['model.field.parent.allTogglesUnchecked'],
            }),
          ],
        }),
      ),
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  includeFileDetailsGroup: computed(function includeFileDetailsGroup() {
    const component = this;
    return FormFieldsGroup.create({
      name: 'includeFileDetails',
      classes: 'no-label-top-padding',
      fields: [
        'fileName',
        'fileType',
        'spaceId',
        'datasetInfo',
        'archiveInfo',
        'metadataExistenceFlags',
      ].map(fieldName =>
        ToggleField.extend({
          defaultValue: conditional(
            'component.inViewMode',
            array.includes('component.index.includeFileDetails', raw(fieldName)),
            raw(true)
          ),
        }).create({
          component,
          name: fieldName,
          addColonToLabel: false,
          classes: 'label-after',
        }),
      ),
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.ToggleField>}
   */
  includeRejectionReasonField: computed(function includeRejectionReasonField() {
    const component = this;
    return ToggleField.extend({
      defaultValue: conditional(
        'component.inViewMode',
        'component.index.includeRejectionReason',
        raw(true)
      ),
    }).create({
      component,
      name: 'includeRejectionReason',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.ToggleField>}
   */
  retryOnRejectionField: computed(function retryOnRejectionField() {
    const component = this;
    return ToggleField.extend({
      defaultValue: conditional(
        'component.inViewMode',
        'component.index.retryOnRejection',
        raw(true)
      ),
    }).create({
      component,
      name: 'retryOnRejection',
    });
  }),

  indexObserver: observer('index.isLoaded', function indexObserver() {
    const isIndexLoaded = this.get('index.isLoaded') || false;
    if (this.get('mode') !== 'create' && isIndexLoaded) {
      // scheduleOnce because (maybe due to some Ember bug) sometimes record does not have
      // data populated yet even if isLoaded == true
      scheduleOnce('afterRender', this, () => this.get('fields').reset());
    }
  }),

  init() {
    this._super(...arguments);

    this.setupFieldsMode();
    this.indexObserver();
  },

  setupFieldsMode() {
    const {
      mode,
      fields,
    } = this.getProperties('mode', 'fields');

    if (mode !== 'create') {
      fields.changeMode('view');
    }
  },

  actions: {
    create() {
      this.set('isCreating', true);

      const {
        onCreate,
        fields,
      } = this.getProperties('onCreate', 'fields');
      const formValues = fields.dumpValue();

      const indexPrototype = {};
      [
        'name',
        'schema',
        'includeRejectionReason',
        'retryOnRejection',
      ].forEach(fieldName => indexPrototype[fieldName] = formValues[fieldName]);
      if (!indexPrototype.schema) {
        delete indexPrototype.schema;
      }

      indexPrototype.includeMetadata = Object.keys(formValues.includeMetadata)
        .filter(key => formValues.includeMetadata[key])
        .map(key => key.slice('metadata'.length).toLowerCase());
      indexPrototype.includeFileDetails = Object.keys(formValues.includeFileDetails)
        .filter(key => formValues.includeFileDetails[key]);

      return onCreate(indexPrototype)
        .finally(() => trySet(this, 'isCreating', false));
    },
  },
});
