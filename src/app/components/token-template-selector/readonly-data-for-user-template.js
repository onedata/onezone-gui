/**
 * Read only data token template for specific user. Sets token readonly caveat
 * and narrows allowed consumers to a single user selected from a list.
 *
 * @module components/token-template-selector/readonly-data-for-user-template
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import RecordSelectorTemplate from 'onezone-gui/components/token-template-selector/record-selector-template';
import layout from 'onezone-gui/templates/components/token-template-selector/record-selector-template';
import { get, getProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import ArrayProxy from '@ember/array/proxy';
import { array } from 'ember-awesome-macros';
import { constructTokenName } from 'onezone-gui/utils/token-editor-utils';

export default RecordSelectorTemplate.extend({
  layout,

  userManager: service(),

  /**
   * @override
   */
  templateName: 'readonlyDataForUser',

  /**
   * @override
   */
  imagePath: 'assets/images/space-data.svg',

  /**
   * @override
   */
  filterDependentKeys: Object.freeze(['name', 'username']),

  /**
   * @override
   */
  fetchRecords() {
    return this.get('userManager').getAllKnownUsers().then(users => ArrayProxy.extend({
      users,
      content: array.sort('users', ['name', 'username']),
    }).create());
  },

  /**
   * @override
   */
  filterMatcher(record, filter) {
    if (!filter) {
      return true;
    }
    const normalizedFilter = filter.toLocaleLowerCase();

    const {
      name,
      username,
    } = getProperties(record, 'name', 'username');

    return (name || '').toLocaleLowerCase().includes(normalizedFilter) ||
      (username || '').toLocaleLowerCase().includes(normalizedFilter);
  },

  /**
   * @override
   */
  generateTemplateFromRecord(record) {
    return {
      name: constructTokenName('Read only data for ', get(record, 'name')),
      caveats: [{
        type: 'consumer',
        whitelist: [`usr-${get(record, 'entityId')}`],
      }, {
        type: 'data.readonly',
      }],
    };
  },
});
