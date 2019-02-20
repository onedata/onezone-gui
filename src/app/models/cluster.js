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
import { get } from '@ember/object';
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

    /**
     * @override
     */
    fetchName() {
      if (this.get('type') === 'oneprovider') {
        return this.get('provider')
          .then(provider => get(provider, 'name'));
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
          .then(provider => get(provider, 'domain'));
      } else {
        return resolve(this.get('onedataConnection.zoneDomain'));
      }
    },

    init() {
      this._super(...arguments);
      this.on('didLoad', () => {
        this.updateNameProxy();
        this.updateDomainProxy();
      });
    },
  }
);
