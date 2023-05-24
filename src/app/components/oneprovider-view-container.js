/**
 * For given space let user select the Oneprovider and give a place where
 * some component (typically remote component from Oneprovider) will be rendered.
 *
 * @author Jakub Liput
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import EmberObject, {
  get,
  computed,
  observer,
} from '@ember/object';
import { reads } from '@ember/object/computed';
import {
  promise,
  notEmpty,
  raw,
  tag,
  conditional,
  gt,
  and,
  not,
  or,
  eq,
} from 'ember-awesome-macros';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import createPropertyComparator from 'onedata-gui-common/utils/create-property-comparator';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { guidFor } from '@ember/object/internals';
import isStandaloneGuiOneprovider from 'onedata-gui-common/utils/is-standalone-gui-oneprovider';
import ChooseDefaultOneprovider from 'onezone-gui/mixins/choose-default-oneprovider';
import Version from 'onedata-gui-common/utils/version';

/**
 * @typedef {Object} OneproviderTabBarContext
 * @property {string} [requiredVersion]
 */

const nameComparator = createPropertyComparator('name');

function sortedOneprovidersList(list) {
  if (!list) {
    return [];
  }
  return [...list].sort(nameComparator);
}

/**
 * @type {OneproviderTabItem}
 */
const OneproviderTabItem = EmberObject.extend({
  /**
   * @virtual
   * @type {models.Provider}
   */
  provider: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  shouldBeEnabledWhenOffline: false,

  /**
   * @virtual optional
   * @type {OneproviderTabBarContext}
   */
  context: undefined,

  icon: 'provider',
  id: reads('provider.entityId'),
  type: 'provider',
  name: reads('provider.name'),
  version: reads('provider.version'),
  domain: reads('provider.domain'),
  entityId: reads('provider.entityId'),
  disabled: and(not('shouldBeEnabledWhenOffline'), not('provider.online')),
  elementClass: computed('provider.online', function elementClass() {
    return `provider-${this.get('provider.online') ? 'on' : 'off'}line`;
  }),
});

export default Component.extend(I18n, ChooseDefaultOneprovider, {
  tagName: '',

  media: service(),
  pointerEvents: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.oneproviderViewContainer',

  /**
   * View to show in legacy Oneprovider, eg.spaces, transfers, shares
   * @virtual optional
   * @deprecated TODO: VFS-7573 remove support for v19 Oneproviders
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
   * Inform parent container that an iframe will be rendered in this component, so
   * specific classes should be applied to parent.
   * @type {(hasEmbeddedIframes: boolean) => void}
   */
  hasEmbeddedIframesChanged: undefined,

  /**
   * @virtual optional
   * @type {String}
   */
  tabBarClass: '',

  /**
   * @virtual optional
   * @type {boolean}
   */
  isOverviewEnabled: false,

  /**
   * When true, then assumes that each Oneprovider will have it's dedicated view
   * from the Onezone gui (aka there will be no iframes for Oneprovider views).
   * @virtual optional
   * @type {boolean}
   */
  isOneproviderViewLocal: false,

  /**
   * @virtual optional
   * @type {boolean}
   */
  shouldOfflineOneprovidersBeEnabled: false,

  /**
   * Oneprovider version string or null. Eg. `21.02.1`.
   * @virtual optional
   * @type {string | null}
   */
  minOneproviderRequiredVersion: null,

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
        if (validatedOneproviderId === 'overview') {
          return null;
        }
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
  collapsedSelectorHintTriggerClass: tag`collapsed-selector-hint-trigger-${'componentGuid'}`,

  /**
   * @type {ComputedProperty<String>}
   */
  hintTriggersConfiguration: tag`.${'collapsedSelectorHintTriggerClass'}`,

  validatedOneproviderIdProxy: promise.object(computed(
    'oneproviderId',
    'minOneproviderRequiredVersion',
    async function validatedOneproviderIdProxy() {
      if (this.oneproviderId) {
        return this.oneproviderId;
      } else {
        const defaultOneprovider = await this.chooseDefaultOneprovider({
          requiredVersion: this.minOneproviderRequiredVersion,
        });
        if (defaultOneprovider) {
          return get(defaultOneprovider, 'entityId');
        } else {
          return null;
        }
      }
    }
  )),

  /**
   * @type {ComputedProperty<Array<Models.Provider>>}
   */
  providers: computed('space.providerList.list.@each.name', function providers() {
    const list = this.get('space.providerList.list');
    if (!list) {
      return [];
    }
    return sortedOneprovidersList(list.toArray());
  }),

  overviewTabItem: computed(function overviewTabItem() {
    return {
      id: 'overview',
      type: 'overview',
      entityId: 'overview',
      icon: 'overview',
      name: this.tt('overview'),
    };
  }),

  // TODO: handle deletion of currently selected provider
  selectedProviderItem: computed(
    'oneproviderId',
    'isOverviewEnabled',
    'selectedProvider',
    'tabBarItems',
    'overviewTabItem',
    function selectedProviderItem() {
      const {
        oneproviderId,
        isOverviewEnabled,
        selectedProvider,
        tabBarItems,
        overviewTabItem,
      } = this.getProperties(
        'oneproviderId',
        'isOverviewEnabled',
        'selectedProvider',
        'tabBarItems',
        'overviewTabItem'
      );
      if (oneproviderId === 'overview' && isOverviewEnabled) {
        return overviewTabItem;
      } else if (selectedProvider) {
        const providerEntityId = get(selectedProvider, 'entityId');
        return tabBarItems.findBy('id', providerEntityId);
      }
    }
  ),

  tabBarItems: computed(
    'isOverviewEnabled',
    'providerItems',
    'overviewTabItem',
    function tabBarItems() {
      const {
        isOverviewEnabled,
        providerItems,
        overviewTabItem,
      } = this.getProperties('isOverviewEnabled', 'providerItems', 'overviewTabItem');
      if (isOverviewEnabled) {
        return [overviewTabItem, ...providerItems];
      } else {
        return providerItems;
      }
    }
  ),

  providerItems: computed(
    'providers.[]',
    'shouldOfflineOneprovidersBeEnabled',
    function providerItems() {
      const {
        providers,
        shouldOfflineOneprovidersBeEnabled,
      } = this.getProperties('providers', 'shouldOfflineOneprovidersBeEnabled');

      return (providers || []).map((provider) => OneproviderTabItem.create({
        provider,
        shouldBeEnabledWhenOffline: shouldOfflineOneprovidersBeEnabled,
        context: this.minOneproviderRequiredVersion ? {
          requiredVersion: this.minOneproviderRequiredVersion,
        } : undefined,
      }));
    }
  ),

  isLocalViewShown: or(
    eq('oneproviderId', raw('overview')),
    'isOneproviderViewLocal',
  ),

  isOneproviderIframeShown: and(
    not('isLocalViewShown'),
    not('showAllOfflineInfo'),
    not('showAllVersionsOld'),
    not('showAllRequiredVersionsOffline'),
    not('showSelectedProviderIsOld'),
    'oneproviderViewProxy.isFulfilled',
    'isEmbeddableOneprovider',
    'selectedProvider.online',
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

  showAllVersionsOld: computed(
    'selectedProvider',
    'hasOneproviderInRequiredVersion',
    function showAllVersionsOld() {
      return !this.selectedProvider && this.hasOneproviderInRequiredVersion === false;
    }
  ),

  showAllRequiredVersionsOffline: computed(
    'selectedProvider',
    'providersInRequiredVersion',
    function showAllRequiredVersionsOffline() {
      return !this.selectedProvider &&
        this.providersInRequiredVersion?.every((provider) =>
          !get(provider, 'online')
        );
    }
  ),

  showSelectedProviderIsOld: computed(
    'selectedProvider.version',
    'minOneproviderRequiredVersion',
    function showSelectedProviderIsOld() {
      return this.selectedProvider &&
        this.minOneproviderRequiredVersion &&
        !Version.isRequiredVersion(
          get(this.selectedProvider, 'version'),
          this.minOneproviderRequiredVersion
        );
    },
  ),

  isProvidersTabBarForced: or(
    'showAllOfflineInfo',
    'showAllVersionsOld',
    'showSelectedProviderIsOld',
    not('selectedProvider'),
  ),

  effIsTabBarCollapsed: and(
    'isTabBarCollapsed',
    not('media.isMobile'),
    not('isProvidersTabBarForced'),
  ),

  hasSupport: notEmpty('providers'),

  /**
   * @type {ComputedProperty<PromiseObject<Array<Model.Provider>>>}
   */
  initialProvidersListProxy: promise.object(
    computed('space.providerList', async function initialProvidersListProxy() {
      const providerList = await this.space.getRelation('providerList');
      const providers = await get(providerList, 'list');
      return sortedOneprovidersList(providers.toArray());
    })
  ),

  viewRequiredDataProxy: reads('initialProvidersListProxy'),

  isEmbeddableOneproviderProxy: promise.object(
    computed(
      'initialProvidersListProxy',
      'selectedProvider.version',
      function isEmbeddableOneproviderProxy() {
        return this.get('initialProvidersListProxy').then(() => {
          const selectedProvider = this.get('selectedProvider');
          if (selectedProvider) {
            if (get(selectedProvider, 'id') === 'overview') {
              return selectedProvider;
            }
            const version = get(selectedProvider, 'version');
            return !isStandaloneGuiOneprovider(version);
          } else {
            return null;
          }
        });
      }),
  ),

  isEmbeddableOneprovider: reads('isEmbeddableOneproviderProxy.content'),

  providersInRequiredVersion: computed(
    'minOneproviderRequiredVersion',
    'providers.@each.version',
    function providersInRequiredVersion() {
      if (!this.providers?.length) {
        return [];
      }
      const requiredVersion = this.minOneproviderRequiredVersion;
      if (!requiredVersion) {
        return this.providers;
      }

      return this.providers.filter((provider) => {
        const providerVersion = get(provider, 'version');
        return Version.isRequiredVersion(providerVersion, requiredVersion);
      });
    },
  ),

  hasOneproviderInRequiredVersion: notEmpty('providersInRequiredVersion'),

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

  iframeStateObserver: observer(
    'isOneproviderIframeShown',
    function iframeStateObserver() {
      next(() => {
        safeExec(this, () => {
          if (
            this.pointerEvents.pointerNoneToMainContent !== this.isOneproviderIframeShown
          ) {
            this.set(
              'pointerEvents.pointerNoneToMainContent',
              this.isOneproviderIframeShown,
            );
          }
          if (typeof this.hasEmbeddedIframesChanged === 'function') {
            this.hasEmbeddedIframesChanged(this.isOneproviderIframeShown);
          } else {
            console.error(
              'iframeStateObserver: required virtual function hasEmbeddedIframesChanged is not injected nor injected'
            );
          }
        });
      });
    }
  ),

  init() {
    this._super(...arguments);

    this.initialProvidersListProxy.then(async (list) => {
      if (!this.oneproviderId) {
        await this.selectDefaultProvider(list);
      }
      this.iframeStateObserver();
    });
  },

  willDestroyElement() {
    this._super(...arguments);
    next(() => {
      safeExec(this, 'set', 'pointerEvents.pointerNoneToMainContent', false);
    });
  },

  async selectDefaultProvider(providers = this.providers) {
    const defaultProvider = await this.chooseDefaultOneprovider({
      providers,
      requiredVersion: this.minOneproviderRequiredVersion,
    });
    if (defaultProvider && !this.isDestroyed && !this.isDestroying) {
      const providerId = get(defaultProvider, 'entityId');
      this.oneproviderIdChanged(
        providerId,
        true,
      );
    }
  },

  actions: {
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
    onToggleExpandMap(expand) {
      this.set('isMapExpanded', expand);
    },
  },
});
