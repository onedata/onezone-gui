/**
 * Table for member with privileges and memberships.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, observer, get, set } from '@ember/object';
import { reads, bool } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { promise } from 'ember-awesome-macros';
import { Promise } from 'rsvp';

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
   * Record proxy with direct privileges.
   * @virtual
   * @type {PrivilegeRecordProxy}
   */
  recordDirectProxy: Object.freeze({}),

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
   * @type {boolean}
   */
  arePrivilegesUpToDate: true,

  /**
   * Object with name of group privileges with information about
   * it should be expanded in table and show more specific privileges
   * for this group or not.
   * @type {object}
   */
  groupsOpenState: Object.freeze({}),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isDirectMember: bool('recordDirectProxy'),

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  effectivePrivileges: reads('recordEffectiveProxy.effectivePrivilegesSnapshot'),

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  directPrivileges: reads('recordDirectProxy.effectivePrivilegesSnapshot'),

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  modifiedPrivileges: reads('recordDirectProxy.modifiedPrivileges'),

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

  recordDirectProxyObserver: observer(
    'recordDirectProxy',
    function recordDirectProxyObserver() {
      if (this.get('recordDirectProxy')) {
        const recordDirectProxy = this.get('recordDirectProxy');
        if (
          !get(recordDirectProxy, 'isLoaded') &&
          !get(recordDirectProxy, 'isLoading')
        ) {
          recordDirectProxy.reloadRecords();
        }
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  editionEnabled: computed(
    'recordDirectProxy.{isSaving,isReadOnly}',
    function editionEnabled() {
      return this.get('recordDirectProxy') && !this.get('recordDirectProxy.isSaving') &&
        !this.get('recordDirectProxy.isReadOnly');
    }
  ),

  /**
   * @type {ComputedProperty<PromiseObject>}
   */
  privilegesLoadingProxy: promise.object(computed(
    'recordDirectProxy.models',
    'recordEffectiveProxy.models',
    async function privilegesLoadingProxy() {
      if (this.get('recordDirectProxy')) {
        return Promise.all([
          this.get('recordDirectProxy.models'),
          this.get('recordEffectiveProxy.models'),
        ]);
      } else {
        return this.get('recordEffectiveProxy.models');
      }
    }
  )),

  isLoadingPrivilegesProxy: computed(
    'recordDirectProxy.{isLoading,hasBeenLoaded}',
    'recordEffectiveProxy.{isLoading,hasBeenLoaded}',
    function isLoadingPrivilegesProxy() {
      if (this.get('recordDirectProxy')) {
        return (this.get('recordDirectProxy.isLoading') &&
            !this.get('recordDirectProxy.hasBeenLoaded')) &&
          (this.get('recordEffectiveProxy.isLoading') &&
            !this.get('recordEffectiveProxy.hasBeenLoaded'));
      } else {
        return this.get('recordEffectiveProxy.isLoading') &&
          !this.get('recordEffectiveProxy.hasBeenLoaded');
      }
    }
  ),

  isLoadedPrivilegesProxy: computed(
    'recordDirectProxy.{models.isRejected,hasBeenLoaded}',
    'recordEffectiveProxy.{models.isRejected,hasBeenLoaded}',
    function isLoadedPrivilegesProxy() {
      if (this.get('recordDirectProxy')) {
        return (this.get('recordDirectProxy.hasBeenLoaded') &&
            !this.get('recordDirectProxy.models.isRejected')) &&
          (this.get('recordEffectiveProxy.hasBeenLoaded') &&
            !this.get('recordEffectiveProxy.models.isRejected'));
      } else {
        return this.get('recordEffectiveProxy.hasBeenLoaded') &&
          !this.get('recordEffectiveProxy.models.isRejected');
      }
    }
  ),

  isErrorPrivilegesProxy: computed(
    'recordDirectProxy.fetchError',
    'recordEffectiveProxy.fetchError',
    function isErrorPrivilegesProxy() {
      return this.get('recordDirectProxy.fetchError') ??
        this.get('recordEffectiveProxy.fetchError');
    }
  ),

  errorReasonProxy: computed(
    'recordDirectProxy.fetchError',
    'recordEffectiveProxy.fetchError',
    function errorReasonProxy() {
      if (this.get('recordDirectProxy')) {
        if (this.get('recordDirectProxy.fetchError')) {
          return this.get('recordDirectProxy.fetchError');
        }
      } else {
        return this.get('recordEffectiveProxy.fetchError');
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
          let threeStatePermission = false;
          if (this.get('recordDirectProxy')) {
            threeStatePermission =
              this.directPrivileges[groupName][privilege.name] === 2;
          }
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

  effectivePrivilegesObserver: observer(
    'effectivePrivileges',
    'areEffPrivilegesRecalculated',
    function effectivePrivilegesObserver() {
      if (this.areEffPrivilegesRecalculated) {
        this.set('arePrivilegesUpToDate', true);
        this.set('arePrivilegesJustSaved', false);
      }
    }
  ),

  arePrivilegesUpToDateObserver: observer(
    'areEffPrivilegesRecalculated',
    'arePrivilegesJustSaved',
    function arePrivilegesUpToDateObserver() {
      if (!this.areEffPrivilegesRecalculated || this.arePrivilegesJustSaved) {
        this.set('arePrivilegesUpToDate', false);
      }
    }
  ),

  init() {
    this._super(...arguments);

    scheduleOnce('afterRender', this, 'recordEffectiveProxyObserver');
    scheduleOnce('afterRender', this, 'recordDirectProxyObserver');

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
