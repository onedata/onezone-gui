/**
 * Table for direct member with privileges.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, observer, get, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import Component from '@ember/component';

export default Component.extend({
  classNames: ['direct-member-privileges-table', 'member-privileges-table'],

  /**
   * Grouped privileges
   * @virtual
   * @type {Array<Object>}
   */
  privilegesGroups: Object.freeze([]),

  /**
   * Path to the translations of privilege groups names
   * @virtual
   * @type {string}
   */
  privilegeGroupsTranslationsPath: undefined,

  /**
   * Path to the translations of privileges names
   * @virtual
   * @type {string}
   */
  privilegesTranslationsPath: undefined,

  /**
   * Record proxy with direct privileges.
   * @virtual
   * @type {PrivilegeRecordProxy}
   */
  recordDirectProxy: Object.freeze({}),

  /**
   * Record proxy with effective privileges.
   * @virtual
   * @type {PrivilegeRecordProxy}
   */
  recordEffectiveProxy: Object.freeze({}),

  /**
   * @virtual
   * @type {string}
   */
  modelTypeTranslation: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  isBulkEdit: false,

  /**
   * Object with name of group privileges with information about
   * it should be expanded in table and show more specific privileges
   * for this group or not.
   * @type {object}
   */
  isOpenedGroup: Object.freeze({}),

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  directPrivileges: reads('recordDirectProxy.effectivePrivilegesSnapshot'),

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  effectivePrivileges: reads('recordEffectiveProxy.effectivePrivilegesSnapshot'),

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  modifiedPrivileges: reads('recordDirectProxy.modifiedPrivileges'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  editionEnabled: computed(
    'recordDirectProxy.{isSaving,isReadOnly}',
    function editionEnabled() {
      return !this.get('recordDirectProxy.isSaving') &&
        !this.get('recordDirectProxy.isReadOnly');
    }
  ),

  recordDirectProxyObserver: observer(
    'recordDirectProxy',
    function recordDirectProxyObserver() {
      const recordDirectProxy = this.get('recordDirectProxy');
      if (
        !get(recordDirectProxy, 'isLoaded') &&
        !get(recordDirectProxy, 'isLoading')
      ) {
        recordDirectProxy.reloadRecords();
      }
    }
  ),

  recordEffectiveProxyObserver: observer(
    'recordEffectiveProxy',
    function recordEffectiveProxyObserver() {
      const recordEffectiveProxy = this.get('recordEffectiveProxy');
      if (
        !get(recordEffectiveProxy, 'isLoaded') &&
        !get(recordEffectiveProxy, 'isLoading')
      ) {
        recordEffectiveProxy.reloadRecords();
      }
    }
  ),

  /**
   * Tree definition
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  definition: computed(
    'directPrivileges',
    'privilegesGroups',
    'privilegeGroupsTranslationsPath',
    'privilegesTranslationsPath',
    function definition() {
      if (!this.directPrivileges) {
        return [];
      }
      return this.privilegesGroups.map(privilegesGroup => {
        const groupName = privilegesGroup.groupName;
        const privilegesNodes = privilegesGroup.privileges.map(privilege => {
          const threeStatePermission =
            this.directPrivileges[groupName][privilege.name] === 2;
          return {
            name: privilege.name,
            text: this.i18n.t(this.privilegesTranslationsPath + '.' + privilege.name),
            field: {
              type: 'checkbox',
              threeState: threeStatePermission,
              allowThreeStateToggle: threeStatePermission,
            },
          };
        });
        return {
          name: groupName,
          icon: privilegesGroup.icon,
          text: this.i18n.t(this.privilegeGroupsTranslationsPath + '.' + groupName),
          allowSubtreeCheckboxSelect: true,
          subtree: privilegesNodes,
        };
      });
    }
  ),

  init() {
    this._super(...arguments);

    // Moving record processing to the next runloop frame to avoid double set
    // in the same render (recordProxyObserver changes recordProxy content)
    scheduleOnce('afterRender', this, 'recordDirectProxyObserver');
    scheduleOnce('afterRender', this, 'recordEffectiveProxyObserver');

    const isOpened = {};
    for (const entry of this.privilegesGroups) {
      isOpened[entry.groupName] = false;
    }
    this.set('isOpenedGroup', isOpened);
  },

  actions: {
    changeOpenGroup(groupName) {
      set(this.isOpenedGroup, groupName, !this.isOpenedGroup[groupName]);
    },

    inputValueChanged(path, value) {
      const privileges = this.recordDirectProxy.modifiedPrivileges;
      if (typeof path === 'string') {
        set(privileges, path, value);
      } else {
        for (const p of path) {
          set(privileges, p, value);
        }
      }
      this.get('recordDirectProxy').setNewPrivileges(privileges);
    },

    inputFocusedOut(path, value) {
      console.log(path);
      console.log(value);
    },
  },
});
