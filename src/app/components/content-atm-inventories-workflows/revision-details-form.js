/**
 * Allows editing details of workflow schema revision.
 * NOTE: it does not persist any data. To do that, you need to do this on your own
 * using data passed via `onChange` callback.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import TextareaField from 'onedata-gui-common/utils/form-component/textarea-field';
import { reads } from '@ember/object/computed';
import { computed, observer, get } from '@ember/object';
import { tag, getBy } from 'ember-awesome-macros';
import { scheduleOnce } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(I18n, {
  tagName: 'form',
  classNames: [
    'revision-details-form',
    'form',
    'form-horizontal',
    'form-component',
  ],

  /**
   * @override
   */
  i18nPrefix: 'components.contentAtmInventoriesWorkflows.revisionDetailsForm',

  /**
   * @virtual
   * @type {Models.AtmWorkflowSchema}
   */
  atmWorkflowSchema: undefined,

  /**
   * @virtual
   * @type {Number}
   */
  revisionNumber: undefined,

  /**
   * @virtual
   * @type {Function}
   * @param {Object} change
   *   ```
   *   {
   *     data: Object, // form data
   *     isValid: Boolean,
   *   }
   *   ```
   */
  onChange: undefined,

  /**
   * Used as a values source for default form values.
   * ```
   * {
   *   state: String,
   *   description: String
   * }
   * ```
   * @type {Object}
   */
  formValuesSource: undefined,

  /**
   * @type {ComputedProperty<AtmWorkflowSchemaRevision>}
   */
  revision: getBy('atmWorkflowSchema.revisionRegistry', 'revisionNumber'),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed(function fields() {
    return FormFieldsRootGroup
      .extend({
        i18nPrefix: tag `${'component.i18nPrefix'}.fields`,
        onValueChange() {
          this._super(...arguments);
          scheduleOnce('afterRender', this.get('component'), 'notifyAboutChange');
        },
      })
      .create({
        component: this,
        ownerSource: this,
        fields: [
          DropdownField.extend({
            defaultValue: reads('component.formValuesSource.state'),
          }).create({
            component: this,
            name: 'state',
            options: [{ value: 'draft' }, { value: 'stable' }, { value: 'deprecated' }],
          }),
          TextareaField.extend({
            defaultValue: reads('component.formValuesSource.description'),
          }).create({
            component: this,
            name: 'description',
            isOptional: true,
          }),
        ],
      });
  }),

  formValuesUpdater: observer(
    'atmWorkflowSchema',
    'revisionNumber',
    function formValuesUpdater() {
      this.updateFormValues();
    }
  ),

  /**
   * @override
   */
  submit(event) {
    this._super(...arguments);
    event.preventDefault();
  },

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.formValuesUpdater();
  },

  /**
   * @override
   */
  willDestroyElement() {
    try {
      this.cacheFor('fields')?.destroy();
    } finally {
      this._super(...arguments);
    }
  },

  updateFormValues() {
    const { state = 'draft', description = '' } = this.get('revision') || {};

    this.set('formValuesSource', {
      state,
      description,
    });
    this.get('fields').reset();
  },

  notifyAboutChange() {
    const {
      onChange,
      fields,
    } = this.getProperties('onChange', 'fields');

    if (!onChange) {
      return;
    }

    safeExec(this, () => {
      onChange({
        data: fields.dumpValue(),
        isValid: get(fields, 'isValid'),
      });
    });
  },
});
