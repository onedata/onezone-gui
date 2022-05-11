/**
 * For given space show basic information and let user select the Oneprovider 
 * and give a place where some component (typically remote component from Oneprovider) 
 * will be rendered.
 * 
 * @module components/overview-oneprovider-view-container
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { get, computed } from '@ember/object';
import { promise, array } from 'ember-awesome-macros';
import isStandaloneGuiOneprovider from 'onedata-gui-common/utils/is-standalone-gui-oneprovider';
import { resolve } from 'rsvp';
import oneproviderViewContainer from './oneprovider-view-container';

const OverviewTabItem = EmberObject.extend({
  id: 'overview',
  entityId: 'overview',
  name: 'Overview',
  icon: 'overview',
});

export default oneproviderViewContainer.extend({
  /**
   * NOTICE: it does not observe providers array, because we do not want to reload view
   * (proxy goes to pending) when the list changes.
   * @override
   * @type {ComputedProperty<Models.Provider>}
   */
  selectedProviderProxy: promise.object(computed(
    'validatedOneproviderIdProxy',
    function selectedProviderProxy() {
      const {
        providers,
        validatedOneproviderIdProxy,
      } = this.getProperties('providers', 'validatedOneproviderIdProxy');
      return validatedOneproviderIdProxy.then(validatedOneproviderId => {
        if (validatedOneproviderId === 'overview') {
          return resolve(this.get('overviewProviderItems')[0]);
        }
        return providers.findBy('entityId', validatedOneproviderId);
      });
    }
  )),

  /**
   * @override
   */
  // TODO: handle deletion of currently selected provider
  selectedProviderItem: computed(
    'selectedProvider',
    'providerItems',
    function selectedProviderItem() {
      const {
        selectedProvider,
        overviewProviderItems,
      } = this.getProperties('selectedProvider', 'overviewProviderItems');
      if (selectedProvider) {
        const providerEntityId = get(selectedProvider, 'entityId');
        return overviewProviderItems.findBy('id', providerEntityId);
      }
    }
  ),

  overviewProviderItems: array.concat(
    [OverviewTabItem.create()],
    'providerItems',
  ),

  /**
   * @override
   */
  isEmbeddableOneproviderProxy: promise.object(
    computed(
      'initialProvidersListProxy',
      'selectedProvider.versionProxy',
      function isEmbeddableOneproviderProxy() {
        return this.get('initialProvidersListProxy').then(() => {
          const selectedProvider = this.get('selectedProvider');
          if (selectedProvider) {
            if (selectedProvider.id === 'overview') {
              return selectedProvider;
            }
            return get(selectedProvider, 'versionProxy').then(version => {
              return !isStandaloneGuiOneprovider(version);
            });
          } else {
            return null;
          }
        });
      }),
  ),

  actions: {
    /**
     * @override
     */
    selectedProviderChanged(providerItem) {
      this.send('onToggleExpandMap', false);
      const entityId =
        get(providerItem, 'entityId') || get(providerItem, 'id');
      if (entityId === 'overview') {
        this.get('oneproviderIdChanged')(entityId);
        return true;
      }
      const provider = this.get('providers').findBy('entityId', entityId);
      if (provider) {
        this.setBrowserDefaultOneproviderId(entityId);
        this.get('oneproviderIdChanged')(entityId);
      } else {
        this.set('selectedItem', entityId);
        // TODO: show error if cannot find the selected provider on list
        return false;
      }
    },
  },
});
