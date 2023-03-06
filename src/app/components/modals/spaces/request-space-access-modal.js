/**
 * Modal for sending request message to marketplace space contact.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import TextAreaField from 'onedata-gui-common/utils/form-component/textarea-field';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import { validator } from 'ember-cp-validations';

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

  messageField: computed(function messageField() {
    return TextAreaField.create({
      name: 'message',
      defaultValue: '',
      isOptional: true,
    });
  }),

  emailField: computed(function emailField() {
    return TextField.create({
      name: 'email',
      defaultValue: '',
      customValidators: [
        validator('format', {
          type: 'email',
          allowBlank: false,
        }),
      ],
    });
  }),

  isProceedAvailable: reads('rootField.isValid'),

  actions: {
    /**
     * @param {(data: SpaceAccessRequestMessageData) => void} modalSubmitCallback
     */
    async submit(modalSubmitCallback) {
      const {
        email: contactEmail,
        message,
      } = this.rootField.dumpValue();

      return modalSubmitCallback?.({
        contactEmail,
        message,
        spaceId: this.spaceId,
      });
    },
  },
});
