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
import { and, not } from 'ember-awesome-macros';

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

  //#region state

  isEmailShareConfirmed: false,

  isDisabled: false,

  //#endregion

  spaceMarketplaceData: reads('modalOptions.spaceMarketplaceData'),

  spaceName: reads('spaceMarketplaceData.name'),

  spaceId: reads('spaceMarketplaceData.spaceId'),

  modalClassNames: computed('isDisabled', function modalClassNames() {
    const classes = ['request-space-access-modal'];
    if (this.isDisabled) {
      classes.push('disabled');
    }
    return classes;
  }),

  rootField: computed(
    function rootField() {
      return FormFieldsRootGroup.extend({
          isEnabled: not('requestSpaceAccessModal.isDisabled'),
        })
        .create({
          requestSpaceAccessModal: this,
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
      customValidators: [
        validator('length', {
          max: 2000,
        }),
      ],
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

  isProceedAvailable: and('rootField.isValid', 'isEmailShareConfirmed'),

  actions: {
    /**
     * @param {(data: SpaceAccessRequestMessageData) => void} modalSubmitCallback
     */
    async submit(modalSubmitCallback) {
      if (!this.isProceedAvailable || this.isDisabled) {
        return;
      }

      this.set('isDisabled', true);
      try {
        const {
          email: contactEmail,
          message,
        } = this.rootField.dumpValue();
        return await modalSubmitCallback?.({
          contactEmail,
          message,
          spaceId: this.spaceId,
        });
      } finally {
        this.set('isDisabled', false);
      }
    },
    toggleEmailShareConfirmation(state = !this.isEmailShareConfirmed) {
      if (this.isDisabled) {
        return;
      }
      this.set('isEmailShareConfirmed', state);
    },
  },
});
