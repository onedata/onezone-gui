/**
 * @module models/cluster
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import { get, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { resolve } from 'rsvp';

export default Model.extend(
  GraphSingleModelMixin,
  createDataProxyMixin('name'),
  createDataProxyMixin('domain'), {
    onedataConnection: service(),

    type: attr('string'),
    provider: belongsTo('provider'),
    onepanelProxy: attr('boolean'),
    workerVersion: attr('object'),
    onepanelVersion: attr('object'),
    info: attr('object'),

    /**
     * @override
     */
    fetchName() {
      if (this.get('type') === 'oneprovider') {
        return this.get('provider')
          .then(provider => provider && get(provider, 'name'));
      } else {
        return resolve(this.get('onedataConnection.zoneName'));
      }
    },

    /**
     * @override
     */
    fetchDomain() {
      if (this.get('type') === 'oneprovider') {
        return this.get('provider')
          .then(provider => provider && get(provider, 'domain'));
      } else {
        return resolve(this.get('onedataConnection.zoneDomain'));
      }
    },

    reloadProviderProperties: observer('provider.{name,domain}', function reloadProviderProperties() {
      this.loadAsyncProperties();
    }),

    init() {
      this._super(...arguments);
      if (this.get('isLoaded')) {
        this.reloadProviderProperties();
      } else {
        this.on('didLoad', () => {
          this.reloadProviderProperties();
        });
      }
    },

    loadAsyncProperties() {
      this.updateNameProxy();
      this.updateDomainProxy();
    },
  }
);
