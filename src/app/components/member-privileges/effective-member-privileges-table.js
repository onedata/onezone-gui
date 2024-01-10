/**
 * Table for not direct member with privileges.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, observer, get, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['effective-member-privileges-table', 'member-privileges-table'],

  /**
   * @override
   */
  i18nPrefix: 'components.memberPrivileges.effectiveMemberPrivilegesTable',

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
  recordEffectiveProxy: Object.freeze({}),

  effectivePrivileges: reads('recordEffectiveProxy.effectivePrivilegesSnapshot'),

  allowThreeStateToggles: true,

  isOpen: false,

  modelTypeTranslation: undefined,

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
    'privilegesGroups',
    'privilegeGroupsTranslationsPath',
    'privilegesTranslationsPath',
    'effOverridePrivileges',
    function definition() {
      const {
        privilegesGroups,
        privilegeGroupsTranslationsPath,
        privilegesTranslationsPath,
        i18n,
      } = this.getProperties(
        'privilegesGroups',
        'privilegeGroupsTranslationsPath',
        'privilegesTranslationsPath',
        'i18n'
      );
      return privilegesGroups.map(privilegesGroup => {
        const groupName = privilegesGroup.groupName;
        const privilegesNodes = privilegesGroup.privileges.map(privilege => {
          const threeStatePermission = false;
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
  },
});
