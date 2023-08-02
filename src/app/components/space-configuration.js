/**
 * A "form" with inline-editors for changing space properties, especiall used when
 * publishing space in Space Marketplace.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { get, set, computed, observer } from '@ember/object';
import { reads, notEmpty } from '@ember/object/computed';
import {
  notEqual,
  not,
  isEmpty,
  and,
  or,
  bool,
  conditional,
  raw,
} from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import computedT from 'onedata-gui-common/utils/computed-t';
import { Promise, all as allFulfilled } from 'rsvp';
import { buildValidations } from 'ember-cp-validations';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';
import insufficientPrivilegesMessage from 'onedata-gui-common/utils/i18n/insufficient-privileges-message';
import { validator } from 'ember-cp-validations';
import { SpaceTag } from './space-configuration/space-tags-selector';
import CustomValueDropdownField from 'onedata-gui-common/utils/form-component/custom-value-dropdown-field';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import globals from 'onedata-gui-common/utils/globals';
import preventPageUnload from 'onedata-gui-common/utils/prevent-page-unload';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

/**
 * @typedef {'view'|'edit'} SpaceConfigDescriptionEditorMode
 */

const contactEmailValidator = validator('format', {
  type: 'email',
  allowBlank: false,
});

const validations = buildValidations({
  currentContactEmail: contactEmailValidator,
});

// FIXME: użyć więcej razy?

/**
 * @typedef {'name'|'organizationName'|'tags'|'contactEmail'} SpaceConfiguration.InlineEditorFieldId
 */

/**
 * @typedef {SpaceConfiguration.InlineEditorFieldId|'advertised'|'description'} SpaceConfiguration.FieldId
 */

export default Component.extend(validations, I18n, {
  classNames: ['space-configuration', 'fill-flex-using-column', 'fill-flex-limited'],

  modalManager: service(),
  router: service(),
  globalNotify: service(),
  spaceManager: service(),
  currentUser: service(),
  navigationState: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.spaceConfiguration',

  /**
   * @virtual
   * @type {Model.Space}
   */
  space: undefined,

  //#region configuration

  emailFieldName: 'marketplaceContactEmail',

  /**
   * @type {Array<Validator>}
   */
  emailFieldValidators: Object.freeze([contactEmailValidator]),

  //#region

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
   * Current value of tags array in editable tags input (not necessarily saved).
   * @type {Array<SpaceTag>}
   */
  currentSpaceTags: Object.freeze([]),

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

  /**
   * Stores ids of currently edited inline editors.
   * @type {Set<string>}
   */
  modifiedFields: undefined,

  /**
   * Stores ids of currently edited inline editors.
   * @type {Object<SpaceConfiguration.InlineEditorFieldId, OneInlineCustomEditorApi>}
   */
  inlineEditorsApis: undefined,

  /**
   * @type {boolean}
   */
  isAskingUserForUnsavedChanges: false,

  //#endregion

  isMarketplaceEnabled: reads('spaceManager.marketplaceConfig.enabled'),

  spaceId: reads('space.entityId'),

  isReadOnly: not('space.privileges.update'),

  /**
   * @type {ComputedProperty<Array<string>>}
   */
  predefinedEmails: computed(
    'currentUser.user.emails',
    'space.marketplaceContactEmail',
    function predefinedEmails() {
      const userEmails = this.currentUser.user?.emails;
      const emails = userEmails ? [...userEmails] : [];
      const latestUsedEmail = this.space.marketplaceContactEmail;
      if (latestUsedEmail && !emails.includes(latestUsedEmail)) {
        emails.unshift(latestUsedEmail);
      }
      return emails;
    }
  ),

  predefinedEmailsOptions: computed(
    'predefinedEmails',
    function predefinedEmailsOptions() {
      return this.predefinedEmails?.map(email => ({
        value: email,
        label: email,
      })) ?? [];
    }
  ),

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

  marketplaceReadOnlyTip: computed(
    'space.privileges.{update,manageInMarketplace}',
    function marketplaceReadOnlyTip() {
      const privileges = this.space?.privileges;
      if (!privileges?.update || !privileges?.manageInMarketplace) {
        return insufficientPrivilegesMessage({
          i18n: this.i18n,
          modelName: 'space',
          privilegeFlag: ['space_update', 'space_manage_in_marketplace'],
        });
      }
    }
  ),

  /**
   * Space tags ready to use in component.
   * @type {ComputedProperty<Array<Tag>>}
   */
  spaceTags: computed('space.tags', function spaceTags() {
    return get(this.space ?? {}, 'tags')?.map(label => {
      return SpaceTag.create({
        ownerSource: this,
        label,
      });
    });
  }),

  /**
   * @type {ComputedProperty<string|null>}
   */
  tagsInputErrorMessage: conditional(
    'areSomeInputTagsUnsupported',
    computedT('someTagsUnsupported'),
  ),

  areSomeInputTagsUnsupported: notEmpty('unsupportedInputTags'),

  unsupportedInputTags: computed('currentSpaceTags', function unsupportedInputTags() {
    return this.currentSpaceTags.filter(({ isSupportedTag }) => !isSupportedTag);
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
    isEmpty('spaceDescription'),
  ),

  advertisedToggleLockHint: or(
    and(
      and(not('isMarketplaceEnabled'), not('isAdvertised')),
      computedT('advertised.lockHint.marketplaceDisabled')
    ),
    and(
      and(not('isAdvertised'), 'areAdvertiseRequirementsNotMet'),
      computedT('advertised.lockHint.requiredFieldsEmpty')
    ),
    raw(''),
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

  spaceTagsEditorSettings: computed(function spaceTagsEditorSettings() {
    return {
      type: 'tags',
      tagEditorComponentName: 'space-configuration/space-tags-selector',
    };
  }),

  viewInMarketplaceHref: computed('spaceId', function viewInMarketplaceHref() {
    return this.router.urlFor(
      'onedata.sidebar.content',
      'spaces',
      'join', {
        queryParams: {
          options: serializeAspectOptions({
            selectedSpace: this.spaceId,
          }),
        },
      }
    );
  }),

  contactEmailRootField: computed(function contactEmailRootField() {
    return FormFieldsRootGroup
      .extend({
        onValueChange(value, field) {
          this._super(...arguments);
          if (field?.name === this.spaceConfigurationComponent.emailFieldName) {
            this.spaceConfigurationComponent.getEmailInlineEditorApi()?.onChange(value);
          }
        },
      })
      .create({
        ownerSource: this,
        spaceConfigurationComponent: this,
        i18nPrefix: this.i18nPrefix,
        fields: [
          this.emailDropdownField,
        ],
      });
  }),

  emailDropdownField: computed(function emailDropdownField() {
    return CustomValueDropdownField
      .extend({
        options: reads('spaceConfigurationComponent.predefinedEmailsOptions'),
        defaultValue: reads('spaceConfigurationComponent.contactEmail'),
      })
      .create({
        spaceConfigurationComponent: this,
        name: this.emailFieldName,
        customValidators: this.emailFieldValidators,
      });
  }),

  /**
   * @type {ComputedProperty<Function>}
   */
  routeChangeHandler: computed(function routeChangeHandler() {
    return (transition) => this.handleRouteChange(transition);
  }),

  /**
   * @type {Ember.ComputedProperty<Function>}
   */
  pageUnloadHandler: computed(function pageUnloadHandler() {
    return (event) => this.handlePageUnload(event);
  }),

  spaceObserver: observer('space', function spaceObserver() {
    this.setCurrentValuesFromRecord();
  }),

  // navigationObserver: observer(
  //   'navigationState.{activeResourceType,activeResource,activeAspect}',
  //   function navigationObserver() {
  //     this.tryAskForUnsavedChanges();
  //   }
  // ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.spaceObserver();

    this.setProperties({
      blankInlineEditors: {},
      modifiedFields: new Set(),
      inlineEditorsApis: {},
    });

    this.registerRouteChangeHandler();
    this.registerPageUnloadHandler();

    // FIXME: debug code
    ((name) => {
      window[name] = this;
      console.log(`window.${name}`, window[name]);
    })('debug_space_configuration');
  },

  /**
   * @override
   */
  willDestroyElement() {
    try {
      this.unregisterRouteChangeHandler();
      this.unregisterPageUnloadHandler();
    } finally {
      this._super(...arguments);
    }
  },

  async handleRouteChange(transition) {
    // FIXME: użyć isTransitionWithinEditor jak w content-atm-inventories-workflows.js
    if (transition.isAborted) {
      return;
    }

    if (this.shouldBlockTransitionDueToUnsavedChanges()) {
      // Aborting transition doesn't work properly for query-params-only
      // transitions. This should be fixed in Ember 3.20.3.
      // TODO: VFS-10419 Check if Ember 3.20 fixed this issue.
      transition.abort();
      const userDecision = await this.askUserAndProcessUnsavedChanges();
      if (userDecision === 'save' || userDecision === 'ignore') {
        transition.retry();
      }
    }
  },

  handlePageUnload(event) {
    if (this.shouldBlockTransitionDueToUnsavedChanges()) {
      return preventPageUnload(event, String(this.t('confirmPageClose')));
    }
  },

  shouldBlockTransitionDueToUnsavedChanges() {
    const modifiedFieldsIds = this.modifiedFields.values();
    return Boolean([...modifiedFieldsIds].length);
  },

  /**
   * @returns {Promise<'ignore'|'save'|'keepEditing'|'alreadyAsked'>}
   */
  async askUserAndProcessUnsavedChanges() {
    if (this.isAskingUserForUnsavedChanges) {
      // User is already in the middle of choosing what to do. It means, that
      // there was some uncommited url/route change earlier, which needs to
      // be resolved at the first place.
      return 'alreadyAsked';
    }
    this.set('isAskingUserForUnsavedChanges', true);

    let decision = 'keepEditing';
    await this.modalManager.show('unsaved-changes-question-modal', {
      saveDisabledReason: this.isAnyValidationError() ?
        this.t('cannotSaveDueToIssues') : undefined,
      onSubmit: async ({ shouldSaveChanges }) => {
        if (shouldSaveChanges) {
          try {
            await this.saveAllModifiedFields();
            decision = 'save';
          } catch {
            // In case of failure `executeSaveAction` should show proper error
            // notification. After fail user should stay in editor view and
            // decide what to do next. Hence `decision` stays as `'keepEditing'`.
            return;
          }
        } else {
          decision = 'ignore';
        }
      },
    }).hiddenPromise;
    safeExec(this, () => {
      this.set('isAskingUserForUnsavedChanges', false);
      if (decision !== 'keepEditing') {
        this.revertAllModifiedFields();
      }
    });

    return decision;
  },

  registerRouteChangeHandler() {
    this.router.on('routeWillChange', this.routeChangeHandler);
  },

  unregisterRouteChangeHandler() {
    this.router.off('routeWillChange', this.routeChangeHandler);
  },

  registerPageUnloadHandler() {
    globals.window.addEventListener('beforeunload', this.pageUnloadHandler);
  },

  unregisterPageUnloadHandler() {
    globals.window.removeEventListener('beforeunload', this.pageUnloadHandler);
  },

  async saveAllModifiedFields() {
    const modifiedFieldsIds = [...this.modifiedFields.values()];
    await allFulfilled(modifiedFieldsIds.map((fieldId) => {
      return this.inlineEditorsApis[fieldId]?.onSave();
    }));
  },

  async revertAllModifiedFields() {
    const modifiedFieldsIds = this.modifiedFields.values();
    for (const fieldId of modifiedFieldsIds) {
      this.inlineEditorsApis[fieldId]?.onCancel();
    }
  },

  isAnyValidationError() {
    const modifiedFieldsIds = [...this.modifiedFields.values()];
    return modifiedFieldsIds.some(fieldId => this.blankInlineEditors[fieldId]);
  },

  /**
   * @returns {OneInlineCustomEditorApi}
   */
  getEmailInlineEditorApi() {
    return this.inlineEditorsApis?.['contactEmail'];
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
      currentSpaceTags: this.spaceTags,
    });
  },

  /**
   * Save inline edited value.
   * @param {string} fieldId ID of field used in this component - see switch cases.
   * @param {any} value Value from component - it will be serialized to model.
   * @returns
   */
  async saveValue(fieldId, value) {
    try {
      switch (fieldId) {
        case 'name':
        case 'organizationName':
          await this.saveSpaceValue(fieldId, value);
          break;
        case 'tags': {
          const tagsRawValue = value?.map(({ label }) => label) || [];
          await this.saveSpaceValue('tags', tagsRawValue);
          this.setCurrentValuesFromRecord();
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
    } catch (error) {
      this.globalNotify.backendError(
        this.t('savingProperty', { property: fieldId }),
        error
      );
      throw error;
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

  /**
   * @param {SpaceConfiguration.InlineEditorFieldId} fieldId
   * @param {boolean} state The same as `component:one-inline-editor` `onEdit` callback
   *   `state` parameter.
   */
  onInlineEditorStateChange(fieldId, state) {
    if (!fieldId) {
      return;
    }
    this.modifiedFields[state ? 'add' : 'delete'](fieldId);
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
    /**
     * @param {Array<SpaceTag>} value
     */
    currentSpaceTagsChanged(value) {
      this.set('currentSpaceTags', value);
      this.inlineEditorChange('tags', value);
    },
    inlineEditorChange(fieldId, value) {
      this.inlineEditorChange(fieldId, value);
    },
    handleContactEmailOnEdit(state) {
      if (state === false) {
        this.contactEmailRootField.reset();
      }
    },
    /**
     * @param {SpaceConfiguration.InlineEditorFieldId} fieldId
     * @param {OneInlineCustomEditorApi} api
     */
    registerInlineEditorApi(fieldId, api) {
      this.inlineEditorsApis[fieldId] = api;
    },
    /**
     * @param {SpaceConfiguration.InlineEditorFieldId} fieldId
     * @param {boolean} state The same as `component:one-inline-editor` `onEdit` callback
     *   `state` parameter.
     */
    inlineEditorStateChanged(fieldId, state) {
      this.onInlineEditorStateChange(fieldId, state);
    },
  },
});
