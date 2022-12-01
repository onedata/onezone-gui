// FIXME: jsdoc

import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { or, not } from 'ember-awesome-macros';
import { validator, buildValidations } from 'ember-cp-validations';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';

/**
 * Taken from: http: //emailregex.com/
 * @type {RegExp}
 */
const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const validations = buildValidations({
  contactEmail: [
    validator('format', {
      regex: emailRegex,
      allowBlank: false,
      message() {
        return String(this.t('mustBeValidEmail'));
      },
    }),
  ],
});

export default Component.extend(validations, I18n, {
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.spaceConfiguration.enableMarketplaceAdvertisementModal',

  /**
   * @virtual
   * @type {{ space: Models.Space }}
   */
  modalOptions: undefined,

  /**
   * @virtual
   * @type {String}
   */
  modalId: undefined,

  //#region state

  /**
   * @type {boolean}
   */
  isSubmitting: false,

  /**
   * @type {string}
   */
  contactEmail: '',

  //#endregion

  space: reads('modalOptions.space'),

  rootField: computed(function rootField() {
    return FormFieldsRootGroup.create({
      ownerSource: this,
      i18nPrefix: this.i18nPrefix,
      fields: [
        this.contactEmailField,
      ],
    });
  }),

  contactEmailField: computed(function contactEmailField() {
    return TextField.create({
      ownerSource: this,
      name: 'contactEmail',
      defaultValue: this.space.contactEmail || '',
      regex: emailRegex,
      isOptional: false,
    });
  }),

  areButtonsDisabled: or('isSubmitting', not('contactEmailField.isValid')),

  async enableMarketplaceAdvertisement() {
    this.space.setProperties({
      advertisedInMarketplace: true,
      contactEmail: this.contactEmailField.value,
    });
    await this.space.save();
  },

  actions: {
    async submit(submitCallback, result) {
      if (this.areButtonsDisabled) {
        return;
      }
      this.set('isSubmitting', true);
      try {
        await this.enableMarketplaceAdvertisement();
        await submitCallback(result);
      } catch {
        // FIXME: implement
      } finally {
        safeExec(this, () => this.set('isSubmitting', false));
      }
    },
  },
});
