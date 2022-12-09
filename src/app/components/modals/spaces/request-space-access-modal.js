import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import TextAreaField from 'onedata-gui-common/utils/form-component/textarea-field';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import { emailRegex } from 'onedata-gui-common/utils/validators/email';

export default Component.extend(I18n, {
  tagName: '',

  /**
   * @override
   */
  i18nPrefix: 'components.modals.spaces.requestSpaceAccessModal',

  /**
   * @virtual
   * @type {RequestSpaceAccessActionContext}
   */
  modalOptions: undefined,

  spaceMarketplaceData: reads('modalOptions.spaceMarketplaceData'),

  spaceName: reads('spaceMarketplaceData.name'),

  spaceId: reads('spaceMarketplaceData.spaceId'),

  rootField: computed(
    'messageField',
    'emailField',
    function rootField() {
      return FormFieldsRootGroup.create({
        ownerSource: this,
        i18nPrefix: this.i18nPrefix,
        fields: [
          this.messageField,
          this.emailField,
        ],
      });
    }
  ),

  messageField: computed(function contactEmailField() {
    return TextAreaField.create({
      ownerSource: this,
      name: 'message',
      defaultValue: '',
      isOptional: false,
    });
  }),

  emailField: computed(function contactEmailField() {
    return TextField.create({
      ownerSource: this,
      name: 'email',
      defaultValue: '',
      regex: emailRegex,
      isOptional: false,
    });
  }),

  // FIXME: implement basing on form validation
  isProceedAvailable: true,

  actions: {
    /**
     * @param {(data) => void} modalSubmitCallback
     */
    async submit(modalSubmitCallback) {
      const {
        email,
        message,
      } = this.rootField.dumpValue();

      return modalSubmitCallback?.({
        email,
        message,
        spaceId: this.spaceId,
      });
    },
  },
});
