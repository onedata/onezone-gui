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
import { get, computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { resolve } from 'rsvp';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import OneproviderClusterInfoMixin from 'onezone-gui/mixins/models/oneprovider-cluster-info';
import InvitingModelMixin from 'onedata-gui-websocket-client/mixins/models/inviting-model';

export default Model.extend(
  GraphSingleModelMixin,
  InvitingModelMixin,
  OneproviderClusterInfoMixin,
  createDataProxyMixin('name'),
  createDataProxyMixin('domain'), {
    onedataConnection: service(),
    onedataGraph: service(),

    type: attr('string'),
    provider: belongsTo('provider'),
    onepanelProxy: attr('boolean'),
    workerVersion: attr('object'),
    onepanelVersion: attr('object'),
    canViewPrivateData: attr('boolean'),
    canViewPrivileges: attr('boolean', { defaultValue: false }),
    directMembership: attr('boolean', { defaultValue: false }),
    

    // members of this cluster
    groupList: belongsTo('groupList'),
    userList: belongsTo('sharedUserList'),
    effGroupList: belongsTo('groupList'),
    effUserList: belongsTo('sharedUserList'),

    /**
     * Fields:
     * - creationTime (unix timestamp number)
     */
    info: attr('object'),

    creationTime: reads('info.creationTime'),

    standaloneOrigin: computed('domain', function standaloneOrigin() {
      return `https://${this.get('domain')}:9443`;
    }),

    oneproviderEntityId: computed(function oneproviderEntityId() {
      return parseGri(this.belongsTo('provider').id()).entityId;
    }),

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

    loadAsyncProperties() {
      this.updateNameProxy();
      this.updateDomainProxy();
    },
  }
);
