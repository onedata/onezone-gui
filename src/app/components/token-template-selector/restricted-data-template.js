/**
 * Restricted data access token template. Narrows allowed data paths to a single space
 * selected from a list.
 *
 * @module components/token-template-selector/restricted-data-template
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import RecordSelectorTemplate from 'onezone-gui/components/token-template-selector/record-selector-template';
import layout from 'onezone-gui/templates/components/token-template-selector/record-selector-template';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import ArrayProxy from '@ember/array/proxy';
import { array } from 'ember-awesome-macros';
import { constructTokenName } from 'onezone-gui/utils/token-editor-utils';

export default RecordSelectorTemplate.extend({
  layout,

  recordManager: service(),

  /**
   * @override
   */
  templateName: 'restrictedData',

  /**
   * @override
   */
  imagePath: 'assets/images/space-data.svg',

  /**
   * @override
   */
  fetchRecords() {
    return this.get('recordManager').getUserRecordList('space')
      .then(spacesList => get(spacesList, 'list'))
      .then(spaces => ArrayProxy.extend({
        spaces,
        content: array.sort('spaces', ['name']),
      }).create());
  },

  /**
   * @override
   */
  generateTemplateFromRecord(record) {
    return {
      name: constructTokenName('Restricted data acc. ', get(record, 'name')),
      caveats: [{
        type: 'data.path',
        whitelist: [btoa(`/${get(record, 'entityId')}`)],
      }],
    };
  },
});
