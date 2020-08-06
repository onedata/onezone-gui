import Component from '@ember/component';
import { computed, get } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import TextareaField from 'onedata-gui-common/utils/form-component/textarea-field';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import { and, not, tag } from 'ember-awesome-macros';
import { reads } from '@ember/object/computed';
import { validator } from 'ember-cp-validations';

export default Component.extend(I18n, {
  classNames: ['content-harvesters-indices-index-form'],

  /**
   * @override
   */
  i18nPrefix: 'components.contentHarvestersIndices.indexForm',

  /**
   * One of: 'view', 'create'
   * @type {String}
   */
  mode: 'view',

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed(function fields() {
    const component = this;
    const {
      includeMetadataFormGroup,
      includeFileDetails,
    } = this.getProperties('includeMetadataFormGroup', 'includeFileDetails');

    return FormFieldsRootGroup
      .extend({
        i18nPrefix: tag `${'component.i18nPrefix'}.fields`,
        ownerSource: reads('component'),
      })
      .create({
        component,
        fields: [
          TextField.extend({
            // component,
            // defaultValue: or('component.tokenDataSource.name', raw(undefined)),
          }).create({ name: 'name' }),
          TextareaField.create({ name: 'schema' }),
          includeMetadataFormGroup,
          includeFileDetails,
          ToggleField.create({
            name: 'includeRejectionReason',
            defaultValue: true,
          }),
          ToggleField.create({
            name: 'retryOnRejection',
            defaultValue: true,
          }),
        ],
      });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  includeMetadataFormGroup: computed(function includeMetadataFormGroup() {
    return FormFieldsGroup.extend({
      allTogglesUnchecked: and(
        not('value.metadataBasic'),
        not('value.metadataJson'),
        not('value.metadataRdf')
      ),
    }).create({
      name: 'includeMetadata',
      classes: 'no-label-top-padding nowrap-on-desktop',
      fields: ['Basic', 'Json', 'Rdf'].map(metadataType =>
        ToggleField.create({
          name: `metadata${metadataType}`,
          addColonToLabel: false,
          classes: 'label-after',
          defaultValue: true,
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
  includeFileDetails: computed(function includeFileDetails() {
    return FormFieldsGroup.create({
      name: 'includeFileDetails',
      classes: 'no-label-top-padding nowrap-on-desktop',
      fields: ['fileName', 'originSpace', 'metadataExistenceFlags'].map(fieldName =>
        ToggleField.create({
          name: fieldName,
          addColonToLabel: false,
          classes: 'label-after',
          defaultValue: true,
        }),
      ),
    });
  }),

  init() {
    this._super(...arguments);

    this.setupFieldsMode();
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
});
