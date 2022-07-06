/**
 * Allows to create new, edit and show details of existing workflow schemas.
 * NOTE: it does not persist any data. To do that, you need to do this on your own
 * using data passed via `onChange` callback.
 *
 * @module components/content-atm-inventories-workflows/atm-workflow-schema-details-form
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import {
  observer,
  computed,
  getProperties,
  get,
} from '@ember/object';
import { reads } from '@ember/object/computed';
import { tag, or, not } from 'ember-awesome-macros';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import TextareaField from 'onedata-gui-common/utils/form-component/textarea-field';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { scheduleOnce } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(I18n, {
  tagName: 'form',
  classNames: [
    'atm-workflow-schema-details-form',
    'form',
    'form-horizontal',
    'form-component',
  ],

  /**
   * @override
   */
  i18nPrefix: 'components.contentAtmInventoriesWorkflows.atmWorkflowSchemaDetailsForm',

  /**
   * One of: `'view'`, `'edit'`
   * @virtual
   * @type {String}
   */
  mode: 'view',

  /**
   * @virtual optional
   * @type {Models.AtmWorkflowSchema}
   */
  atmWorkflowSchema: undefined,

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
  onChange: notImplementedIgnore,

  /**
   * @virtual optional
   * @type {Boolean}
   */
  isDisabled: false,

  /**
   * Used as a values source for default values in edit mode, and normal values for
   * view mode.
   * ```
   * {
   *   name: String,
   *   summary: String
   * }
   * ```
   * @type {Object}
   */
  formValuesSource: undefined,

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed(function fields() {
    return FormFieldsRootGroup
      .extend({
        i18nPrefix: tag `${'component.i18nPrefix'}.fields`,
        isEnabled: not('component.isDisabled'),
        onValueChange() {
          this._super(...arguments);
          scheduleOnce('afterRender', this.get('component'), 'notifyAboutChange');
        },
      })
      .create({
        component: this,
        ownerSource: this,
        fields: [
          TextField.extend({
            defaultValue: reads('component.formValuesSource.name'),
          }).create({
            component: this,
            name: 'name',
          }),
          TextareaField.extend({
            defaultValue: reads('component.formValuesSource.summary'),
            isVisible: or('isInEditMode', 'value'),
          }).create({
            component: this,
            name: 'summary',
            showsStaticTextInViewMode: true,
            isOptional: true,
          }),
        ],
      });
  }),

  formValuesUpdater: observer(
    'mode',
    'atmWorkflowSchema.{name,summary}',
    function formValuesUpdater() {
      if (this.get('mode') === 'view' || this.get('formValuesSource') === undefined) {
        this.updateFormValues();
      }
    }
  ),

  modeObserver: observer('mode', function modeObserver() {
    const {
      fields,
      mode,
    } = this.getProperties('fields', 'mode');

    fields.changeMode(mode);
  }),

  /**
   * @override
   */
  submit(event) {
    this._super(...arguments);
    event.preventDefault();
  },

  init() {
    this._super(...arguments);
    this.formValuesUpdater();
    this.modeObserver();
  },

  updateFormValues() {
    const atmWorkflowSchema = this.get('atmWorkflowSchema') || {};
    const { name = '', summary = '' } =
    getProperties(atmWorkflowSchema, 'name', 'summary');

    this.set('formValuesSource', {
      name,
      summary,
    });
    this.get('fields').reset();
  },

  notifyAboutChange() {
    const {
      onChange,
      fields,
      mode,
    } = this.getProperties('onChange', 'fields', 'mode');

    if (mode === 'view') {
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
