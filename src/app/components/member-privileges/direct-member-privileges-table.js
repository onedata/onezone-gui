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
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend({
  classNames: ['direct-member-privileges-table', 'member-privileges-table'],
  i18n: service(),

  /**
   * Grouped privileges used to construct tree nodes
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
   * Record proxy with privileges.
   * @virtual
   * @type {PrivilegeRecordProxy}
   */
  recordDirectProxy: Object.freeze({}),

  isBulkEdit: false,

  modelTypeTranslation: undefined,

  /**
   * Record proxy with privileges.
   * @virtual
   * @type {PrivilegeRecordProxy}
   */
  recordEffectiveProxy: Object.freeze({}),

  directPrivileges: reads('recordDirectProxy.effectivePrivilegesSnapshot'),

  modifiedPrivileges: reads('recordDirectProxy.modifiedPrivileges'),

  directPrivilegesToShow: computed(
    'directPrivileges',
    'modifiedPrivileges',
    function directPrivilegesToShow() {
      if (this.modifiedPrivileges) {
        return this.modifiedPrivileges;
      } else {
        return this.directPrivileges;
      }
    }
  ),

  effectivePrivileges: reads('recordEffectiveProxy.effectivePrivilegesSnapshot'),

  /**
   * @override
   */
  overridePrivileges: reads('recordDirectProxy.effectivePrivilegesSnapshot'),

  allowThreeStateToggles: true,

  isOpen: false,

  editionEnabled: computed(
    'recordDirectProxy.{isSaving,isReadOnly}',
    function editionEnabled() {
      return !this.get('recordDirectProxy.isSaving') &&
        !this.get('recordDirectProxy.isReadOnly');
    }
  ),

  /**
   * Values used to fill tree form elements. On each change of this property
   * all tree values will be refreshed with new values.
   * @type {object}
   */
  overrideValues: reads('directPrivileges'),

  /**
   * Tree paths, which are disabled for edition. Used to block tree edition.
   * @type {Ember.ComputedProperty<Ember.Array<string>>}
   */
  treeDisabledPaths: computed(
    'editionEnabled',
    'privilegesGroups',
    function treeDisabledPaths() {
      const {
        editionEnabled,
        privilegesGroups,
      } = this.getProperties('editionEnabled', 'privilegesGroups');
      return editionEnabled ? A() : A(privilegesGroups.map(g => g.groupName));
    }
  ),

  isDirect: undefined,

  recordDirectProxyObserver: observer('recordDirectProxy', function recordDirectProxyObserver() {
    const recordDirectProxy = this.get('recordDirectProxy');
    if (!get(recordDirectProxy, 'isLoaded') && !get(
        recordDirectProxy,
        'isLoading')) {
      recordDirectProxy.reloadRecords();
    }
  }),

  recordEffectiveProxyObserver: observer('recordEffectiveProxy', function recordEffectiveProxyObserver() {
    const recordEffectiveProxy = this.get('recordEffectiveProxy');
    if (!get(recordEffectiveProxy, 'isLoaded') && !get(recordEffectiveProxy, 'isLoading')) {
      recordEffectiveProxy.reloadRecords();
    }
  }),

  isOpenedGroup: Object.freeze({}),

  /**
   * Tree definition
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  definition: computed(
    'allowThreeStateToggles',
    'directPrivileges',
    'privilegesGroups',
    'privilegeGroupsTranslationsPath',
    'privilegesTranslationsPath',
    'effOverridePrivileges',
    function definition() {
      const {
        allowThreeStateToggles,
        directPrivileges,
        privilegesGroups,
        privilegeGroupsTranslationsPath,
        privilegesTranslationsPath,
        i18n,
      } = this.getProperties(
        'allowThreeStateToggles',
        'directPrivileges',
        'privilegesGroups',
        'privilegeGroupsTranslationsPath',
        'privilegesTranslationsPath',
        'i18n'
      );
      if (!directPrivileges) {
        return [];
      }
      return privilegesGroups.map(privilegesGroup => {
        const groupName = privilegesGroup.groupName;
        // this.isOpenedGroup[groupName] = false;
        const privilegesNodes = privilegesGroup.privileges.map(privilege => {
          const threeStatePermission = allowThreeStateToggles &&
            directPrivileges[groupName][privilege.name] === 2;
          return {
            name: privilege.name,
            text: i18n.t(privilegesTranslationsPath + '.' + privilege.name),
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
          text: i18n.t(privilegeGroupsTranslationsPath + '.' + groupName),
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

  /**
   * @type {Function}
   * @param {Object} data actual values of privileges tree (compatible
   *   with overridePrivileges)
   * @returns {undefined}
   */
  onChange: notImplementedIgnore,

  actions: {
    changeOpenGroup(groupName) {
      set(this.isOpenedGroup, groupName, !this.isOpenedGroup[groupName]);
    },

    inputValueChanged(path, value) {
      // set(this.compareValues, path, value);
      // const superResult = this.get('onChange')(this.compareValues);
      let tmp;
      if (this.recordDirectProxy.modifiedPrivileges) {
        tmp = this.recordDirectProxy.modifiedPrivileges;
      } else {
        tmp = this.recordDirectProxy.effectivePrivilegesSnapshot;
      }
      if (typeof path === 'string') {
        set(tmp, path, value);
      } else {
        for (const p of path) {
          set(tmp, p, value);
        }
      }
      this.get('recordDirectProxy').setNewPrivileges(tmp);

    },

    /**
     * Marks an input as 'changed' after focus out event.
     * @param {string} path Path to the value in the values tree.
     */
    inputFocusedOut(path, value) {
      console.log(path);
      console.log(value);
      // set(this.compareValues, path, value);
      // this.get('recordDirectProxy').setNewPrivileges(this.compareValues);
      // this._markFieldAsModified(path);
      // this.valuesHaveChanged(false, false);
    },
  },
});
