/**
 * Modal for sending request message to marketplace space contact.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';
import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import TextAreaField from 'onedata-gui-common/utils/form-component/textarea-field';
import CustomValueDropdownField from 'onedata-gui-common/utils/form-component/custom-value-dropdown-field';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import { validator } from 'ember-cp-validations';
import { and, not, collect } from 'ember-awesome-macros';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import _ from 'lodash';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  tagName: '',

  currentUser: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.spaces.requestSpaceAccessModal',

  /**
   * @virtual
   * @type {RequestSpaceAccessActionContext}
   */
  modalOptions: undefined,

  //#region configuration

  emailFieldName: 'email',

  /**
   * @type {Array<Validator>}
   */
  emailFieldValidators: undefined,

  //#region

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

  /**
   * @type {ComputedProperty<Array<string>>}
   */
  predefinedEmails: reads('currentUser.user.emails'),

  rootField: computed(function rootField() {
    return FormFieldsRootGroup
      .extend({
        isEnabled: not('requestSpaceAccessModal.isDisabled'),
        messageField: reads('requestSpaceAccessModal.messageField'),
        emailField: reads('requestSpaceAccessModal.emailField'),
        fields: collect(
          'messageField',
          'emailField'
        ),
      })
      .create({
        requestSpaceAccessModal: this,
        ownerSource: this,
        i18nPrefix: this.i18nPrefix,
      });
  }),

  messageField: computed(function messageField() {
    return TextAreaField.create({
      name: 'message',
      defaultValue: '',
      isOptional: true,
      customValidators: [
        validator('length', {
          // a limit in backend
          max: 2000,
        }),
      ],
    });
  }),

  emailField: computed('predefinedEmails', function emailField() {
    if (_.isEmpty(this.predefinedEmails)) {
      return this.emailInputField;
    } else {
      return this.emailDropdownField;
    }
  }),

  emailInputField: computed(function emailInputField() {
    return TextField.create({
      name: this.emailFieldName,
      defaultValue: '',
      customValidators: this.emailFieldValidators,
    });
  }),

  predefinedEmailsOptions: computed(
    'predefinedEmails',
    function predefinedEmailsOptions() {
      return this.predefinedEmails?.map(email => ({
        value: email,
        label: email,
      })) ?? [];
    }
  ),

  emailDropdownField: computed(function emailInputField() {
    return CustomValueDropdownField
      .extend({
        options: reads('requestSpaceAccessModal.predefinedEmailsOptions'),
      })
      .create({
        requestSpaceAccessModal: this,
        name: this.emailFieldName,
        customValidators: this.emailFieldValidators,
      });
  }),

  isProceedAvailable: and('rootField.isValid', 'isEmailShareConfirmed'),

  init() {
    this._super(...arguments);
    this.set('emailFieldValidators', Object.freeze([
      validator('format', {
        type: 'email',
        allowBlank: false,
      }),
    ]));
  },

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
        safeExec(this, 'set', 'isDisabled', false);
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
