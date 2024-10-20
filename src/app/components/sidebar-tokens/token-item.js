/**
 * A first-level item component for tokens sidebar
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads, collect } from '@ember/object/computed';
import { computed, get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { next } from '@ember/runloop';
import { reject, resolve } from 'rsvp';

const tokenTypeToIconNameMapping = {
  invite: 'token-invite',
  access: 'token-access',
  identity: 'token-identity',
  default: 'tokens',
};

export default Component.extend(I18n, {
  classNames: ['token-item', 'item-header-inner-container'],
  classNameBindings: ['isTokenActive::inactive-token'],

  i18n: service(),
  tokenActions: service(),
  navigationState: service(),
  router: service(),
  globalNotify: service(),
  clipboardActions: service(),
  globalClipboard: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.sidebarTokens.tokenItem',

  /**
   * @type {Models.Token}
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
   * @type {boolean}
   */
  isRemovingToken: false,

  /**
   * @type {boolean}
   */
  isRemoveTokenModalOpened: false,

  /**
   * @type {Ember.ComputedProperty<Models.Token>}
   */
  token: reads('item'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isTokenActive: reads('token.isActive'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  iconName: computed('token.typeName', function () {
    const type = this.get('token.typeName');

    return tokenTypeToIconNameMapping[type] ||
      tokenTypeToIconNameMapping['default'];
  }),

  /**
   * @type {ComputedProperty<Record<string, Utils.Action>>}
   */
  actionsCache: computed(() => ({})),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  renameAction: computed('isRenaming', function renameAction() {
    return {
      action: () => this.send('toggleRename', true),
      title: this.t('renameAction'),
      class: 'rename-token-action-trigger',
      icon: 'browser-rename',
      disabled: this.get('isRenaming'),
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  removeAction: computed(function () {
    return {
      action: () => this.set('isRemoveTokenModalOpened', true),
      title: this.t('removeAction'),
      class: 'remove-token-action-trigger',
      icon: 'browser-delete',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  copyTokenAction: computed(function () {
    return {
      action: () => this.get('globalClipboard').copy(
        this.get('token.data.token'),
        this.t('token')
      ),
      title: this.t('copyTokenAction'),
      class: 'copy-token-action-trigger',
      icon: 'browser-copy',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  copyIdAction: computed('token', function copyIdAction() {
    this.actionsCache.copyIdAction?.destroyAfterAllExecutions();
    const {
      token,
      clipboardActions,
    } = this.getProperties('token', 'clipboardActions');

    return this.actionsCache.copyIdAction =
      clipboardActions.createCopyRecordIdAction({ record: token });
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  actionsArray: collect('renameAction', 'removeAction', 'copyTokenAction', 'copyIdAction'),

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

  /**
   * If actual token disappeared from the sidebar, redirects to token main page
   * @returns {Promise}
   */
  redirectOnTokenDeletion() {
    const {
      navigationState,
      router,
    } = this.getProperties('navigationState', 'router');
    const tokenId = get(navigationState, 'activeResource.id');
    return navigationState
      .resourceCollectionContainsId(tokenId)
      .then(contains => {
        if (!contains) {
          next(() => router.transitionTo('onedata.sidebar', 'tokens'));
        }
      });
  },

  actions: {
    editorClick(event) {
      if (this.get('isRenaming')) {
        event.stopPropagation();
        event.preventDefault();
      }
    },
    toggleRename(value) {
      next(() => safeExec(this, 'set', 'isRenaming', value));
    },
    rename(name) {
      if (!name || !name.length) {
        return reject();
      }

      const {
        token,
        globalNotify,
      } = this.getProperties('token', 'globalNotify');

      set(token, 'name', name);
      return (get(token, 'hasDirtyAttributes') ? token.save() : resolve())
        .then(() => {
          this.send('toggleRename', false);
        })
        .catch((error) => {
          globalNotify.backendError(this.t('savingToken'), error);
          // Restore old name
          token.rollbackAttributes();
          throw error;
        });
    },
    remove() {
      const {
        tokenActions,
        token,
      } = this.getProperties('tokenActions', 'token');

      this.set('isRemovingToken', true);
      return tokenActions.deleteToken(token)
        .then(() => this.redirectOnTokenDeletion())
        .finally(() => safeExec(this, () => this.setProperties({
          isRemovingToken: false,
          isRemoveTokenModalOpened: false,
        })));
    },
    closeRemoveTokenModal() {
      this.set('isRemoveTokenModalOpened', false);
    },
  },
});
