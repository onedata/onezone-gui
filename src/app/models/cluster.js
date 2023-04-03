/**
 * @author Jakub Liput
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';
import StaticGraphModelMixin from 'onedata-gui-websocket-client/mixins/models/static-graph-model';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import { get, computed, observer } from '@ember/object';
import { reads, equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { hash, resolve } from 'rsvp';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import OneproviderClusterInfoMixin from 'onezone-gui/mixins/models/oneprovider-cluster-info';
import InvitingModelMixin from 'onezone-gui/mixins/models/inviting-model';
import validateOnepanelConnection from 'onedata-gui-common/utils/validate-onepanel-connection';
import { defer } from 'rsvp';
import {
  onepanelAbbrev,
} from 'onedata-gui-common/utils/onedata-urls';

export const entityType = 'cluster';

export default Model.extend(
  GraphSingleModelMixin,
  InvitingModelMixin,
  OneproviderClusterInfoMixin,
  createDataProxyMixin('name'),
  createDataProxyMixin('domain'),
  createDataProxyMixin('isOnline'),
  createDataProxyMixin('standaloneOrigin'), {
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
    userList: belongsTo('userList'),
    effGroupList: belongsTo('groupList'),
    effUserList: belongsTo('userList'),

    /**
     * Fields:
     * - creationTime (unix timestamp number)
     */
    info: attr('object'),

    /**
     * Deferred object that is revolved when record loads.
     * @type {RSVP.Deferred}
     */
    isLoadedDeferred: undefined,

    /**
     * @type {ComputedProperty<Number>}
     */
    creationTime: reads('info.creationTime'),

    /**
     * @type {ComputedProperty<String>}
     */
    serviceType: reads('type'),

    oneproviderEntityId: computed(function oneproviderEntityId() {
      return parseGri(this.belongsTo('provider').id()).entityId;
    }),

    /**
     * True, if user has a "View cluster" privilege
     * @type {Ember.ComputedProperty<boolean>}
     */
    hasViewPrivilege: equal('scope', 'private'),

    providerOnlineObserver: observer(
      'provider.online',
      function providerOnlineObserver() {
        if (!this.isLoaded) {
          return;
        }
        // not using replace, because we want see pending state of isOnlineProxy property
        this.updateIsOnlineProxy();
      }
    ),

    asyncPropertiesObserver: observer(
      'provider.{name,domain}',
      function asyncPropertiesObserver() {
        if (!this.isLoaded) {
          return;
        }
        return this.loadAsyncProperties();
      }
    ),

    isLoadedObserver: observer('isLoaded', function isLoadedObserver() {
      if (this.isLoaded) {
        this.isLoadedDeferred.resolve();
      }
    }),

    init() {
      this._super(...arguments);
      this.set('isLoadedDeferred', defer());
      // TODO: this does not work properly with localstorage adapter
      // so some views can be broken (undefined name and domain)
      if (this.isLoaded) {
        this.asyncPropertiesObserver();
      }
    },

    /**
     * @override
     */
    async fetchName() {
      await this.isLoadedDeferred.promise;
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
    async fetchDomain() {
      await this.isLoadedDeferred.promise;
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
    async fetchIsOnline() {
      await this.isLoadedDeferred.promise;
      return this._fetchIsOnline();
    },

    /**
     * @override
     */
    fetchStandaloneOrigin() {
      return this.fetchRemoteGuiContext().then(({ apiOrigin }) =>
        'https://' + apiOrigin
      );
    },

    _fetchIsOnline() {
      const {
        standaloneOriginProxy,
        entityId,
      } = this.getProperties('standaloneOriginProxy', 'entityId');
      return standaloneOriginProxy.then(standaloneOrigin => {
        return validateOnepanelConnection(standaloneOrigin, entityId);
      });
    },

    loadAsyncProperties() {
      return hash({
        name: this.updateNameProxy({ replace: true }),
        domain: this.updateDomainProxy({ replace: true }),
      });
    },

    fetchRemoteGuiContext() {
      const guiContextPath =
        `${location.origin}/${onepanelAbbrev}/${this.get('entityId')}/gui-context`;
      return resolve($.get(guiContextPath));
    },

    /**
     * @override
     */
    loadRequiredRelations() {
      return this._super(...arguments)
        .then(() => this.loadAsyncProperties());
    },
  }
).reopenClass(StaticGraphModelMixin);
