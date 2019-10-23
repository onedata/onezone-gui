/**
 * TODO: Prototype of go to first online Onprovider that supports this space
 * Need to implement:
 * - disable/show error sign when no Oneprovider is online
 * 
 * @module components/content-spaces-data
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import EmberObject, { get, set } from '@ember/object';
import { reads, not } from '@ember/object/computed';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { promise, computed } from 'ember-awesome-macros';
import { next } from '@ember/runloop';
import I18n from 'onedata-gui-common/mixins/components/i18n';

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
  classNames: [
    'content-spaces-data',
    'absolute-flex-content',
    'no-pointer-events',
  ],

  globalNotify: service(),
  router: service(),
  pointerEvents: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesData',

  /**
   * Space selected in sidebar to show its data using one of available
   * Oneproviders.
   * @virtual
   * @type {models.Space}
   */
  space: undefined,

  /**
   * One of the Oneproviders that support `space` which will be used
   * to show file browser.
   * @virtual
   * @type {models.Provider}
   */
  selectedProvider: undefined,

  /**
   * Will be set to true when supporting Oneproviders data is loaded.
   * @type {boolean}
   */
  providerListIsLoaded: false,

  /**
   * @type {boolean}
   */
  isMapExpanded: false,

  /**
   * `baseUrl` property for embedded component container.
   * It is URL with path to selected Oneprovider served web application.
   * @type {ComputedProperty<string>}
   */
  contentIframeBaseUrl: reads('selectedProvider.onezoneHostedBaseUrl'),

  providers: reads('space.providerList.list'),

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

  providerItems: computed(
    'providers.[]',
    function providerItems() {
      const list = this.get('space.providerList.list');
      if (list) {
        return list.map(provider => OneproviderTabItem.create({ provider }));
      }
    }
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

  initialProvidersListProxy: promise.object(
    computed('space.providerList', function initialProvidersListProxy() {
      return this.get('space.providerList')
        .then(providerList => get(providerList, 'list'));
    })
  ),

  init() {
    this._super(...arguments);
    this.get('initialProvidersListProxy').then(list => {
      const firstOnlineOneprovider = list.findBy('online');
      safeExec(this, 'set', 'selectedProvider', firstOnlineOneprovider || null);
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

  actions: {
    selectedProviderChanged(providerItem) {
      this.send('onToggleExpandMap', false);

      const providerEntityId =
        get(providerItem, 'entityId') || get(providerItem, 'id');
      const provider = this.get('providers').findBy('entityId', providerEntityId);
      if (provider) {
        this.set('selectedProvider', provider);
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
