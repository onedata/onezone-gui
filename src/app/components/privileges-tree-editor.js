/**
 * Privileges tree editor component.
 *
 * @module components/privileges-tree-editor
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { A } from '@ember/array';
import { computed, observer, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { scheduleOnce } from '@ember/runloop';

export default Component.extend({
  classNames: ['privileges-tree-editor'],

  i18n: service(),
  store: service(),

  /**
   * Grouped privileges used to construct tree nodes
   * @type {Array<Object>}
   */
  privilegesGroups: Object.freeze([]),

  /**
   * Path to the translations of privilege groups names
   * @type {string}
   */
  privilegeGroupsTranslationsPath: undefined,

  /**
   * Path to the translations of privileges names
   * @type {string}
   */
  privilegesTranslationsPath: undefined,

  /**
   * Record proxy with privileges.
   * @type {PrivilegeRecordProxy}
   */
  recordProxy: Object.freeze({}),

  /**
   * If false, edition will be not available.
   * @type {Ember.ComputedProperty<boolean>}
   */
  editionEnabled: computed(
    'recordProxy.{isSaving,isReadOnly}',
    function editionEnabled() {
      return !this.get('recordProxy.isSaving') &&
        !this.get('recordProxy.isReadOnly');
    }
  ),

  /**
   * First overridePrivileges.
   * @type {Object}
   */
  initialPrivileges: undefined,

  /**
   * State of the privileges, which will override tree state on change.
   * @type {Object}
   */
  overridePrivileges: reads('recordProxy.effectivePrivilegesSnapshot'),

  /**
   * Actually saved privileges (used to show diff).
   * @type {Object}
   */
  persistedPrivileges: reads('recordProxy.persistedPrivileges'),

  /**
   * Tree definition
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  initialTreeState: computed(
    'initialPrivileges',
    'privilegesGroups',
    'privilegeGroupsTranslationsPath',
    'privilegesTranslationsPath',
    function () {
      const {
        initialPrivileges,
        privilegesGroups,
        privilegeGroupsTranslationsPath,
        privilegesTranslationsPath,
        i18n,
      } = this.getProperties(
        'initialPrivileges',
        'privilegesGroups',
        'privilegeGroupsTranslationsPath',
        'privilegesTranslationsPath',
        'i18n'
      );
      if (!initialPrivileges) {
        return [];
      }
      return privilegesGroups.map(privilegesGroup => {
        const groupName = privilegesGroup.groupName;
        const privilegesNodes = privilegesGroup.privileges.map(privilege => {
          const threeStatePermission =
            initialPrivileges[groupName][privilege] === 2;
          return {
            name: privilege,
            text: i18n.t(privilegesTranslationsPath + '.' + privilege),
            field: {
              type: 'checkbox',
              threeState: threeStatePermission,
              allowThreeStateToggle: threeStatePermission,
            },
          };
        });
        return {
          name: groupName,
          text: i18n.t(privilegeGroupsTranslationsPath + '.' + groupName),
          allowSubtreeCheckboxSelect: true,
          subtree: privilegesNodes,
        };
      });
    }
  ),

  /**
   * Tree paths, which are disabled for edition. Used to block tree edition.
   * @type {Ember.ComputedProperty<Ember.Array<string>>}
   */
  treeDisabledPaths: computed('editionEnabled', 'privilegesGroups', function () {
    const {
      editionEnabled,
      privilegesGroups,
    } = this.getProperties('editionEnabled', 'privilegesGroups');
    return editionEnabled ? A() : A(privilegesGroups.map(g => g.groupName));
  }),

  overridePrivilegesObserver: observer('overridePrivileges', function () {
    const {
      overridePrivileges,
      initialPrivileges,
    } = this.getProperties('overridePrivileges', 'initialPrivileges');
    if (!initialPrivileges && overridePrivileges) {
      this.set('initialPrivileges', overridePrivileges);
    }
  }),

  recordProxyObserver: observer('recordProxy', function () {
    const recordProxy = this.get('recordProxy');
    if (!get(recordProxy, 'isLoaded') && !get(recordProxy, 'isLoading')) {
      recordProxy.reloadRecords();
    }
  }),

  init() {
    this._super(...arguments);
    this.overridePrivilegesObserver();
    // Moving record processing to the next runloop frame to avoid double set
    // in the same render (recordProxyObserver changes recordProxy content)
    scheduleOnce('afterRender', this, 'recordProxyObserver');
  },

  actions: {
    treeValuesChanged(values) {
      this.get('recordProxy').setNewPrivileges(values);
    },
  },
});
