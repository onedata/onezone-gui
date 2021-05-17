import Component from '@ember/component';
import { observer, computed, getProperties, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { tag, or, not } from 'ember-awesome-macros';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import TextareaField from 'onedata-gui-common/utils/form-component/textarea-field';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { scheduleOnce } from '@ember/runloop';

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
   *   description: String
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
            defaultValue: reads('component.formValuesSource.description'),
            isVisible: or('isInEditMode', 'value'),
          }).create({
            component: this,
            name: 'description',
            viewModeAsStaticText: true,
            isOptional: true,
          }),
        ],
      });
  }),

  formValuesUpdater: observer(
    'mode',
    'atmWorkflowSchema.{name,description}',
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

  init() {
    this._super(...arguments);
    this.formValuesUpdater();
    this.modeObserver();
  },

  updateFormValues() {
    const atmWorkflowSchema = this.get('atmWorkflowSchema') || {};
    const {
      name = '',
        description = '',
    } = getProperties(atmWorkflowSchema, 'name', 'description');

    this.set('formValuesSource', {
      name,
      description,
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

    onChange({
      data: fields.dumpValue(),
      isValid: get(fields, 'isValid'),
    });
  },
});
