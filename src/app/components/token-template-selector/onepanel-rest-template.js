/**
 * Onepanel REST token template. Sets token API to "rest" and narrows allowed services
 * to any Onepanel.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2021 ACK CYFRONET AGH
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

  clusterManager: service(),

  /**
   * @override
   */
  templateName: 'onepanelRest',

  /**
   * @override
   */
  imagePath: 'assets/images/token-templates/onepanel-rest.svg',

  /**
   * @override
   */
  filterDependentKeys: Object.freeze(['name']),

  /**
   * @override
   */
  fetchRecords() {
    return this.get('clusterManager').getClusters()
      .then(clusterList => get(clusterList, 'list'))
      .then(clusterList => ArrayProxy.extend({
        clusterList,
        content: array.sort('clusterList', ['type:desc', 'name']),
      }).create());
  },

  /**
   * @override
   */
  generateTemplateFromRecord(record) {
    const service = get(record, 'type') === 'onezone' ?
      'ozp-onezone' :
      `opp-${get(record, 'entityId')}`;
    return {
      name: constructTokenName(String(this.t('newTokenNamePrefix')), get(record, 'name')),
      caveats: [{
        type: 'service',
        whitelist: [service],
      }, {
        type: 'interface',
        interface: 'rest',
      }],
    };
  },
});
