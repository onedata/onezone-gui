/**
 * Table for member with privileges and memberships.
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
  classNames: ['member-privileges-table'],

  /**
   * @override
   */
  i18nPrefix: 'components.memberPrivileges.memberPrivilegesTable',

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
   * Object with name of group privileges with information about
   * it should be expanded in table and show more specific privileges
   * for this group or not.
   * @type {object}
   */
  groupsOpenState: Object.freeze({}),

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  effectivePrivileges: reads('recordEffectiveProxy.effectivePrivilegesSnapshot'),

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
    'privilegesGroups',
    'privilegeGroupsTranslationsPath',
    'privilegesTranslationsPath',
    function definition() {
      return this.privilegesGroups.map(privilegesGroup => {
        const groupName = privilegesGroup.groupName;
        const privilegesNodes = privilegesGroup.privileges.map(privilege => {
          return {
            name: privilege.name,
            text: this.i18n.t(this.privilegesTranslationsPath + '.' + privilege.name),
            field: {
              type: 'checkbox',
              threeState: false,
              allowThreeStateToggle: false,
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

    scheduleOnce('afterRender', this, 'recordEffectiveProxyObserver');

    const isOpened = {};
    for (const entry of this.privilegesGroups) {
      isOpened[entry.groupName] = false;
    }
    this.set('groupsOpenState', isOpened);
  },

  actions: {
    changeOpenGroup(groupName) {
      set(this.groupsOpenState, groupName, !this.groupsOpenState[groupName]);
    },
  },
});
