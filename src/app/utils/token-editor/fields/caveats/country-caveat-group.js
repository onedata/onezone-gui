/**
 * Country caveat fields of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { conditional, equal, raw } from 'ember-awesome-macros';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import TagsField from 'onedata-gui-common/utils/form-component/tags-field';
import { caveatCustomFieldCommonExtension, createCaveatGroup, WhiteBlackListDropdownField } from './common';

const CountryListField = TagsField.extend({
  /**
   * @override
   */
  name: 'countryList',

  /**
   * @override
   */
  sort: true,

  /**
   * @override
   */
  classes: conditional(
    equal('parent.value.countryType', raw('whitelist')),
    raw('tags-success'),
    raw('tags-danger'),
  ),

  /**
   * @override
   */
  defaultValue: computed(() => []),

  /**
   * @override
   */
  tagEditorSettings: computed('path', function tagEditorSettings() {
    return {
      // Only ASCII letters are allowed. See ISO 3166-1 Alpha-2 codes documentation
      regexp: /^[a-zA-Z]{2}$/,
      transform: label => label.toUpperCase(),
      placeholder: this.t(`${this.path}.editorPlaceholder`),
    };
  }),

  /**
   * @override
   */
  valueToTags(value) {
    return this._super(value?.length ? value.map(v => v.toUpperCase()) : value);
  },

  /**
   * @override
   */
  sortTags(tags) {
    return tags.sort((a, b) => a.label.localeCompare(b.label));
  },
});

const CountryField = FormFieldsGroup.extend({
  ...caveatCustomFieldCommonExtension,

  /**
   * @override
   */
  name: 'country',

  /**
   * @override
   */
  areValidationClassesEnabled: true,

  /**
   * @override
   */
  fields: computed(() => [
    WhiteBlackListDropdownField.create({ name: 'countryType' }),
    CountryListField.create(),
  ]),
});

export const CountryCaveatGroup = createCaveatGroup('country', {}, [CountryField]);
