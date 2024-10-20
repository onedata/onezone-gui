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
import I18n from 'onedata-gui-common/mixins/i18n';
import { promise } from 'ember-awesome-macros';
import { Promise } from 'rsvp';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend(I18n, {
  classNames: ['member-privileges-table'],

  recordManager: service(),

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
   * @virtual
   * @type {User|Group}
   */
  contextRecord: null,

  /**
   * @virtual
   * @type {Group|Space|Cluster|Provider}
   */
  targetRecord: null,

  /**
   * @virtual
   * @type {Array<Utils/MembersCollection/ItemProxy>}
   */
  directGroupMembers: undefined,

  /**
   * @virtual optional
   * @type {Function}
   */
  highlightMemberships: notImplementedIgnore,

  /**
   * @virtual optional
   * @type {boolean}
   */
  isBulkEdit: false,

  /**
   * @virtual optional
   * @type {boolean}
   */
  isPrivilegesToggleDisabled: false,

  /**
   * @type {boolean}
   */
  arePrivilegesUpToDate: true,

  /**
   * @type {Membership}
   */
  membership: undefined,

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

  /**
   * @type {ComputedProperty<PromiseObject>}
   */
  effPrivilegesAffectorInfos: promise.object(computed(
    'directGroupMembers',
    'membership.intermediaries',
    async function effPrivilegesAffectorInfos() {
      return Promise.all(this.membership.intermediaries.map(groupId => {
        const affectorInfo = this.directGroupMembers.find(
          member => groupId === member.id
        );
        if (!affectorInfo.effectivePrivilegesProxy.isLoaded) {
          return affectorInfo.effectivePrivilegesProxy.reloadRecords().then(
            () => affectorInfo
          );
        } else {
          return affectorInfo;
        }
      }));
    }
  )),

  arePrivilegesUpToDateSetter: observer(
    'areEffPrivilegesRecalculated',
    'arePrivilegesJustSaved',
    function arePrivilegesUpToDateSetter() {
      this.set(
        'arePrivilegesUpToDate',
        !this.arePrivilegesJustSaved && this.areEffPrivilegesRecalculated
      );
    }
  ),

  directPrivilegesObserver: observer(
    'directPrivileges',
    function directPrivilegesObserver() {
      if (this.recordDirectProxy && !this.recordDirectProxy.isModified) {
        this.recordDirectProxy.resetModifications();
      }
    }
  ),

  init() {
    this._super(...arguments);

    scheduleOnce('afterRender', this, 'recordEffectiveProxyObserver');
    scheduleOnce('afterRender', this, 'recordDirectProxyObserver');
    this.fetchMembership();

    const isOpened = {};
    for (const entry of this.privilegesGroups) {
      isOpened[entry.groupName] = false;
    }
    this.set('groupsOpenState', isOpened);
  },

  async fetchMembership() {
    const membership = await this.recordManager.getMembership(
      this.contextRecord,
      this.targetRecord, {
        reload: true,
      }
    );
    safeExec(this, () => {
      this.set('membership', membership);
    });
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
    highlightMemberships(groups) {
      this.get('highlightMemberships')(groups);
    },
  },
});
