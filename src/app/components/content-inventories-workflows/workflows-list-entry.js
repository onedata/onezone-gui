import Component from '@ember/component';
import { computed, observer, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import TextareaField from 'onedata-gui-common/utils/form-component/textarea-field';
import { tag } from 'ember-awesome-macros';

export default Component.extend({
  classNames: ['workflows-list-entry'],

  /**
   * @virtual
   * @type {Models.AtmWorkflowSchema}
   */
  workflow: undefined,

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed(function fields() {
    return FormFieldsRootGroup
      .extend({
        i18nPrefix: tag `${'component.i18nPrefix'}.fields`,
      })
      .create({
        component: this,
        ownerSource: this,
        fields: [
          TextField.extend({
            defaultValue: reads('component.workflow.name'),
          }).create({
            component: this,
            name: 'name',
          }),
          TextareaField.extend({
            defaultValue: reads('component.workflow.description'),
          }).create({
            component: this,
            name: 'description',
            viewModeAsStaticText: true,
          }),
        ],
      });
  }),

  fieldsUpdateTrigger: observer(
    'workflow.{name,description}',
    function fieldsUpdateTrigger() {
      const fields = this.get('fields');

      if (get(fields, 'isInViewMode')) {
        fields.reset();
      }
    }
  ),

  init() {
    this._super(...arguments);

    this.get('fields').changeMode('view');
    this.fieldsUpdateTrigger();
  },
});
