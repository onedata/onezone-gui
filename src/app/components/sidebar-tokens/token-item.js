import Component from '@ember/component';
import { reads, collect } from '@ember/object/computed';
import { computed, get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { next } from '@ember/runloop';
import { reject } from 'rsvp';

const tokenTypeToIconNameMapping = {
  invite: 'invitation',
  access: 'access-token',
  default: 'tokens',
};

export default Component.extend(I18n, {
  i18n: service(),
  clientTokenActions: service(),

  classNames: ['token-item'],
  classNameBindings: ['isTokenActive::inactive-token'],

  /**
   * @override
   */
  i18nPrefix: 'components.sidebarTokens.tokenItem',

  /**
   * @type {Models.ClientToken}
   */
  item: undefined,

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

    return tokenTypeToIconNameMapping[type] || tokenTypeToIconNameMapping['default'];
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  renameAction: computed('isRenaming', function renameAction() {
    return {
      action: () => this.send('toggleRename', true),
      title: this.t('renameAction'),
      class: 'rename-token-action-trigger',
      icon: 'rename',
      disabled: this.get('isRenaming'),
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  removeAction: computed(function () {
    return {
      action: () => this.showRemoveTokenModal(),
      title: this.t('removeAction'),
      class: 'remove-token-action-trigger',
      icon: 'remove',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  actionsArray: collect('renameAction', 'removeAction'),

  showRemoveTokenModal() {
    this.set('isRemoveTokenModalOpened', true);
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

      const oldName = get(token, 'name');
      set(token, 'name', name);
      return token.save()
        .then(() => {
          this.send('toggleRename', false);
        })
        .catch((error) => {
          globalNotify.backendError(this.t('savingToken'), error);
          // Restore old name
          set(token, 'name', oldName);
          throw error;
        });
    },
    remove() {
      const {
        clientTokenActions,
        token,
      } = this.getProperties('clientTokenActions', 'token');

      this.set('isRemovingToken', true);
      return clientTokenActions.deleteToken(token)
        .finally(() => safeExec(this, () => this.set('isRemovingToken', true)));
    },
    closeRemoveTokenModal() {
      this.set('isRemoveTokenModalOpened', false);
    },
  },
});
