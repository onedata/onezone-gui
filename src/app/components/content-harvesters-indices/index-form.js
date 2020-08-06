import Component from '@ember/component';
import { computed, get } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import TextareaField from 'onedata-gui-common/utils/form-component/textarea-field';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import { conditional, and, not, tag, equal, raw, array } from 'ember-awesome-macros';
import { reads } from '@ember/object/computed';
import { validator } from 'ember-cp-validations';
import _ from 'lodash';

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
   * @type {ComputedProperty<boolean>}
   */
  inViewMode: equal('mode', raw('view')),

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
            isVisible: not('component.inViewMode'),
          }).create({
            component,
            name: 'name',
          }),
          TextareaField.extend({
            defaultValue: conditional(
              'component.inViewMode',
              'component.index.schema',
              raw('')
            ),
          }).create({
            component,
            name: 'schema',
          }),
          includeMetadataFormGroup,
          includeFileDetails,
          ToggleField.extend({
            defaultValue: conditional(
              'component.inViewMode',
              'component.index.includeRejectionReason',
              raw(true)
            ),
          }).create({
            component,
            name: 'includeRejectionReason',
          }),
          ToggleField.extend({
            defaultValue: conditional(
              'component.inViewMode',
              'component.index.retryOnRejection',
              raw(true)
            ),
          }).create({
            component,
            name: 'retryOnRejection',
          }),
        ],
      });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  includeMetadataFormGroup: computed(function includeMetadataFormGroup() {
    const component = this;
    return FormFieldsGroup.extend({
      allTogglesUnchecked: and(
        not('value.metadataBasic'),
        not('value.metadataJson'),
        not('value.metadataRdf')
      ),
    }).create({
      name: 'includeMetadata',
      classes: 'no-label-top-padding nowrap-on-desktop',
      fields: ['basic', 'json', 'rdf'].map(metadataType =>
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
  includeFileDetails: computed(function includeFileDetails() {
    const component = this;
    return FormFieldsGroup.create({
      name: 'includeFileDetails',
      classes: 'no-label-top-padding nowrap-on-desktop',
      fields: ['fileName', 'originSpace', 'metadataExistenceFlags'].map(fieldName =>
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
