/**
 * Service caveat fields of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';
import ArrayProxy from '@ember/array/proxy';
import { equal, array, promise, raw } from 'ember-awesome-macros';
import { ModelTagsField, caveatCustomFieldCommonExtension, createCaveatGroup } from './common';

const ServiceField = ModelTagsField.extend({
  ...caveatCustomFieldCommonExtension,

  onedataConnection: service(),
  recordManager: service(),

  /**
   * @override
   */
  name: 'service',

  /**
   * @override
   */
  models: computed(function models() {
    return [{
      name: 'service',
      getRecords: () => this.servicesProxy,
    }, {
      name: 'serviceOnepanel',
      getRecords: () => this.clustersProxy,
    }];
  }),

  /**
   * @type {ComputedProperty<PromiseArray<Models.Provider | OnezoneModel>>}
   */
  servicesProxy: promise.array(computed(
    'onedataConnection.onezoneRecord',
    function servicesProxy() {
      const onezoneRecord = this.onedataConnection.onezoneRecord;

      return this.recordManager.getUserRecordList('provider')
        .then((providerList) => get(providerList, 'list'))
        .then((providers) => ArrayProxy.extend({
          providers,
          content: array.sort(array.concat('providers', raw([onezoneRecord])), ['name']),
        }).create());
    }
  )),

  /**
   * @type {ComputedProperty<PromiseArray<Models.Cluster>>}
   */
  clustersProxy: promise.array(computed(function clustersProxy() {
    return this.recordManager.getUserRecordList('cluster')
      .then((clusters) => get(clusters, 'list'));
  })),
});

export const ServiceCaveatGroup = createCaveatGroup('service', {
  isApplicable: equal('valuesSource.basic.type', raw('access')),
}, [ServiceField]);
