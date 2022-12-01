// FIXME: jsdoc

import Component from '@ember/component';
import { get, set, computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { notEqual, not, isEmpty, and, or, bool, conditional, raw } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import computedT from 'onedata-gui-common/utils/computed-t';
import { Promise } from 'rsvp';
import { validator, buildValidations } from 'ember-cp-validations';
import { inject as service } from '@ember/service';

/**
 * @typedef {'view'|'edit'} SpaceConfigDescriptionEditorMode
 */

/**
 * Taken from: http: //emailregex.com/
 * @type {RegExp}
 */
const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// FIXME: duplicated code with enable marketplace advertisement modal
const validations = buildValidations({
  contactEmail: [
    validator('format', {
      regex: emailRegex,
      allowBlank: false,
      message() {
        return String(this.model.t('mustBeValidEmail'));
      },
    }),
  ],
});

export default Component.extend(validations, I18n, {
  classNames: ['space-configuration', 'fill-flex-using-column', 'fill-flex-limited'],

  modalManager: service(),

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
   * Previous value of current description before it was set using
   * `setDescriptionValueFromRecord`.
   * It is null when
   * @type {string|null}
   */
  preCurrentDescription: null,

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

  spaceObserver: observer('space', function spaceObserver() {
    this.setDescriptionValueFromRecord();
  }),

  init() {
    this._super(...arguments);
    this.spaceObserver();
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

  setDescriptionValueFromRecord() {
    const description = this.spaceDescription;
    this.setProperties({
      preCurrentDescription: description,
      currentDescription: description,
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
        await this.saveSpaceValue('description', value);
        this.setDescriptionValueFromRecord();
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
        this.setDescriptionValueFromRecord();
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

  actions: {
    async saveValue(fieldId, value) {
      return this.saveValue(fieldId, value);
    },
    discardValue(fieldId) {
      return this.discardValue(fieldId);
    },
    currentDescriptionChanged(value) {
      this.set('currentDescription', value);
    },
  },
});
