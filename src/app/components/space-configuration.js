// FIXME: jsdoc

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
import emailValidator from 'onedata-gui-common/utils/validators/email';

/**
 * @typedef {'view'|'edit'} SpaceConfigDescriptionEditorMode
 */

const validations = buildValidations({
  currentContactEmail: [
    emailValidator(),
  ],
});

export default Component.extend(validations, I18n, {
  classNames: ['space-configuration', 'fill-flex-using-column', 'fill-flex-limited'],

  modalManager: service(),
  onedataConnection: service(),

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

  currentContactEmail: '',

  /**
   * Previous value of current description before it was set using
   * `setCurrentValuesFromRecord`.
   * It is null when
   * @type {string|null}
   */
  preCurrentDescription: null,

  blankInlineEditors: undefined,

  //#endregion

  /**
   * @type {ComputedProperty<Array<Tag>>}
   */
  spaceTags: computed('space.tags', function spaceTags() {
    return get(this.space ?? {}, 'tags')?.map(tag => ({ label: tag }));
  }),

  spaceName: reads('space.name'),

  spaceDescription: reads('space.description'),

  organizationName: reads('space.organizationName'),

  isAdvertised: reads('space.advertisedInMarketplace'),

  contactEmail: reads('space.contactEmail'),

  isCurrentDescriptionEmpty: computed(
    'currentDescription',
    function isCurrentDescriptionEmpty() {
      return !this.currentDescription || /^\s*$/.test(this.currentDescription);
    }
  ),

  isDescriptionModified: notEqual('currentDescription', 'preCurrentDescription'),

  isAdvertisedToggleDisabled: bool('advertisedToggleLockHint'),

  areAdvertiseRequirementsMet: or(
    isEmpty('organizationName'),
    isEmpty('spaceTags'),
    isEmpty('spaceDescription'),
  ),

  advertisedToggleLockHint: conditional(
    and(not('isAdvertised'), 'areAdvertiseRequirementsMet'),
    computedT('advertised.lockHint.requiredFieldsEmpty'),
    raw('')
  ),

  blankInlineErrors: conditional(
    'isAdvertised',
    'blankInlineEditors',
    raw(Object.freeze({}))
  ),

  emailValidation: reads('validations.attrs.currentContactEmail'),

  allowedTags: computed(
    'onedataConnection.availableSpaceTags',
    function allowedTags() {
      return (this.onedataConnection.availableSpaceTags ?? []).map(tag => ({
        label: tag,
      }));
    }
  ),

  spaceTagsEditorSettings: computed('allowedTags', function spaceTagsEditorSettings() {
    return {
      type: 'tags',
      tagEditorComponentName: 'tags-input/selector-editor',
      tagEditorSettings: {
        allowedTags: this.allowedTags,
      }
    };
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

  setCurrentValuesFromRecord() {
    const description = this.spaceDescription;
    this.setProperties({
      preCurrentDescription: description,
      currentDescription: description,
      currentContactEmail: this.space.contactEmail,
    });
  },

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
        // FIXME: stop for confirmation modal
        // FIXME: this could be RPC in final implementation
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
        await this.saveSpaceValue('contactEmail', value);
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
      this.modalManager.show('space-configuration/enable-marketplace-advertisement', {
        space: this.space,
        onSubmit: (isConfirmed) => {
          resolve(isConfirmed);
        },
      });
    });
  },

  async confirmAdvertisementDisable() {
    return new Promise(resolve => {
      this.modalManager.show('space-configuration/disable-marketplace-advertisement', {
        space: this.space,
        onSubmit: (isConfirmed) => {
          resolve(isConfirmed);
        },
      });
    });
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
