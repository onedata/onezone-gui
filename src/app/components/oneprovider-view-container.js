/**
 * For given space let user select the Oneprovider and give a place where
 * some component (typically remote component from Oneprovider) will be rendered.
 * 
 * @module components/oneprovider-view-container
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import EmberObject, { get, set, computed, observer } from '@ember/object';
import { reads, not } from '@ember/object/computed';
import { promise, notEmpty, array, raw } from 'ember-awesome-macros';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import createPropertyComparator from 'onedata-gui-common/utils/create-property-comparator';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

const nameComparator = createPropertyComparator('name');

function sortedOneprovidersList(list) {
  return [...list].sort(nameComparator);
}

const OneproviderTabItem = EmberObject.extend({
  /**
   * @virtual
   * @type {models.Provider}
   */
  provider: undefined,

  icon: 'provider',
  id: reads('provider.entityId'),
  name: reads('provider.name'),
  disabled: not('provider.online'),
  elementClass: computed('provider.online', function elementClass() {
    return `provider-${this.get('provider.online') ? 'on' : 'off'}line`;
  }),
});

export default Component.extend(I18n, {
  tagName: '',

  /**
   * @override
   */
  i18nPrefix: 'components.oneproviderViewContainer',

  pointerEvents: service(),

  /**
   * Space selected in sidebar to show its embedded content using one
   * of available Oneproviders.
   * @virtual
   * @type {models.Space}
   */
  space: undefined,

  oneproviderIdChanged: notImplementedIgnore,

  /**
   * EntityId of one of the Oneproviders that support `space` which will be used
   * to render embedded component
   * @virtual
   * @type {String}
   */
  oneproviderId: undefined,

  /**
   * @type {boolean}
   */
  mapSelectorEnabled: true,

  /**
   * @type {boolean}
   */
  isMapExpanded: false,

  /**
   * @type {ComputedProperty<Models.Provider>}
   */
  selectedProvider: array.findBy(
    'providers',
    raw('entityId'),
    'validatedOneproviderId'
  ),

  /**
   * `baseUrl` property for embedded component container.
   * It is URL with path to selected Oneprovider served web application.
   * @type {ComputedProperty<string>}
   */
  contentIframeBaseUrl: reads('selectedProvider.onezoneHostedBaseUrl'),

  validatedOneproviderId: computed('oneproviderId', function validatedOneproviderId() {
    const oneproviderId = this.get('oneproviderId');
    if (oneproviderId) {
      return oneproviderId;
    } else {
      const firstOnlineOneprovider = this.findFirstOnlineProvider();
      if (firstOnlineOneprovider) {
        return get(firstOnlineOneprovider, 'entityId');
      }
    }
  }),

  providers: computed('space.providerList.list.@each.name', function providers() {
    return sortedOneprovidersList(this.get('space.providerList.list').toArray());
  }),

  // TODO: handle deletion of currently selected provider
  selectedProviderItem: computed(
    'selectedProvider',
    'providerItems',
    function selectedProviderItem() {
      const {
        providerItems,
        selectedProvider,
      } = this.getProperties('providerItems', 'selectedProvider');
      if (selectedProvider) {
        const providerEntityId = get(selectedProvider, 'entityId');
        return providerItems.findBy('id', providerEntityId);
      }
    }
  ),

  providerItems: array.map(
    'providers',
    provider => OneproviderTabItem.create({ provider })
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  showAllOfflineInfo: computed(
    'selectedProvider',
    'providers.@each.online',
    function showAllOfflineInfo() {
      return !this.get('selectedProvider') && !this.get('providers').isAny('online');
    }
  ),

  hasSupport: notEmpty('providers'),

  initialProvidersListProxy: promise.object(
    computed('space.providerList', function initialProvidersListProxy() {
      return this.get('space.providerList')
        .then(providerList =>
          sortedOneprovidersList(get(providerList, 'list').toArray())
        );
    })
  ),

  /**
   * When there is no Oneprovider selected (or there is no Oneprovider at all)
   * we should observe the list to set the first online Oneprovider when it is
   * async added.
   */
  observeOnlineProvider: observer('providers.[]', function observeOnlineProvider() {
    const {
      selectedProvider,
      providers,
    } = this.getProperties('selectedProvider', 'providers');
    if (!providers.includes(selectedProvider)) {
      this.setFirstOnlineProvider();
    }
  }),

  init() {
    this._super(...arguments);
    this.get('initialProvidersListProxy').then(list => {
      const oneproviderId = this.get('oneproviderId');
      if (!oneproviderId) {
        this.setFirstOnlineProvider(list);
      }
    });
    next(() => {
      safeExec(this, 'set', 'pointerEvents.pointerNoneToMainContent', true);
    });
  },

  willDestroyElement() {
    this._super(...arguments);
    const pointerEvents = this.get('pointerEvents');
    next(() => {
      set(pointerEvents, 'pointerNoneToMainContent', false);
    });
  },

  findFirstOnlineProvider(providers) {
    const _providers = providers ? providers : this.get('providers').filterBy('online');
    return _providers.findBy('online');
  },

  setFirstOnlineProvider(providers) {
    const firstOnlineOneprovider = this.findFirstOnlineProvider(providers);
    if (firstOnlineOneprovider) {
      this.get('oneproviderIdChanged')(get(firstOnlineOneprovider, 'entityId'));
    }
  },

  actions: {
    selectedProviderChanged(providerItem) {
      this.send('onToggleExpandMap', false);

      const providerEntityId =
        get(providerItem, 'entityId') || get(providerItem, 'id');
      const provider = this.get('providers').findBy('entityId', providerEntityId);
      if (provider) {
        this.get('oneproviderIdChanged')(providerEntityId);
      } else {
        // TODO: show error if cannot find the selected provider on list
        return false;
      }
    },
    onToggleExpandMap(expand) {
      this.set('isMapExpanded', expand);
    },
  },
});
