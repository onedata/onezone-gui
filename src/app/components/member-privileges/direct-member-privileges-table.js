/**
 * Table for direct member with privileges and memberships.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, observer, get, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import MemberPrivilegesTable from './member-privileges-table';
import { promise } from 'ember-awesome-macros';

export default MemberPrivilegesTable.extend({
  /**
   * Record proxy with direct privileges.
   * @virtual
   * @type {PrivilegeRecordProxy}
   */
  recordDirectProxy: Object.freeze({}),

  /**
   * @virtual optional
   * @type {boolean}
   */
  isBulkEdit: false,

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  directPrivileges: reads('recordDirectProxy.effectivePrivilegesSnapshot'),

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

  /**
   * @type {ComputedProperty<PromiseObject>}
   */
  privilegesLoadingProxy: promise.object(promise.all(
    'recordDirectProxy.models',
    'recordEffectiveProxy.models'
  )),

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
          text: this.i18n.t(this.privilegeGroupsTranslationsPath + '.' + groupName),
          subtree: privilegesNodes,
        };
      });
    }
  ),

  init() {
    this._super(...arguments);
    scheduleOnce('afterRender', this, 'recordDirectProxyObserver');
  },

  actions: {
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
  },
});
