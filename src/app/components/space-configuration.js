/**
 * A "form" with inline-editors for changing space properties, especiall used when
 * publishing space in marketplace.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { get, set, computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { notEqual, not, isEmpty, and, or, bool, conditional, raw } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import computedT from 'onedata-gui-common/utils/computed-t';
import { Promise } from 'rsvp';
import { buildValidations } from 'ember-cp-validations';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';
import insufficientPrivilegesMessage from 'onedata-gui-common/utils/i18n/insufficient-privileges-message';
import { validator } from 'ember-cp-validations';

/**
 * @typedef {'view'|'edit'} SpaceConfigDescriptionEditorMode
 */

const validations = buildValidations({
  currentContactEmail: validator('format', {
    type: 'email',
    allowBlank: false,
  }),
});

export default Component.extend(validations, I18n, {
  classNames: ['space-configuration', 'fill-flex-using-column', 'fill-flex-limited'],

  modalManager: service(),
  spaceManager: service(),
  router: service(),
  globalNotify: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.spaceConfiguration',

  /**
   * @virtual
   * @type {Model.Space}
   */
  space: undefined,

  //#region state

  /**
   * @type {SpaceConfigDescriptionEditorMode}
   */
  descriptionEditorMode: 'view',

  /**
   * Current value of description presented in view (in rendered form) or editor (raw
   * markdown source).
   * @type {string}
   */
  currentDescription: '',

  /**
   * Current value of description in email inline editor (not necessarily saved).
   * @type {string}
   */
  currentContactEmail: '',

  /**
   * Previous value of current description before it was set using
   * `setCurrentValuesFromRecord`.
   * It is null when
   * @type {string|null}
   */
  preCurrentDescription: null,

  /**
   * Stores mapping: form field id -> is currently edited value blank?
   * Initialized on init.
   * @type {Object<string, boolean>}
   */
  blankInlineEditors: undefined,

  //#endregion

  isReadOnly: not('space.privileges.update'),

  readOnlyTip: conditional(
    'isReadOnly',
    computed(function readOnlyTip() {
      return insufficientPrivilegesMessage({
        i18n: this.i18n,
        modelName: 'space',
        privilegeFlag: 'space_update',
      });
    }),
    raw('')
  ),

  /**
   * Space tags ready to use in component.
   * @type {ComputedProperty<Array<Tag>>}
   */
  spaceTags: computed('space.tags', function spaceTags() {
    return get(this.space ?? {}, 'tags')?.map(tag => ({ label: tag }));
  }),

  areSpaceTagsEmpty: isEmpty('spaceTags'),

  spaceName: reads('space.name'),

  spaceDescription: reads('space.description'),

  organizationName: reads('space.organizationName'),

  isAdvertised: reads('space.advertisedInMarketplace'),

  contactEmail: reads('space.marketplaceContactEmail'),

  isCurrentDescriptionEmpty: computed(
    'currentDescription',
    function isCurrentDescriptionEmpty() {
      return !this.currentDescription || /^\s*$/.test(this.currentDescription);
    }
  ),

  isDescriptionModified: notEqual('currentDescription', 'preCurrentDescription'),

  isAdvertisedToggleDisabled: bool('advertisedToggleLockHint'),

  areAdvertiseRequirementsNotMet: or(
    isEmpty('organizationName'),
    isEmpty('spaceTags'),
    isEmpty('spaceDescription'),
  ),

  advertisedToggleLockHint: conditional(
    and(not('isAdvertised'), 'areAdvertiseRequirementsNotMet'),
    computedT('advertised.lockHint.requiredFieldsEmpty'),
    raw('')
  ),

  /**
   * Like `blankInlineEditors` stores information if some inline edited field is blank,
   * but only if space is advertised, so blank editors should cause showing validation
   * error. Used in showing validation messsaged.
   * @type {Object<string, boolean>}
   */
  blankInlineErrors: conditional(
    'isAdvertised',
    'blankInlineEditors',
    raw(Object.freeze({}))
  ),

  /**
   * @type {EmberCpValidations.Validation.ResultCollection}
   */
  emailValidation: reads('validations.attrs.currentContactEmail'),

  allowedTags: computed(
    function allowedTags() {
      return (this.spaceManager.getAvailableSpaceTags() ?? []).map(tag => ({
        label: tag,
      }));
    }
  ),

  spaceTagsEditorSettings: computed('allowedTags', function spaceTagsEditorSettings() {
    return {
      type: 'tags',
      tagEditorComponentName: 'space-configuration/space-tags-selector',
    };
  }),

  viewInMarketplaceHref: computed('space.entityId', function viewInMarketplaceHref() {
    return this.router.urlFor(
      'onedata.sidebar.content',
      'spaces',
      'join', {
        queryParams: {
          options: serializeAspectOptions({
            selectedSpace: this.space.entityId,
          }),
        },
      }
    );
  }),

  spaceObserver: observer('space', function spaceObserver() {
    this.setCurrentValuesFromRecord();
  }),

  init() {
    this._super(...arguments);
    this.spaceObserver();
    this.set('blankInlineEditors', {});
  },

  /**
   * Generic function to change and save single property of space model.
   * @param {string} propertyName
   * @param {any} value
   * @returns {Promise<void>}
   */
  async saveSpaceValue(propertyName, value) {
    if (get(this.space, propertyName) === value) {
      return;
    }
    set(this.space, propertyName, value);
    await this.space.save();
  },

  /**
   * Resets current inline edited values cache to values from record.
   * @returns {void}
   */
  setCurrentValuesFromRecord() {
    const description = this.spaceDescription;
    this.setProperties({
      preCurrentDescription: description,
      currentDescription: description,
      currentContactEmail: this.contactEmail,
    });
  },

  /**
   * Save inline edited value.
   * @param {string} fieldId ID of field used in this component - see switch cases.
   * @param {any} value Value from component - it will be serialized to model.
   * @returns
   */
  async saveValue(fieldId, value) {
    switch (fieldId) {
      case 'name':
      case 'organizationName':
        await this.saveSpaceValue(fieldId, value);
        break;
      case 'tags': {
        const tagsRawValue = value?.map(({ label }) => label) || [];
        await this.saveSpaceValue('tags', tagsRawValue);
        break;
      }
      case 'advertised': {
        if (value) {
          await this.confirmAdvertisementEnable();
        } else {
          await this.confirmAdvertisementDisable();
        }
        break;
      }
      case 'description': {
        if (this.blankInlineErrors.description) {
          return;
        }
        await this.saveSpaceValue('description', value);
        this.setCurrentValuesFromRecord();
        break;
      }
      case 'contactEmail': {
        await this.saveSpaceValue('marketplaceContactEmail', value);
        this.setCurrentValuesFromRecord();
        break;
      }
      default:
        break;
    }
  },
  discardValue(fieldId) {
    switch (fieldId) {
      case 'description':
        this.setCurrentValuesFromRecord();
        break;
    }
  },

  async confirmAdvertisementEnable() {
    return new Promise(resolve => {
      this.modalManager.show('spaces/enable-marketplace-advertisement-modal', {
        space: this.space,
        onSubmit: (isConfirmed) => {
          resolve(isConfirmed);
        },
      });
    });
  },

  async disableMarketplaceAdvertisement() {
    set(this.space, 'advertisedInMarketplace', false);
    try {
      await this.space.save();
    } catch (error) {
      this.space.rollbackAttributes();
      await this.space.reload();
      throw error;
    }
  },

  async confirmAdvertisementDisable() {
    const modalT = (key) => this.t(`confirmAdvertisementDisable.${key}`);
    const modalInstance = this.modalManager.show('question-modal', {
      headerIcon: 'sign-warning-rounded',
      headerText: modalT('header'),
      descriptionParagraphs: [{
        text: modalT('body.text'),
      }],
      yesButtonText: modalT('proceed'),
      noButtonText: modalT('cancel'),
      yesButtonType: 'warning',
      hideAfterSubmit: false,
      onSubmit: async () => {
        try {
          await this.disableMarketplaceAdvertisement();
          this.modalManager.hide(modalInstance.id);
        } catch (error) {
          this.globalNotify.backendError(modalT('disablingAdvertisement'), error);
        }
      },
    });
    await modalInstance.hiddenPromise;
  },

  inlineEditorChange(fieldId, value) {
    const normalizedValue = typeof value === 'string' ? value.trim() : value;
    if (_.isEmpty(normalizedValue)) {
      this.set('blankInlineEditors', {
        ...this.blankInlineEditors,
        [fieldId]: true,
      });
    } else if (this.blankInlineEditors[fieldId]) {
      this.set('blankInlineEditors', {
        ...this.blankInlineEditors,
        [fieldId]: false,
      });
    }
  },

  actions: {
    async saveValue(fieldId, value) {
      return this.saveValue(fieldId, value);
    },
    discardValue(fieldId) {
      return this.discardValue(fieldId);
    },
    currentDescriptionChanged(value) {
      this.set('currentDescription', value);
      this.inlineEditorChange('description', value);
    },
    currentEmailChanged(value) {
      this.set('currentContactEmail', value);
      this.inlineEditorChange('contactEmail', value);
    },
    inlineEditorChange(fieldId, value) {
      this.inlineEditorChange(fieldId, value);
    },
  },
});
