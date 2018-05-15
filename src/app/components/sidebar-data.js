/**
 * A sidebar for data (uses internally `two-level-sidebar`)
 *
 * @module components/sidebar-providers
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import UserProxyMixin from 'onedata-gui-websocket-client/mixins/user-proxy';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import sortByPropertyOrDefault from 'onedata-gui-common/utils/sort-by-property-or-default';
import _ from 'lodash';

export default Component.extend(UserProxyMixin, {
  classNames: ['two-level-sidebar', 'sidebar-data'],

  providerManager: service(),
  currentUser: service(),

  selectedProviderId: undefined,

  model: null,

  firstLevelItemIcon: 'space',

  sidebarType: 'data',

  providersOptionsProxy: computed(function () {
    return PromiseArray.create({
      promise: this.get('providerManager').getProviders()
        .then(providerList => get(providerList, 'list')),
    });
  }),

  /**
   * @type {Ember.ComputedProperty<Array<models.Provider|undefined>>}
   */
  providersOptions: computed('providersOptionsProxy.content', function () {
    /** @type {Array<models.Provider>|undefined} */
    const providersOptionsList = this.get('providersOptionsProxy.content');
    /** @type {string} */
    const defaultProviderId = this.get('userProxy.content.defaultProviderId');
    if (providersOptionsList) {
      return sortByPropertyOrDefault(
        providersOptionsList.toArray(),
        defaultProviderId,
        'name'
      );
    }
  }),

  queryParams: computed('selectedProvider.entityId', function getQueryParams() {
    return {
      provider_id: this.get('selectedProvider.entityId'),
    };
  }),

  init() {
    this._super(...arguments);
    this.get('providersOptionsProxy').then(() => safeExec(this, 'chooseInitialProvider'));
  },

  chooseInitialProvider() {
    this.set('selectedProvider', this.get('providersOptions')[0]);
  },

  actions: {
    providerMatcher(provider, term) {
      return _.includes(get(provider, 'name'), term) ? 1 : -1;
    },
  },
});
