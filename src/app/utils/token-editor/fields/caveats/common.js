/**
 * Definitions common for all caveat fields of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { not, and, or, hash } from 'ember-awesome-macros';
import _ from 'lodash';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import StaticTextField from 'onedata-gui-common/utils/form-component/static-text-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import TagsField from 'onedata-gui-common/utils/form-component/tags-field';
import {
  Tag as RecordTag,
  removeExcessiveTags,
} from 'onedata-gui-common/components/tags-input/model-selector-editor';

export const CaveatToggleField = ToggleField.extend({
  classes: 'caveat-group-toggle',
  addColonToLabel: reads('isInViewMode'),
});

export const caveatCustomFieldCommonExtension = {
  isVisible: reads('parent.isCaveatEnabled'),
};

export const DisabledCaveatDescriptionField = StaticTextField.extend({
  isVisible: not('parent.isCaveatEnabled'),
});

export function createCaveatFields(caveatName, customCaveatFieldClasses) {
  return [
    CaveatToggleField.create({ name: `${caveatName}Enabled` }),
    ...customCaveatFieldClasses.map((fieldClass) => fieldClass.create()),
    DisabledCaveatDescriptionField.create({ name: `${caveatName}DisabledText` }),
  ];
}

/**
 * @param {string} caveatName
 * @param {Object} customCaveatExtension
 * @param {Array<Object>} customCaveatFieldClasses
 * @returns {Utils.FormComponent.FormFieldsGroup}
 */
export function createCaveatGroup(
  caveatName,
  customCaveatExtension = {},
  customCaveatFieldClasses = []
) {
  return FormFieldsGroup.extend({
    /**
     * @virtual
     * @type {TokenEditorFieldContext}
     */
    context: undefined,

    /**
     * @virtual optional
     * @type {boolean}
     */
    isApplicable: true,

    /**
     * @override
     */
    name: `${caveatName}Caveat`,

    /**
     * @override
     */
    classes: computed('isCaveatEnabled', function classes() {
      return 'caveat-group' + (this.isCaveatEnabled ? ' is-enabled' : '');
    }),

    /**
     * @override
     */
    fields: computed(() => createCaveatFields(caveatName, customCaveatFieldClasses)),

    /**
     * @override
     */
    isVisible: and(
      or('isCaveatEnabled', 'context.areAllCaveatsExpanded'),
      'isApplicable'
    ),

    /**
     * @type {ComputedProperty<boolean>}
     */
    isCaveatEnabled: reads(`value.${caveatName}Enabled`),
  }, customCaveatExtension);
}

export const WhiteBlackListDropdownField = DropdownField.extend({
  /**
   * @override
   */
  defaultValue: 'whitelist',

  /**
   * @override
   */
  areValidationClassesEnabled: false,

  /**
   * @override
   */
  options: Object.freeze([
    { value: 'whitelist' },
    { value: 'blacklist' },
  ]),

  /**
   * @override
   */
  showSearch: false,
});

export const ModelTagsField = TagsField.extend({
  /**
   * @virtual
   * @type {Array<{ name: string, getRecords: () => Promise<Array<unknown>>}>}
   */
  models: undefined,

  /**
   * @override
   */
  tagEditorComponentName: 'tags-input/model-selector-editor',

  /**
   * @override
   */
  sort: true,

  /**
   * @override
   */
  defaultValue: computed(() => []),

  /**
   * @override
   */
  tagEditorSettings: hash('models'),

  /**
   * @override
   */
  valueToTags(value) {
    return (value || []).map(val => RecordTag.create({
      ownerSource: this,
      value: val,
    }));
  },

  /**
   * @override
   */
  tagsToValue(tags) {
    return _.uniq(removeExcessiveTags(tags).map(({ value }) => value).filter(Boolean));
  },

  /**
   * @override
   */
  sortTags(tags) {
    const modelsOrder = this.models.map(({ name }) => name);
    const sortKeyDecoratedTags = tags.map(tag => {
      const isOnezone = get(tag, 'value.record.serviceType') === 'onezone';
      const modelIndex = modelsOrder.indexOf(tag.value?.model);
      const sortKey = `${isOnezone ? '0': '1'}-${modelIndex}-${tag.label}`;
      return { sortKey, tag };
    });
    return _.sortBy(sortKeyDecoratedTags, ['sortKey']).map(({ tag }) => tag);
  },
});
