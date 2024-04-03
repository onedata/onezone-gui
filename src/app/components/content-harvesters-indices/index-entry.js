/**
 * A component that shows harvester index
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get, set } from '@ember/object';
import { collect } from '@ember/object/computed';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import I18n from 'onedata-gui-common/mixins/i18n';
import { inject as service } from '@ember/service';
import { reject } from 'rsvp';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),
  globalNotify: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentHarvestersIndices.indexEntry',

  /**
   * @virtual
   * @type {Components.OneCollapsibleList.OneCollapsibleListItem}
   */
  listItem: undefined,

  /**
   * @virtual
   * @type {Models.Index}
   */
  index: undefined,

  /**
   * @virtual
   * @type {Models.Harvester}
   */
  harvester: undefined,

  /**
   * @virtual
   * @type {Array<string>}
   */
  guiPluginIndicesNames: undefined,

  /**
   * @virtual
   * @type {Function}
   * @returns {undefined}
   */
  onRemove: notImplementedThrow,

  /**
   * @type {boolean}
   */
  isRenaming: false,

  /**
   * @type {boolean}
   */
  isIdPresenterVisible: false,

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  renameAction: computed('isRenaming', function renameAction() {
    return {
      action: () => this.set('isRenaming', true),
      title: this.t('rename'),
      class: 'rename-index',
      icon: 'browser-rename',
      disabled: this.get('isRenaming'),
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  removeAction: computed(function removeSpaceAction() {
    return {
      action: () => this.get('onRemove')(),
      title: this.t('remove'),
      class: 'remove-index',
      icon: 'close',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  indexActions: collect('renameAction', 'removeAction'),

  actions: {
    onNameChange(newName) {
      if (!newName) {
        return reject();
      } else {
        const {
          globalNotify,
          index,
        } = this.getProperties('globalNotify', 'index');
        const oldName = get(index, 'name');
        set(index, 'name', newName);
        return index.save()
          .then(() => safeExec(this, () => {
            this.set('isRenaming', false);
          }))
          .catch((error) => {
            // Restore old name
            set(index, 'name', oldName);
            globalNotify.backendError(this.t('persistingIndex'), error);
            throw error;
          });
      }
    },
    idPresenterToggled(isOpened) {
      this.set('isIdPresenterVisible', isOpened);
    },
  },
});
