/**
 * Oneclient token template for specific Oneprovider. Sets token API to "oneclient"
 * and narrows allowed services to a single Oneprovider selected from a list.
 *
 * @module components/token-template-selector/oneclient-in-oneprovider-template
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

export default RecordSelectorTemplate.extend({
  layout,

  recordManager: service(),

  /**
   * @override
   */
  templateName: 'oneclientInOneprovider',

  /**
   * @override
   */
  imagePath: 'assets/images/space-data.svg',

  /**
   * @override
   */
  fetchRecords() {
    return this.get('recordManager').getUserRecordList('provider')
      .then(oneproviderList => get(oneproviderList, 'list'))
      .then(oneproviders => ArrayProxy.extend({
        oneproviders,
        content: array.sort('oneproviders', ['name']),
      }).create());
  },

  /**
   * @override
   */
  generateTemplateFromRecord(record) {
    return {
      caveats: [{
        type: 'interface',
        interface: 'oneclient',
      }, {
        type: 'service',
        whitelist: [`opw-${get(record, 'entityId')}`],
      }],
    };
  },
});
