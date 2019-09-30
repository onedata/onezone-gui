import Component from '@ember/component';
import EmberObject, { get, set, computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { promise } from 'ember-awesome-macros';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';

const OneproviderTabItem = EmberObject.extend({
  /**
   * @virtual
   * @type {models.Provider}
   */
  provider: undefined,

  icon: 'provider',
  id: reads('provider.entityId'),
  name: reads('provider.name'),
  elementClass: computed('provider.online', function elementClass() {
    return `provider-${this.get('provider.online') ? 'on' : 'off'}line`;
  }),
});

export default Component.extend({
  tagName: '',

  pointerEvents: service(),

  /**
   * Space selected in sidebar to show its embedded content using one
   * of available Oneproviders.
   * @virtual
   * @type {models.Space}
   */
  space: undefined,

  /**
   * One of the Oneproviders that support `space` which will be used
   * to render embedded component
   * @virtual
   * @type {models.Provider}
   */
  selectedProvider: undefined,

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
      const providerEntityId = get(selectedProvider, 'entityId');
      return providerItems.findBy('id', providerEntityId);
    }
  ),

  providerItems: computed(
    'providers.[]',
    function providerItems() {
      const providers = this.get('providers');
      if (providers) {
        return providers.map(provider => OneproviderTabItem.create({ provider }));
      }
    }
  ),

  initialProvidersListProxy: promise.object(
    computed('space.providerList', function initialProvidersListProxy() {
      return this.get('space.providerList')
        .then(providerList => get(providerList, 'list'))
        .then(result => {
          console.log('initialProvidersListProxy resolved');
          return result;
        });
    })
  ),

  providersChanged: observer('initialProvidersListProxy', function providersChanged() {
    this.get('initialProvidersListProxy').then(list => {
      safeExec(this, 'set', 'selectedProvider', list.objectAt(0));
    });
  }),

  init() {
    this._super(...arguments);
    this.providersChanged();
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
