import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { computed, get } from '@ember/object';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import RadioField from 'onedata-gui-common/utils/form-component/radio-field';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { scheduleOnce } from '@ember/runloop';

export default Component.extend(I18n, {
  classNames: ['token-editor'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.tokenEditor',

  /**
   * @type {Function}
   * @param {EmberObject} formValues
   * @param {boolean} isValid
   */
  onChange: notImplementedIgnore,

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed(function fields() {
    const i18nPrefix = this.get('i18nPrefix');
    const component = this;
    return FormFieldsRootGroup
      .extend({
        onValueChange() {
          this._super(...arguments);
          scheduleOnce('afterRender', component, 'notifyAboutChange');
        },
      })
      .create({
        ownerSource: this,
        i18nPrefix: `${i18nPrefix}.fields`,
        fields: [
          FormFieldsGroup.create({
            name: 'basic',
            fields: [
              TextField.create({
                name: 'name',
              }),
              RadioField.create({
                name: 'type',
                options: [{
                  name: 'access',
                  value: 'access',
                }, {
                  name: 'invite',
                  value: 'invite',
                }],
                defaultValue: 'access',
              }),
            ],
          }),
        ],
      });
  }),

  notifyAboutChange() {
    const {
      fields,
      onChange,
    } = this.getProperties('fields', 'onChange');

    onChange({
      values: fields.dumpValue(),
      isValid: get(fields, 'isValid'),
      invalidFields: get(fields, 'invalidFields').mapBy('path'),
    });
  },

  // willDestroyElement() {
  //   this._super(...arguments);
  //   debugger;
  // }
});
