/**
 * Base functionality for members aspects of application.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import {
  computed,
  get,
  observer,
} from '@ember/object';
import { union, collect, reads } from '@ember/object/computed';
import { A, isArray } from '@ember/array';
import { inject as service } from '@ember/service';
import PrivilegeRecordProxy from 'onezone-gui/utils/privilege-record-proxy';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import _ from 'lodash';
import { getOwner } from '@ember/application';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import { debounce, scheduleOnce } from '@ember/runloop';
import Action from 'onedata-gui-common/utils/action';
import {
  and,
  or,
  not,
  raw,
  equal,
  conditional,
  tag,
} from 'ember-awesome-macros';
import computedT from 'onedata-gui-common/utils/computed-t';
import { classify } from '@ember/string';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';
import animateCss from 'onedata-gui-common/utils/animate-css';
import {
  destroyDestroyableComputedValues,
  destroyableComputed,
  initDestroyableCache,
} from 'onedata-gui-common/utils/destroyable-computed';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { all as allFulfilled } from 'rsvp';

/**
 * @typedef {Models.UserList|Models.GroupList} MembersOwnersList
 */

export default Mixin.create({
  // required property: ownersListProxy: PromiseObject<MembersOwnersList>

  privilegeManager: service(),
  privilegeActions: service(),
  tokenActions: service(),
  userActions: service(),
  navigationState: service(),
  recordManager: service(),

  /**
   * @type {DS.Model}
   * @virtual
   */
  record: undefined,

  /**
   * @type {string}
   * @virtual
   */
  modelType: undefined,

  /**
   * By default most of the models does not support ownerships. If set to true, then it means
   * that `record` supports ownerships and owner-related functionalities will be enabled.
   * @type {boolean}
   */
  modelSupportsOwners: false,

  /**
   * @type {Array<Object>}
   * @virtual
   */
  groupedPrivilegesFlags: undefined,

  /**
   * @type {Object}
   */
  griAspects: Object.freeze({
    user: 'user',
    group: 'group',
  }),

  /**
   * @type {boolean}
   */
  onlyDirect: false,

  /**
   * Contains users selected on list
   * @type {Ember.Array<Utils/MembersCollection/ItemProxy>}
   */
  selectedUsersProxies: Object.freeze(A()),

  /**
   * Contains groups selected on list
   * @type {Ember.Array<Utils/MembersCollection/ItemProxy>}
   */
  selectedGroupsProxies: Object.freeze(A()),

  /**
   * @type {boolean}
   */
  batchPrivilegesEditActive: false,

  /**
   * @type {PrivilegeRecordProxy}
   */
  batchPrivilegesEditModalModel: Object.freeze({}),

  /**
   * @type {GraphSingleModel}
   */
  memberToRemove: null,

  /**
   * @type {boolean}
   */
  createChildGroupModalVisible: false,

  /**
   * @type {boolean}
   */
  isCreatingChildGroup: false,

  /**
   * @type {boolean}
   */
  addYourGroupModalVisible: false,

  /**
   * @type {boolean}
   */
  isAddingYourGroup: false,

  /**
   * @type {boolean}
   */
  joinAsUserModalVisible: false,

  /**
   * @type {boolean}
   */
  isJoiningAsUser: false,

  /**
   * @type {boolean}
   */
  showMembershipDescription: false,

  /**
   * Objects to destroy on this mixin destroy.
   * @type Array<PrivilegeRecordProxy>
   */
  privilegeRecordProxyCache: undefined,

  /**
   * Actions to destroy on this mixin destroy.
   * @type {Array<Action>}
   */
  userActionsCache: undefined,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  privilegesTranslationsPath: computed(
    'i18nPrefix',
    function privilegesTranslationsPath() {
      return this.get('i18nPrefix') + '.privileges';
    }
  ),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  privilegeGroupsTranslationsPath: computed(
    'i18nPrefix',
    function privilegeGroupsTranslationsPath() {
      return this.get('i18nPrefix') + '.privilegeGroups';
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Array<Utils/MembersCollection/ItemProxy>>}
   */
  selectedMembersProxies: union(
    'selectedUsersProxies',
    'selectedGroupsProxies',
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isAnySelectedRecordSaving: computed(
    'selectedMembersProxies.@each.saving',
    function isAnySelectedRecordSaving() {
      return this.get('selectedMembersProxies')
        .filter(memberProxy => get(memberProxy, 'privilegesProxy.saving')).length > 0;
    }
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  batchPrivilegesEditEnabled: computed(
    'selectedMembersProxies.length',
    'isAnySelectedRecordSaving',
    function batchPrivilegesEditEnabled() {
      return this.get('selectedMembersProxies.length') &&
        !this.get('isAnySelectedRecordSaving');
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  batchPrivilegesEditAction: computed(
    'batchPrivilegesEditEnabled',
    function batchPrivilegesEditAction() {
      return {
        action: () => this.send('batchPrivilegesEdit'),
        title: this.t('multiedit'),
        class: 'batch-edit',
        icon: 'browser-rename',
        disabled: !this.get('batchPrivilegesEditEnabled'),
      };
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  removeSelectedAction: computed(
    'batchPrivilegesEditEnabled',
    function removeSelectedAction() {
      return {
        action: () => this.set(
          'memberToRemove',
          this.get('selectedMembersProxies').mapBy('member')
        ),
        title: this.t('removeSelected'),
        class: 'remove-selected-action',
        icon: 'x',
        disabled: !this.get('batchPrivilegesEditEnabled'),
      };
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Function>}
   * @param {Models.Group} member
   * @param {ArrayProxy<Models.Group>} directMembers
   * @param {ArrayProxy<Models.Group>} effectiveMembers
   * @returns {Array<Utils.Action>}
   */
  groupActionsGenerator: computed(function groupActionsGenerator() {
    return group => [{
      action: () => this.set('memberToRemove', group),
      title: this.t('removeThisMember'),
      class: 'remove-group',
      icon: 'x',
    }];
  }),

  /**
   * @type {ComputedProperty<RecordArray>}
   */
  owners: reads('ownersListProxy.content.list.content'),

  /**
   * @type {Ember.ComputedProperty<Function>}
   * @param {Models.User} member
   * @param {ArrayProxy<Models.User>} directMembers
   * @param {ArrayProxy<Models.User>} effectiveMembers
   * @returns {Array<Utils.Action>}
   */
  userActionsGenerator: computed(
    'owners',
    'record',
    'modelSupportsOwners',
    function userActionsGenerator() {
      return (user, directUsers, effectiveUsers) => {
        const actions = [];
        if (this.modelSupportsOwners) {
          actions.push(this.userActions.createToggleBeingOwnerAction({
            recordBeingOwned: this.record,
            ownerRecord: user,
            owners: this.owners,
          }));
        }
        actions.push(RemoveUserAction.create({
          ownerSource: this,
          i18nPrefix: this.i18nPrefix,
          user,
          owners: this.owners,
          effectiveUsers,
          execute: () => this.set('memberToRemove', user),
        }));
        this.userActionsCache.push(...actions);
        return actions;
      };
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Function>}
   * @param {Models.Group} member
   * @param {ArrayProxy<Models.Group>} directMembers
   * @param {ArrayProxy<Models.Group>} effectiveMembers
   * @returns {Array<Utils.Action>}
   */
  effectiveGroupActionsGenerator: computed(function effectiveGroupActionsGenerator() {
    return () => [];
  }),

  /**
   * @type {Ember.ComputedProperty<Function>}
   * @param {Models.User} member
   * @param {ArrayProxy<Models.User>} directMembers
   * @param {ArrayProxy<Models.User>} effectiveMembers
   * @returns {Array<Utils.Action>}
   */
  effectiveUserActionsGenerator: computed(
    'owners',
    'record',
    'modelSupportsOwners',
    function effectiveUserActionsGenerator() {
      const {
        userActions,
        modelSupportsOwners,
        owners,
        record,
      } = this.getProperties(
        'userActions',
        'modelSupportsOwners',
        'owners',
        'record',
      );
      return user => {
        return modelSupportsOwners ? [userActions.createToggleBeingOwnerAction({
          recordBeingOwned: record,
          ownerRecord: user,
          owners,
        })] : [];
      };
    }
  ),

  /**
   * @type {ComputedProperty<Action>}
   */
  inviteGroupUsingTokenAction: destroyableComputed('record',
    function inviteGroupUsingTokenAction() {
      const {
        record,
        recordManager,
        tokenActions,
      } = this.getProperties('record', 'recordManager', 'tokenActions');

      return tokenActions.createGenerateInviteTokenAction({
        inviteType: `groupJoin${_.upperFirst(recordManager.getModelNameForRecord(record))}`,
        targetRecord: record,
      });
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  groupListActions: computed('inviteGroupUsingTokenAction', function groupListActions() {
    return [{
        action: () => this.set('createChildGroupModalVisible', true),
        title: this.t('createChildGroup'),
        class: 'create-child-group-action',
        icon: 'add-filled',
      }, {
        action: () => this.set('addYourGroupModalVisible', true),
        title: this.t('addYourGroup'),
        class: 'add-your-group-action',
        icon: 'group-invite',
      },
      this.get('inviteGroupUsingTokenAction'),
    ];
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  joinAsUserAction: computed(function joinAsUserAction() {
    return {
      action: () => this.set('joinAsUserModalVisible', true),
      title: this.t('join'),
      class: 'join-action',
      icon: 'add-filled',
    };
  }),

  /**
   * @type {ComputedProperty<Action>}
   */
  inviteUserUsingTokenAction: destroyableComputed('record',
    function inviteUserUsingTokenAction() {
      const {
        record,
        tokenActions,
      } = this.getProperties('record', 'tokenActions');

      return tokenActions.createGenerateInviteTokenAction({
        inviteType: `userJoin${classify(get(record, 'constructor.modelName'))}`,
        targetRecord: record,
      });
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  userListActions: computed(
    'record.directMembership',
    'inviteUserUsingTokenAction',
    function userListActions() {
      const {
        joinAsUserAction,
        record,
        inviteUserUsingTokenAction,
      } = this.getProperties('joinAsUserAction', 'record', 'inviteUserUsingTokenAction');
      const actions = get(record, 'directMembership') ? [] : [joinAsUserAction];
      actions.push(inviteUserUsingTokenAction);
      return actions;
    }
  ),

  /**
   * @override
   * @type {Ember.ComputedProperty<string>}
   */
  globalActionsTitle: computed(function globalActionsTitle() {
    return this.t('members');
  }),

  /**
   * @override
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  globalActions: collect('batchPrivilegesEditAction', 'removeSelectedAction'),

  /**
   * @type {ComputedProperty<String>}
   */
  viewOptionsHintTriggerClass: tag`collapsed-selector-hint-trigger-${'componentGuid'}`,

  /**
   * @type {ComputedProperty<String>}
   */
  viewOptionsHintTriggerSelector: tag`.${'viewOptionsHintTriggerClass'}`,

  /**
   * @type {ComputedProperty<string>}
   */
  modelTypeTranslation: computed('modelType', function modelTypeTranslation() {
    return this.i18n.t(`common.modelNames.${this.modelType}`);
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  headerActions: collect('removeSelectedAction'),

  requiredDataProxy: computed('ownersListProxy', function requiredDataProxy() {
    const proxies = [];
    if (this.ownersListProxy) {
      proxies.push(this.ownersListProxy);
    }
    return promiseObject(allFulfilled(proxies));
  }),

  recordObserver: observer('record', function recordObserver() {
    // reset state after record change
    scheduleOnce('afterRender', this, 'reset');
  }),

  directMembershipObserver: observer(
    'record.directMembership',
    function directMembershipObserver() {
      if (this.get('record.directMembership') && !this.get('isJoiningAsUser')) {
        this.set('joinAsUserModalVisible', false);
      }
    }
  ),

  selectionObserver: observer(
    'selectedMembersProxies.[]',
    function selectionObserver() {
      // Selection can change due to update of the members list (some of selected
      // records disappeared). In that case batch privileges editor has incorrect
      // values and should be closed.
      this.set('batchPrivilegesEditActive', false);
    }
  ),

  onlyDirectObserver: observer('onlyDirect', function onlyDirectObserver() {
    // Members scope change reloads lists (including selection), so selection state
    // should be cleared out
    this.setProperties({
      memberIdToExpand: null,
      selectedUsersProxies: A(),
      selectedGroupsProxies: A(),
    });
  }),

  selectedMemberObserver: observer(
    'navigationState.aspectOptions.member',
    function selectedMemberObserver() {
      const member = this.navigationState.aspectOptions.member;
      if (!member) {
        return;
      }
      this.set('memberIdToExpand', member);
      (async () => {
        await waitForRender();
        this.navigationState.changeRouteAspectOptions({
          member: null,
        });
      })();
      this.scheduleExpandSelectedMember();
    }
  ),

  init() {
    this.set('privilegeRecordProxyCache', []);
    this.set('userActionsCache', []);
    initDestroyableCache(this);
    this._super(...arguments);
    this.selectedMemberObserver();
  },

  /**
   * @override
   */
  willDestroy() {
    try {
      this.privilegeRecordProxyCache.forEach(obj => obj?.destroy());
      this.userActionsCache.forEach(obj => obj?.destroy());
      destroyDestroyableComputedValues(this);
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * Removes member. Should be implemented in component.
   * @virtual
   * @param {string} type type of member model
   * @param {GraphSingleModel} member member record
   * @returns {Promise}
   */
  removeMember( /* type, member */ ) {
    return notImplementedReject();
  },

  /**
   * Removes members. Should be implemented in component.
   * @virtual
   * @param {Array<GraphSingleModel>} members
   * @returns {Promise}
   */
  removeMembers( /* members */ ) {
    return notImplementedReject();
  },

  /**
   * Creates child group. Should be implemented in component.
   * @virtual
   * @param {string} name group name
   * @returns {Promise}
   */
  createChildGroup( /* name */ ) {
    return notImplementedReject();
  },

  /**
   * Adds child group. Should be implemented in component.
   * @virtual
   * @param {Group} group
   * @returns {Promise}
   */
  addMemberGroup( /* group */ ) {
    return notImplementedReject();
  },

  /**
   * Joins user directly to the record. Should be implemented in component.
   * @virtual
   * @returns {Promise}
   */
  join() {
    return notImplementedReject();
  },

  /**
   * Resets component state
   * @returns {undefined}
   */
  reset() {
    this.setProperties({
      memberToRemove: null,
      createChildGroupModalVisible: false,
      addYourGroupModalVisible: false,
      joinAsUserModalVisible: false,
      selectedUsersProxies: A(),
      selectedGroupsProxies: A(),
      memberIdToExpand: null,
    });
  },

  /**
   * Loads all data necessary for creating batch edit model
   */
  loadBatchPrivilegesEditModel() {
    const selectedMembersProxies = this.get('selectedMembersProxies');
    const batchPrivilegesEditModalModel =
      PrivilegeRecordProxy.create(getOwner(this).ownerInjection(), {
        griArray: _.flatten(selectedMembersProxies
          .map(proxy => get(proxy, 'privilegesProxy.griArray'))
        ),
        sumPrivileges: true,
        groupedPrivilegesFlags: this.get('groupedPrivilegesFlags'),
      });
    this.set(
      'batchPrivilegesEditModalModel',
      batchPrivilegesEditModalModel
    );
    this.privilegeRecordProxyCache.push(batchPrivilegesEditModalModel);
  },

  async scheduleExpandSelectedMember() {
    await waitForRender();
    // This code does not eliminate repeated calls, but it limits calls in typical
    // scenarios. Note, that `expandSelectedMember` is however safe to be invoked multiple
    // times.
    debounce(this, 'expandSelectedMember', 0);
  },

  expandSelectedMember() {
    if (this.memberIdToExpand && this.element) {
      /** @type {HTMLElement} */
      const memberItemHeader = this.element.querySelector(
        `.member-${this.memberIdToExpand} .one-collapsible-list-item-header`
      );
      if (memberItemHeader) {
        memberItemHeader.scrollIntoView();
        if (!memberItemHeader.classList.contains('opened')) {
          memberItemHeader.click();
          (async () => {
            // Must wait for render, because above click will cause
            // element to have its classname changed after next render, and below code
            // will execute before that render.
            await waitForRender();
            animateCss(memberItemHeader, 'pulse-bg-opened-list-item-header');
          })();
        }
        this.set('memberIdToExpand', null);
      }
    }
  },

  actions: {
    recordsLoaded() {
      this.scheduleExpandSelectedMember();
    },
    recordsSelected(type, records) {
      const targetListName = type === 'user' ?
        'selectedUsersProxies' : 'selectedGroupsProxies';
      this.set(targetListName, A(records));
      // there are issues in refreshing state in recalculating
      // `removeSelectedAction` property, where `batchPrivilegesEditEnabled`
      // is a dependency. Due to that issue value of `batchPrivilegesEditEnabled`
      // is refreshed manually below.
      this.get('batchPrivilegesEditEnabled');
    },
    batchPrivilegesEdit() {
      this.loadBatchPrivilegesEditModel();
      this.set('batchPrivilegesEditActive', true);
    },
    batchPrivilegesEditClose() {
      this.set('batchPrivilegesEditActive', false);
    },
    batchPrivilegesSave() {
      const {
        privilegeActions,
        batchPrivilegesEditModalModel,
      } = this.getProperties('privilegeActions', 'batchPrivilegesEditModalModel');
      return privilegeActions.handleSave(batchPrivilegesEditModalModel.save())
        .finally(() => safeExec(this, () => {
          this.set('batchPrivilegesEditActive', false);
          this.get('selectedMembersProxies').forEach(memberProxy =>
            get(memberProxy, 'privilegesProxy').reloadRecords()
          );
        }));
    },
    removeMember() {
      this.set('isRemovingMember', true);
      let promise;
      const memberToRemove = this.get('memberToRemove');
      if (isArray(memberToRemove)) {
        promise = this.removeMembers(this.get('memberToRemove'));
      } else {
        const type = get(memberToRemove, 'entityType') === 'group' ?
          'group' : 'user';
        promise = this.removeMember(type, this.get('memberToRemove'));
      }
      return promise.finally(() =>
        safeExec(this, 'setProperties', {
          isRemovingMember: false,
          memberToRemove: null,
        })
      );
    },
    createChildGroup(name) {
      this.set('isCreatingChildGroup', true);
      this.createChildGroup(name).finally(() =>
        safeExec(this, 'setProperties', {
          isCreatingChildGroup: false,
          createChildGroupModalVisible: false,
        })
      );
    },
    addYourGroup(group) {
      this.set('isAddingYourGroup', true);
      this.addMemberGroup(group).finally(() =>
        safeExec(this, 'setProperties', {
          isAddingYourGroup: false,
          addYourGroupModalVisible: false,
        })
      );
    },
    join() {
      this.set('isJoiningAsUser', true);
      this.join().finally(() =>
        safeExec(this, 'setProperties', {
          isJoiningAsUser: false,
          joinAsUserModalVisible: false,
        })
      );
    },
    inviteGroupUsingToken() {
      this.get('inviteGroupUsingTokenAction').execute();
    },
    inviteUserUsingToken() {
      this.get('inviteUserUsingTokenAction').execute();
    },
  },
});

/**
 * Remove user action specific for members aspect. Takes into account ownerships.
 * Needs: `ownerSource`, `i18nPrefix`, `user` and (optionally) `owners`
 */
const RemoveUserAction = Action.extend({
  recordManager: service(),

  /**
   * @virtual
   * @type {Models.User}
   */
  user: undefined,

  /**
   * @virtual
   * @type {ArrayProxy<Models.User>}
   */
  effectiveUsers: undefined,

  /**
   * @override
   */
  className: 'remove-user',

  /**
   * @override
   */
  icon: 'x',

  /**
   * @override
   */
  title: computedT('removeThisMember'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isOwner: computed('owners.[]', 'user', function isOwner() {
    return this.owners?.includes(this.user);
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isSingleOwner: and('isOwner', equal('owners.length', raw(1))),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isSingleUser: equal('effectiveUsers.length', raw(1)),

  /**
   * @type {ComputedProperty<Models.User>}
   */
  currentUser: computed(function currentUser() {
    return this.get('recordManager').getCurrentUserRecord();
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isCurrentUserOwner: computed(
    'owners.@each.entityId',
    'currentUser.entityId',
    function isCurrentUserOwner() {
      const currentUserEntityId = this.currentUser.entityId;
      return this.owners?.toArray().some((owner) =>
        get(owner, 'entityId') === currentUserEntityId
      ) ?? false;
    }
  ),

  /**
   * @override
   */
  disabled: or(
    and('isOwner', not('isCurrentUserOwner')),
    and('isSingleOwner', not('isSingleUser'))
  ),

  /**
   * @override
   */
  tip: conditional(
    'disabled',
    conditional(
      and('isSingleOwner', not('isSingleUser')),
      computedT('cannotRemoveSingleOwner'),
      computedT('onlyOwnerCanRemoveOtherOwner'),
    ),
    raw(undefined)
  ),
});
