/**
 * A sidebar for user (extension of ``two-level-sidebar``)
 *
 * @module components/sidebar-providers
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import UserProxyMixin from 'onedata-gui-websocket-client/mixins/user-proxy';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
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

  providersOptions: reads('providersOptionsProxy.content'),

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
    const defaultProviderId = this.get('userProxy.content.defaultProviderId');
    const providers = this.get('providersOptionsProxy.content').toArray();
    let initialProvider;
    if (get(providers, 'length') > 0) {
      initialProvider =
        _.find(providers, p => get(p, 'entityId') === defaultProviderId) ||
        providers[0];
    }

    this.set('selectedProvider', initialProvider);
  },

  actions: {
    dataProviderChanged(selectedProvider) {
      this.set('selectedProvider', selectedProvider);
    },
  },
});
