/**
 * A first-level item component for providers sidebar
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2017-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { not } from '@ember/object/computed';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { collect } from 'ember-awesome-macros';
import UserProxyMixin from 'onedata-gui-websocket-client/mixins/user-proxy';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
import computedPipe from 'onedata-gui-common/utils/ember/computed-pipe';
import I18n from 'onedata-gui-common/mixins/i18n';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { bool } from '@ember/object/computed';

export default Component.extend(I18n, UserProxyMixin, {
  tagName: '',

  currentUser: service(),
  clipboardActions: service(),
  globalClipboard: service(),
  providerResources: service(),

  i18nPrefix: 'components.sidebarProviders.providerItem',

  /**
   * @virtual
   * @type {boolean}
   */
  inSidenav: false,

  /**
   * Provider item
   * @virtual
   * @type {Provider}
   */
  item: undefined,

  /**
   * Just an one-way alias
   * @type {Provider}
   */
  provider: reads('item'),

  /**
   * @type {Ember.computed<string>}
   */
  providerId: reads('provider.entityId'),

  offline: not('provider.online'),

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  itemActions: collect('copyIdAction', 'copyDomainAction'),

  /**
   * @type {ComputedProperty<Record<string, Utils.Action>>}
   */
  actionsCache: computed(() => ({})),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  copyIdAction: computed('provider', function copyIdAction() {
    this.actionsCache.copyIdAction?.destroyAfterAllExecutions();
    const {
      provider,
      clipboardActions,
    } = this.getProperties('provider', 'clipboardActions');

    return this.actionsCache.copyIdAction =
      clipboardActions.createCopyRecordIdAction({ record: provider });
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  copyDomainAction: computed(function () {
    return {
      action: () => this.get('globalClipboard').copy(
        this.get('provider.domain'),
        this.t('providerDomain')
      ),
      title: this.t('copyDomainAction'),
      class: 'copy-provider-domain-action-trigger',
      icon: 'browser-copy',
    };
  }),

  /**
   * Icon class based on item status
   * @type {Ember.ComputedProperty<string>}
   */
  iconClass: computed('item.status', function () {
    switch (this.get('item.status')) {
      case 'online':
        return 'text-success';
      case 'offline':
        return 'text-danger';
      default:
        return 'animated infinite hinge pulse-red-mint';
    }
  }),

  spaceListProxy: reads('provider.spaceList'),

  chunkableSpaceListModelProxy: computed(
    'provider',
    function chunkableSpaceListModelProxy() {
      return promiseObject(
        this.providerResources.resolveChunkableSpaceListModel(this.provider)
      );
    }
  ),

  spacesProxy: computed('chunkableSpaceListModelProxy', function spacesProxy() {
    const promise = (async () => {
      const chunkableListModel = await this.chunkableSpaceListModelProxy;
      await chunkableListModel.chunksArray.initialLoad;
      return chunkableListModel.listModel.list.content;
    })();
    return promiseObject(promise);
  }),

  spaces: reads('spacesProxy.content'),

  // Note: length must be observed, because without it, computed is not fired when data is
  // pushed (although tests using localstorage work).
  spacesCount: computed('spaceListProxy.content.list.length', function spacesCount() {
    return this.spaceListProxy.content?.hasMany('list').ids().length;
  }),

  /**
   * True if we know the list of space ids (eg. for counting spaces)
   * @type {Computed<boolean>}
   */
  isSpacesCountAvailable: reads('spaceListProxy.isFulfilled'),

  /**
   * True if information about spaces is loaded (eg. for displaying support sizes)
   * @type {ComputedProperty<boolean>}
   */
  areSpacesLoaded: bool('chunkableSpaceListModelProxy.content.chunksArray.initialLoad.isFulfilled'),

  /**
   * Total provider support size
   * @type {Ember.ComputedProperty<number>}
   */
  totalSupportSize: computed(
    'providerId',
    'spaces.@each.supportSizes',
    function totalSupportSize() {
      if (this.spaces) {
        return this.spaces.reduce(
          (sum, space) => sum + (space.supportSizes[this.providerId] ?? 0),
          0
        );
      }
    }
  ),

  /**
   * Human-readable total support provided by the provider (eg. "30 GiB")
   * @type {Ember.ComputedProperty<string>}
   */
  totalSupportSizeHumanReadable: computedPipe('totalSupportSize', bytesToString),

  /**
   * @override
   */
  willDestroyElement() {
    try {
      this.cacheFor('copyIdAction')?.destroyAfterAllExecutions();
    } finally {
      this._super(...arguments);
    }
  },
});
