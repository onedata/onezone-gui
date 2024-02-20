/**
 * ASN caveat fields of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import _ from 'lodash';
import TagsField from 'onedata-gui-common/utils/form-component/tags-field';
import { caveatCustomFieldCommonExtension, createCaveatGroup } from './common';

const AsnField = TagsField.extend({
  ...caveatCustomFieldCommonExtension,

  /**
   * @override
   */
  name: 'asn',

  /**
   * @override
   */
  sort: true,

  /**
   * @override
   */
  tagEditorSettings: Object.freeze({
    regexp: /^\d+$/,
  }),

  /**
   * @override
   */
  defaultValue: computed(() => []),

  /**
   * @override
   */
  tagsToValue(tags) {
    return _.uniq(tags.map(({ label }) => parseInt(label)));
  },

  /**
   * @override
   */
  valueToTags(value) {
    return (value || []).map(asn => ({ label: String(asn) }));
  },

  /**
   * @override
   */
  sortTags(tags) {
    return tags.sort((a, b) => parseInt(a.label) - parseInt(b.label));
  },
});

export const AsnCaveatGroup = createCaveatGroup('asn', {}, [AsnField]);
