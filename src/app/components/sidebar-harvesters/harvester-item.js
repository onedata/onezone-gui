/**
 * A first-level item component for harvesters sidebar
 *
 * @module components/sidebar-groups/harvester-item
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get, set } from '@ember/object';
import { next } from '@ember/runloop';
import { reads, collect } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { reject } from 'rsvp';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),
  globalNotify: service(),
  harvesterActions: service(),
  router: service(),
  guiUtils: service(),
  navigationState: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.sidebarHarvesters.harvesterItem',

  /**
   * @type {boolean}
   */
  isRenaming: false,

  /**
   * @type {boolean}
   */
  isRemoveModalOpened: false,

  /**
   * @type {boolean}
   */
  isRemoving: false,

  /**
   * @type {boolean}
   */
  isLeaveModalOpened: false,

  /**
   * @type {boolean}
   */
  isLeaving: false,

  /**
   * @type {Ember.ComputedProperty<Model.Group>}
   */
  harvester: reads('item'),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  renameAction: computed('isRenaming', function renameAction() {
    return {
      action: () => this.send('toggleRename', true),
      title: this.t('rename'),
      class: 'rename-group-action',
      icon: 'rename',
      disabled: this.get('isRenaming'),
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  leaveAction: computed(function leaveAction() {
    return {
      action: () => this.send('showLeaveModal'),
      title: this.t('leave'),
      class: 'leave-harvester-action',
      icon: 'group-leave-group',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  removeAction: computed(function removeAction() {
    return {
      action: () => this.send('showRemoveModal'),
      title: this.t('remove'),
      class: 'remove-harvester-action',
      icon: 'remove',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  itemActions: collect(
    'renameAction',
    'removeAction',
    'leaveAction'
  ),

  /**
   * If actual harvester disappeared from the sidebar, redirects to harvesters main page
   * @returns {Promise}
   */
  redirectOnHarvesterRemove() {
    const {
      navigationState,
      router,
    } = this.getProperties('navigationState', 'router');
    const harvesterId = get(navigationState, 'activeResource.id');
    return navigationState
      .resourceCollectionContainsId(harvesterId)
      .then(contains => {
        if (!contains) {
          next(() => router.transitionTo('onedata.sidebar', 'harvesters'));
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
        harvester,
        globalNotify,
      } = this.getProperties('harvester', 'globalNotify');

      const oldName = get(harvester, 'name');
      set(harvester, 'name', name);
      return harvester.save()
        .then(() => {
          this.send('toggleRename', false);
        })
        .catch((error) => {
          globalNotify.backendError(this.t('persistingHarvester'), error);
          // Restore old name
          set(harvester, 'name', oldName);
          throw error;
        });
    },
    showRemoveModal() {
      this.set('isRemoveModalOpened', true);
    },
    closeRemoveModal() {
      this.set('isRemoveModalOpened', false);
    },
    remove() {
      const {
        harvester,
        harvesterActions,
      } = this.getProperties('harvester', 'harvesterActions');
      this.set('isRemoving', true);
      return harvesterActions.removeHarvester(harvester)
        .then(() => this.redirectOnHarvesterRemove())
        .finally(() => {
          safeExec(this, 'setProperties', {
            isRemoving: false,
            isRemoveModalOpened: false,
          });
        });
    },
    showLeaveModal() {
      this.set('isLeaveModalOpened', true);
    },
    closeLeaveModal() {
      this.set('isLeaveModalOpened', false);
    },
    leave() {
      const {
        harvester,
        harvesterActions,
      } = this.getProperties('harvester', 'harvesterActions');
      this.set('isLeaving', true);
      return harvesterActions.leaveHarvester(harvester)
        .then(() => this.redirectOnHarvesterRemove())
        .finally(() =>
          safeExec(this, 'setProperties', {
            isLeaving: false,
            isLeaveModalOpened: false,
          })
        );
    },
  },
});
