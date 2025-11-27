/**
 * Table for member with privileges and memberships.
 *
 * @author Agnieszka Warchoł, Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, observer, get, set } from '@ember/object';
import { reads, bool } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';
import { promise } from 'ember-awesome-macros';
import { all as allFulfilled } from 'rsvp';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import _ from 'lodash';
import BatchRecordsLoader from 'onezone-gui/utils/batch-records-loader';

export default Component.extend(I18n, {
  classNames: ['member-privileges-table'],

  recordManager: service(),
  batchRequestRegistry: service(),

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
   * True if first load of effPrivilegesAffectorInfos after init has been settled.
   * @type {boolean}
   */
  firstLoadDone: false,

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
        return allFulfilled([
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
   * @type {ComputedProperty<BatchRecordsLoader>}
   */
  effPrivilegesAffectorsLoader: computed(
    'directGroupMembers',
    'membership.intermediaries',
    function effPrivilegesAffectorsLoader() {
      if (!this.membership) {
        return null;
      }
      const affectorsInfos = [];
      for (const groupId of this.membership.intermediaries) {
        const affectorInfo = this.directGroupMembers.find(
          member => groupId === member.id
        );
        if (affectorInfo) {
          affectorsInfos.push(affectorInfo);
        }
      }
      return new BatchRecordsLoader({
        batchRequestRegistry: this.batchRequestRegistry,
        itemsGris: _.flatten(
          affectorsInfos.map(it => it.effectivePrivilegesProxy.griArray)
        ),
        listResolver: async () => {
          return await allFulfilled(affectorsInfos.map(async (affectorInfo) => {
            if (!affectorInfo.effectivePrivilegesProxy.isLoaded) {
              await affectorInfo.effectivePrivilegesProxy.reloadRecords();
            }
            return affectorInfo;
          }));
        },
      });
    }
  ),

  /**
   * @type {ComputedProperty<PromiseObject>}
   */
  effPrivilegesAffectorInfos: computed(
    'directGroupMembers',
    'membershipProxy',
    'membership.intermediaries',
    function effPrivilegesAffectorInfos() {
      return promiseObject(
        this.membershipProxy
        .then(() => this.effPrivilegesAffectorsLoader.getPromise())
      );
    }
  ),

  effectiveLoadingTip: computed(
    'effPrivilegesAffectorsLoader.progressTracker.{totalCount,progressText}',
    'firstLoadDone',
    function effectiveLoadingTip() {
      if (!this.effPrivilegesAffectorsLoader) {
        return;
      }
      const progressTracker = this.effPrivilegesAffectorsLoader.progressTracker;
      if (!progressTracker.totalCount) {
        this.t('effectiveLoadingTip.zero');
      } else {
        const translationKey =
          `effectiveLoadingTip.${progressTracker.totalCount === 1 ? 'singular' : 'plural'}`;
        return this.t(translationKey, {
          count: progressTracker.totalCount,
          // Do not show progress if it is reloading, because reload bases on pushes.
          progress: this.firstLoadDone ? '' : progressTracker.progressText,
        });
      }
    }
  ),

  /** @type {ComputedProperty<boolean>} */
  arePrivilegesUpToDate: computed(
    'areEffPrivilegesRecalculated',
    'arePrivilegesJustSaved',
    function arePrivilegesUpToDate() {
      return !this.arePrivilegesJustSaved && this.areEffPrivilegesRecalculated;
    }
  ),

  membershipProxy: computed('contextRecord', 'targetRecord', function membershipProxy() {
    if (!this.contextRecord || !this.targetRecord) {
      return promiseObject((async () => null)());
    }
    const promise = this.recordManager.getMembership(
      this.contextRecord,
      this.targetRecord, {
        reload: true,
      }
    );
    return promiseObject(promise);
  }),

  /** @type {ComputedProperty<Membership>} */
  membership: reads('membershipProxy.content'),

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

    const isOpened = {};
    for (const entry of this.privilegesGroups) {
      isOpened[entry.groupName] = false;
    }
    this.set('groupsOpenState', isOpened);

    (async () => {
      await this.membershipProxy;
      await this.effPrivilegesAffectorInfos;
      this.set('firstLoadDone', true);
    })();
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
