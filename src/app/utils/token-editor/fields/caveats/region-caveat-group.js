/**
 * Region caveat fields of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { equal, raw, conditional, hash } from 'ember-awesome-macros';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import TagsField from 'onedata-gui-common/utils/form-component/tags-field';
import { caveatCustomFieldCommonExtension, createCaveatGroup, WhiteBlackListDropdownField } from './common';
import { computed } from '@ember/object';

const RegionListField = TagsField.extend({
  /**
   * @override
   */
  name: 'regionList',

  /**
   * @override
   */
  tagEditorComponentName: 'tags-input/selector-editor',

  /**
   * @override
   */
  sort: true,

  /**
   * @override
   */
  classes: conditional(
    equal('parent.value.regionType', raw('whitelist')),
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
  tagEditorSettings: hash('allowedTags'),

  /**
   * @type {ComputedProperty<Array<Tag>>}
   */
  allowedTags: computed(
    'i18nPrefix',
    'path',
    function allowedTags() {
      return [
        'Africa',
        'Antarctica',
        'Asia',
        'Europe',
        'EU',
        'NorthAmerica',
        'Oceania',
        'SouthAmerica',
      ].map(abbrev => ({
        label: String(this.t(`${this.path}.tags.${abbrev}`)),
        value: abbrev,
      }));
    }
  ),

  /**
   * @override
   */
  valueToTags(value) {
    return (value || [])
      .map(val => this.allowedTags.find(({ value }) => value === val))
      .filter(Boolean);
  },

  /**
   * @override
   */
  tagsToValue(tags) {
    return tags.map(({ value }) => value);
  },
});

const RegionField = FormFieldsGroup.extend({
  ...caveatCustomFieldCommonExtension,

  /**
   * @override
   */
  name: 'region',

  /**
   * @override
   */
  areValidationClassesEnabled: true,

  /**
   * @override
   */
  fields: computed(() => [
    WhiteBlackListDropdownField.create({ name: 'regionType' }),
    RegionListField.create(),
  ]),
});

export const RegionCaveatGroup = createCaveatGroup('region', {}, [RegionField]);
