/**
 * IP caveat fields of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import _ from 'lodash';
import TagsField from 'onedata-gui-common/utils/form-component/tags-field';
import { caveatCustomFieldCommonExtension, createCaveatGroup } from './common';

const IpField = TagsField.extend({
  ...caveatCustomFieldCommonExtension,

  /**
   * @override
   */
  name: 'ip',

  /**
   * @override
   */
  sort: true,

  /**
   * @override
   */
  tagEditorSettings: Object.freeze({
    // IP address with an optional mask (format: 1.1.1.1 or 1.1.1.1/2)
    regexp: /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))?$/,
  }),

  /**
   * @override
   */
  defaultValue: computed(() => []),

  /**
   * @override
   */
  sortTags(tags) {
    const ipPartsMatcher = /^(\d+)\.(\d+)\.(\d+)\.(\d+)(\/(\d+))?$/;
    const sortKeyDecoratedTags = tags.map((tag) => {
      const parsedIp = tag.label.match(ipPartsMatcher);
      // sortKey for "192.168.0.1/24" is 192168000001024
      const sortKey = parsedIp
        // Four IP octets (1,2,3,4) and mask (6)
        .slice(1, 5).concat([parsedIp[6] || '0'])
        .map((numberStr) => _.padStart(numberStr, 3, '0'))
        .join();
      return { sortKey, tag };
    });
    return _.sortBy(sortKeyDecoratedTags, ['sortKey']).map(({ tag }) => tag);
  },
});

export const IpCaveatGroup = createCaveatGroup('ip', {}, [IpField]);
