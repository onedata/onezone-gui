/**
 * A first-level item component for spaces sidebar
 *
 * @author Jakub Liput, Michał Borzęcki, Agnieszka Warchoł
 * @copyright (C) 2018-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, get, set } from '@ember/object';
import { reads, collect, bool } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { next } from '@ember/runloop';
import Component from '@ember/component';
import _ from 'lodash';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
import computedPipe from 'onedata-gui-common/utils/ember/computed-pipe';
import I18n from 'onedata-gui-common/mixins/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { htmlSafe } from '@ember/string';
import { getNameWithConflictLabel } from 'onedata-gui-common/components/name-conflict';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),
  globalNotify: service(),
  spaceActions: service(),
  clipboardActions: service(),
  apiSamplesActions: service(),
  userActions: service(),
  navigationTabsConfiguration: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.sidebarSpaces.spaceItem',

  /**
   * @type {Components.SidebarSpaces}
   */
  sidebar: undefined,

  recentlyUsedIcon: 'time-outline',

  /**
   * Provider item
   * @type {Provider}
   */
  item: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  inSidenav: false,

  /**
   * @type {boolean}
   */
  isRenaming: false,

  /**
   * Proxy of current user
   * @type {Ember.ComputedProperty<PromiseObject<models/User>>}
   */
  userProxy: reads('sidebar.userProxy'),

  /**
   * Just an one-way alias
   * @type {Provider}
   */
  space: reads('item'),

  /**
   * @type {Ember.computed<string>}
   */
  spaceId: reads('space.entityId'),

  /**
   * @type {Ember.Computed<models/ProviderList>}
   */
  _providerList: reads('space.providerList'),

  /**
   * True if we know the list of provider ids (eg. for counting spaces)
   * @type {Ember.Computed<boolean>}
   */
  _providerIdsLoaded: computed(
    '_providerList.isLoaded',
    function _getSpaceIdsLoaded() {
      const _providerList = this.get('_providerList');
      return !!(
        _providerList &&
        get(_providerList, 'isLoaded')
      );
    }
  ),

  /**
   * Number of providers supporting the space
   * @type {Ember.ComputedProperty<number>}
   */
  _providersCount: computed(
    'space.supportSizes',
    function _getProvidersCount() {
      const supportSizes = this.get('space.supportSizes');
      if (supportSizes) {
        return Object.keys(supportSizes).length;
      }
    }
  ),

  /**
   * Total support size for space
   * @type {Ember.ComputedProperty<number>}
   */
  _totalSupportSize: computed(
    'space.supportSizes',
    function _getTotalSupportSize() {
      const supportSizes = this.get('space.supportSizes');
      if (supportSizes) {
        return _.sum(_.values(supportSizes));
      }
    }),

  /**
   * Human-readable total support for space (eg. "30 GiB")
   * @type {Ember.ComputedProperty<string>}
   */
  _totalSupportSizeHumanReadable: computedPipe('_totalSupportSize', bytesToString),

  isInMarketplace: reads('space.advertisedInMarketplace'),

  /**
   * @type {ComputedProperty<Record<string, Utils.Action>>}
   */
  actionsCache: computed(() => ({})),

  /**
   * @type {Ember.ComputedProperty<Utils.Action>}
   */
  leaveAction: computed('space', function leaveAction() {
    this.actionsCache.leaveAction?.destroyAfterAllExecutions();
    const action = this.userActions.createLeaveAction({
      recordToLeave: this.space,
    });
    set(action, 'className', `${action.className} leave-record-trigger`);
    this.actionsCache.leaveAction = action;
    return action;
  }),

  /**
   * @type {Ember.ComputedProperty<Utils.Action>}
   */
  openApiSamplesAction: computed('space', function openApiSamplesAction() {
    this.actionsCache.openApiSamplesAction?.destroyAfterAllExecutions();
    const {
      space,
      apiSamplesActions,
    } = this.getProperties('space', 'apiSamplesActions');
    return this.actionsCache.openApiSamplesAction =
      apiSamplesActions.createShowApiSamplesAction({
        record: space,
        apiSubject: 'space',
      });
  }),

  /**
   * @type {Ember.ComputedProperty<Utils.Action>}
   */
  removeAction: computed('space', function removeAction() {
    this.actionsCache.removeAction?.destroyAfterAllExecutions();
    const {
      spaceActions,
      space,
    } = this.getProperties('spaceActions', 'space');

    return this.actionsCache.removeAction =
      spaceActions.createRemoveSpaceAction({ space });
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  renameAction: computed('isRenaming', function renameAction() {
    return {
      action: () => this.send('toggleRename', true),
      title: this.t('rename'),
      class: 'rename-space-action',
      icon: 'browser-rename',
      disabled: this.get('isRenaming'),
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  copyIdAction: computed('space', function copyIdAction() {
    this.actionsCache.copyIdAction?.destroyAfterAllExecutions();
    const {
      space,
      clipboardActions,
    } = this.getProperties('space', 'clipboardActions');

    return this.actionsCache.copyIdAction =
      clipboardActions.createCopyRecordIdAction({ record: space });
  }),

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  itemActions: collect(
    'renameAction',
    'leaveAction',
    'removeAction',
    'copyIdAction',
    'openApiSamplesAction'
  ),

  /**
   * Opacity of "recently used" icon that can be displayed for MRU items.
   * @type {ComputedProperty<number>} Number in range 0-1 (for opacity CSS rule).
   */
  recentlyUsedOpacity: computed(
    'space.name',
    'sidebar.{maxMruCount,mruList}',
    function recentlyUsedOpacity() {
      const mruIndex = this.sidebar.mruList.indexOf(this.item.entityId);
      return this.getMruOpacity(this.sidebar.maxMruCount, mruIndex);
    }
  ),

  isRecentlyUsedIconShown: bool('recentlyUsedOpacity'),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  recentlyUsedIconStyle: computed(
    'recentlyUsedOpacity',
    function recentlyUsedIconStyle() {
      const opacity = this.recentlyUsedOpacity;
      if (opacity) {
        return htmlSafe(`opacity: ${opacity};`);
      }
    }
  ),

  /**
   * @type {ComputedProperty<string>}
   */
  displayedName: computed('space.{name,conflictLabel}', function displayedName() {
    return getNameWithConflictLabel(this.space.name, this.space.conflictLabel);
  }),

  isIdMatchingFilter: computed(
    'space.entityId',
    'sidebar.filter',
    function isIdMatchingFilter() {
      const filter = this.sidebar?.filter;
      if (filter && filter.length >= 2) {
        const queryRegExp = new RegExp('^' + filter, 'i');
        return queryRegExp.test(this.space.entityId);
      }
      return false;
    }
  ),

  /**
   * @override
   */
  willDestroyElement() {
    try {
      [
        'leaveAction',
        'openApiSamplesAction',
        'removeAction',
        'copyIdAction',
      ].forEach((action) => this.cacheFor(action)?.destroyAfterAllExecutions());
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * Computes opacity of item that is ordered as `mruIndex` in the MRU list.
   * @private
   * @param {number} total Total count of items that can be marked as recently used.
   * @param {number} mruIndex Index of the item in the MRU list (starting with the
   *   latest).
   * @returns {number}
   */
  getMruOpacity(total, mruIndex) {
    if (!total || !(mruIndex >= 0)) {
      return 0;
    }
    const maxOpacity = 0.8;
    const step = maxOpacity / total;
    return maxOpacity - mruIndex * step;
  },

  toggleRename(value) {
    next(() => safeExec(this, 'set', 'isRenaming', value));
  },
  actions: {
    editorClick(event) {
      if (this.get('isRenaming')) {
        event.stopPropagation();
        event.preventDefault();
      }
    },
    toggleRename(value) {
      this.toggleRename(value);
    },
    async rename(name) {
      if (!name || !name.length) {
        throw new Error('space-item#rename: no name provided');
      }

      const {
        space,
        globalNotify,
      } = this;

      const oldName = get(space, 'name');
      if (oldName === name) {
        this.toggleRename(false);
        return;
      }
      set(space, 'name', name);

      try {
        await space.save();
        if (this.isDestroyed || this.isDestroying) {
          return;
        }
        this.toggleRename(false);
      } catch (error) {
        globalNotify.backendError(this.t('spacePersistence'), error);
        // Restore old space name
        set(space, 'name', oldName);
        throw error;
      }
    },
  },
});
