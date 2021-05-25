/**
 * For given space let user select the Oneprovider and give a place where
 * some component (typically remote component from Oneprovider) will be rendered.
 * 
 * @module components/oneprovider-view-container
 * @author Jakub Liput
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import EmberObject, { get, computed, observer } from '@ember/object';
import { reads, not } from '@ember/object/computed';
import { promise, notEmpty, array, raw, tag, conditional, gt } from 'ember-awesome-macros';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import createPropertyComparator from 'onedata-gui-common/utils/create-property-comparator';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { guidFor } from '@ember/object/internals';
import isStandaloneGuiOneprovider from 'onedata-gui-common/utils/is-standalone-gui-oneprovider';
import ChooseDefaultOneprovider from 'onezone-gui/mixins/choose-default-oneprovider';
import { resolve } from 'rsvp';

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

export default Component.extend(I18n, ChooseDefaultOneprovider, {
  tagName: '',

  /**
   * @override
   */
  i18nPrefix: 'components.oneproviderViewContainer',

  pointerEvents: service(),

  /**
   * @virtual optional
   * View to show in legacy Oneprovider, eg. spaces, transfers, shares
   * @type {String}
   */
  resourceType: '',

  /**
   * Space selected in sidebar to show its embedded content using one
   * of available Oneproviders.
   * @virtual
   * @type {models.Space}
   */
  space: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  oneproviderIdChanged: notImplementedIgnore,

  /**
   * EntityId of one of the Oneproviders that support `space` which will be used
   * to render embedded component
   * @virtual
   * @type {String}
   */
  oneproviderId: undefined,

  /**
   * @virtual optional
   * @type {String}
   */
  tabBarClass: '',

  /**
   * In collapsed mode, the currently chosen Oneprovider is displayed and
   * an option to show full options selector
   * @type {boolean}
   */
  isTabBarCollapsed: true,

  /**
   * @type {boolean}
   */
  mapSelectorEnabled: true,

  /**
   * @type {boolean}
   */
  isMapExpanded: false,

  /**
   * NOTICE: it does not observe providers array, because we do not want to reload view
   * (proxy goes to pending) when the list changes.
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
        return providers.findBy('entityId', validatedOneproviderId);
      });
    }
  )),

  selectedProvider: reads('selectedProviderProxy.content'),

  oneproviderViewProxy: promise.object(promise.all(
    'isEmbeddableOneproviderProxy',
    'selectedProviderProxy'
  )),

  /**
   * `baseUrl` property for embedded component container.
   * It is URL with path to selected Oneprovider served web application.
   * @type {ComputedProperty<string>}
   */
  contentIframeBaseUrl: reads('selectedProvider.onezoneHostedBaseUrl'),

  /**
   * True if there are more than one Oneprovider to select
   * @type {ComputedProperty<boolean>}
   */
  multiOneproviders: gt('providers.length', raw(1)),

  /**
   * State of Oneproviders selector - are there more than one to select?
   * One of: single, multi.
   * @type {ComputedProperty<String>}
   */
  collapsedSelectorState: conditional(
    'multiOneproviders',
    raw('multi'),
    raw('single'),
  ),

  /**
   * @type {ComputedProperty<String>}
   */
  componentGuid: computed(function componentGuid() {
    return guidFor(this);
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  collapsedSelectorHintTriggerClass: tag `collapsed-selector-hint-trigger-${'componentGuid'}`,

  /**
   * @type {ComputedProperty<String>}
   */
  hintTriggersConfiguration: tag `.${'collapsedSelectorHintTriggerClass'}`,

  validatedOneproviderIdProxy: promise.object(computed(
    'oneproviderId',
    function validatedOneproviderIdProxy() {
      const oneproviderId = this.get('oneproviderId');
      if (oneproviderId) {
        return resolve(oneproviderId);
      } else {
        return this.chooseDefaultOneprovider().then(defaultOneprovider => {
          if (defaultOneprovider) {
            return resolve(get(defaultOneprovider, 'entityId'));
          } else {
            return resolve(null);
          }
        });
      }
    }
  )),

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

  /**
   * @type {ComputedProperty<PromiseObject<Array<Model.Provider>>>}
   */
  initialProvidersListProxy: promise.object(
    computed('space.providerList', function initialProvidersListProxy() {
      return this.get('space').getRelation('providerList')
        .then(providerList => get(providerList, 'list'))
        .then(list => sortedOneprovidersList(list.toArray()));
    })
  ),

  isEmbeddableOneproviderProxy: promise.object(
    computed(
      'initialProvidersListProxy',
      'selectedProvider.versionProxy',
      function isEmbeddableOneproviderProxy() {
        return this.get('initialProvidersListProxy').then(() => {
          const selectedProvider = this.get('selectedProvider');
          if (selectedProvider) {
            return get(selectedProvider, 'versionProxy').then(version => {
              return !isStandaloneGuiOneprovider(version);
            });
          } else {
            return null;
          }
        });
      }),
  ),

  isEmbeddableOneprovider: reads('isEmbeddableOneproviderProxy.content'),

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
      return this.selectDefaultProvider();
    }
  }),

  /**
   * @type {Ember.ComputedProperty <boolean>}
   */
  hasAddSupportPrivilege: computed(
    'space.currentUserEffPrivileges.[]',
    function hasAddSupportPrivilege() {
      return this.get('space.currentUserEffPrivileges').includes('space_add_support');
    }),

  init() {
    this._super(...arguments);
    this.get('initialProvidersListProxy').then(list => {
      const oneproviderId = this.get('oneproviderId');
      if (!oneproviderId) {
        return this.selectDefaultProvider(list);
      }
    });
    next(() => {
      safeExec(this, 'set', 'pointerEvents.pointerNoneToMainContent', true);
    });
  },

  willDestroyElement() {
    this._super(...arguments);
    next(() => {
      safeExec(this, 'set', 'pointerEvents.pointerNoneToMainContent', false);
    });
  },

  selectDefaultProvider(providers = this.get('providers')) {
    return this.chooseDefaultOneprovider(providers).then(defaultProvider => {
      if (defaultProvider) {
        this.get('oneproviderIdChanged')(get(defaultProvider, 'entityId'));
      }
    });
  },

  actions: {
    selectedProviderChanged(providerItem) {
      this.send('onToggleExpandMap', false);
      const providerEntityId =
        get(providerItem, 'entityId') || get(providerItem, 'id');
      const provider = this.get('providers').findBy('entityId', providerEntityId);
      if (provider) {
        this.setBrowserDefaultOneproviderId(providerEntityId);
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
