/**
 * @module models/cluster
 * @author Jakub Liput
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import { get, computed, observer } from '@ember/object';
import { reads, equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { hash, resolve } from 'rsvp';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import OneproviderClusterInfoMixin from 'onezone-gui/mixins/models/oneprovider-cluster-info';
import InvitingModelMixin from 'onedata-gui-websocket-client/mixins/models/inviting-model';
import checkImg from 'onedata-gui-common/utils/check-img';
import { Promise } from 'rsvp';

export default Model.extend(
  GraphSingleModelMixin,
  InvitingModelMixin,
  OneproviderClusterInfoMixin,
  createDataProxyMixin('name'),
  createDataProxyMixin('domain'),
  createDataProxyMixin('isOnline'), {
    onedataConnection: service(),
    onedataGraph: service(),

    type: attr('string'),
    provider: belongsTo('provider'),
    onepanelProxy: attr('boolean'),
    workerVersion: attr('object'),
    onepanelVersion: attr('object'),
    canViewPrivileges: attr('boolean', { defaultValue: false }),
    directMembership: attr('boolean', { defaultValue: false }),
    scope: attr('string'),

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
      return domainToOrigin(this.get('domain'));
    }),

    oneproviderEntityId: computed(function oneproviderEntityId() {
      return parseGri(this.belongsTo('provider').id()).entityId;
    }),

    /**
     * True, if user has a "View cluster" privilege
     * @type {Ember.ComputedProperty<boolean>}
     */
    hasViewPrivilege: equal('scope', 'private'),

    reloadAsyncProperties: observer(
      'provider.{name,domain}',
      function reloadProviderProperties() {
        return this.loadAsyncProperties();
      }
    ),

    init() {
      this._super(...arguments);
      // TODO: this does not work properly with localstorage adapter
      // so some views can be broken (undefined name and domain)
      if (this.get('isLoaded')) {
        this.reloadAsyncProperties();
      } else {
        this.on('ready', () => {
          this.reloadAsyncProperties();
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

    /**
     * @override
     */
    fetchIsOnline() {
      if (this.get('isLoaded')) {
        return this._fetchIsOnline();
      } else {
        return new Promise((resolve, reject) => {
          this.on('didLoad', () => this._fetchIsOnline().then(resolve, reject));
        });
      }
    },

    _fetchIsOnline() {
      return this.getDomainProxy()
        .then(domain => checkImg(`${domainToOrigin(domain)}/favicon.ico`));
    },

    loadAsyncProperties() {
      return hash({
        name: this.updateNameProxy(),
        domain: this.updateDomainProxy(),
      });
    },
  }
);

function domainToOrigin(domain) {
  return `https://${domain}:9443`;
}
