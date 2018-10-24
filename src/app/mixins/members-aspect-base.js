/**
 * Base functionality for members aspects of application.
 *
 * @module mixins/members-aspect-base
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { computed, get, observer } from '@ember/object';
import { union, collect } from '@ember/object/computed';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import PrivilegeRecordProxy from 'onezone-gui/utils/privilege-record-proxy';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import _ from 'lodash';
import { getOwner } from '@ember/application';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import { isArray } from '@ember/array';

export default Mixin.create({
  privilegeManager: service(),
  privilegeActions: service(),
  media: service(),

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
  onlyDirect: true,

  /**
   * One of: privileges, memberships
   * @type {string}
   */
  aspect: 'privileges',

  /**
   * Contains users selected on list
   * @type {Ember.Array<Utils/MembersList/ItemProxy>}
   */
  selectedUsersProxies: Object.freeze(A()),

  /**
   * Contains groups selected on list
   * @type {Ember.Array<Utils/MembersList/ItemProxy>}
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
   * Positive value will show invite-using-token-modal. Possible values:
   * 'user', 'group', null
   * @type {string|null}
   */
  inviteTokenModalType: null,

  /**
   * @type {boolean}
   */
  viewToolsVisible: false,

  /**
   * @type {boolean}
   */
  showMembershipDescription: false,

  /**
   * @type {Array<Action>}
   */
  effectiveGroupActions: Object.freeze([]),

  /**
   * @type {Array<Action>}
   */
  effectiveUserActions: Object.freeze([]),

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
   * @type {Ember.ComputedProperty<Array<Utils/MembersList/ItemProxy>>}
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
  batchPrivilegesEditAvailable: computed(
    'aspect',
    'onlyDirect',
    function batchPrivilegesEditAvailable() {
      const {
        aspect,
        onlyDirect,
      } = this.getProperties('aspect', 'onlyDirect');
      return aspect === 'privileges' && onlyDirect;
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
   * @type {Ember.ComputedProperty<boolean>}
   */
  viewOptionsAction: computed('viewToolsVisible', function viewOptionsAction() {
    const viewToolsVisible = this.get('viewToolsVisible');
    return {
      action: () => this.send('toogleViewTools'),
      title: this.t(viewToolsVisible ? 'hideViewOptions' : 'showViewOptions'),
      class: 'view-options-action',
      icon: 'no-view',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  batchPrivilegesEditAction: computed('batchPrivilegesEditEnabled', function batchPrivilegesEditAction() {
    return {
      action: () => this.send('batchPrivilegesEdit'),
      title: this.t('multiedit'),
      class: 'batch-edit',
      icon: 'rename',
      disabled: !this.get('batchPrivilegesEditEnabled'),
    };
  }),

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
        icon: 'close',
        disabled: !this.get('batchPrivilegesEditEnabled'),
      };
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  groupActions: computed(function groupActions() {
    return [{
      action: member => this.set('memberToRemove', member),
      title: this.t('removeThisMember'),
      class: 'remove-group',
      icon: 'close',
    }];
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  userActions: computed(function userActions() {
    return [{
      action: member => this.set('memberToRemove', member),
      title: this.t('removeThisMember'),
      class: 'remove-user',
      icon: 'close',
    }];
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  groupListActions: computed(function groupListActions() {
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
    }, {
      action: () => this.set('inviteTokenModalType', 'group'),
      title: this.t('inviteGroupUsingToken'),
      class: 'invite-group-using-token-action',
      icon: 'join-plug',
    }];
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
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  userListActions: computed('record.directMembership', function userListActions() {
    const directMembership = this.get('record.directMembership');
    const actions = directMembership ? [] : [this.get('joinAsUserAction')];
    actions.push({
      action: () => this.set('inviteTokenModalType', 'user'),
      title: this.t('inviteUserUsingToken'),
      class: 'invite-user-using-token-action',
      icon: 'join-plug',
    });
    return actions;
  }),

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
  globalActions: computed(
    'viewOptionsAction',
    'batchPrivilegesEditAction',
    'batchPrivilegesEditAvailable',
    'removeSelectedAction',
    function globalActions() {
      const {
        viewOptionsAction,
        batchPrivilegesEditAvailable,
        batchPrivilegesEditAction,
        removeSelectedAction,
      } = this.getProperties(
        'viewOptionsAction',
        'batchPrivilegesEditAvailable',
        'batchPrivilegesEditAction',
        'removeSelectedAction'
      );
      const actions = [viewOptionsAction];
      if (batchPrivilegesEditAvailable) {
        actions.push(batchPrivilegesEditAction);
      }
      actions.push(removeSelectedAction);
      return actions;
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  headerActions: collect('removeSelectedAction'),

  recordObserver: observer('record', function recordObserver() {
    // reset state after record change
    this.reset();
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
      selectedUsersProxies: A(),
      selectedGroupsProxies: A(),
    });
  }),

  init() {
    this._super(...arguments);

    // Restore remembered view tools visibility
    let viewToolsVisible =
      localStorage.getItem('membersAspectBaseMixin.viewToolsVisible');
    if (viewToolsVisible === null) {
      viewToolsVisible = 'false';
      localStorage.setItem(
        'membersAspectBaseMixin.viewToolsVisible',
        viewToolsVisible
      );
    }
    this.set('viewToolsVisible', viewToolsVisible === 'true');
  },

  /**
   * Removes member. Should be implemented in component.
   * @virtual
   * @param {string} type type of member model
   * @param {GraphSingleModel} member member record
   * @return {Promise}
   */
  removeMember( /* type, member */ ) {
    return notImplementedReject();
  },

  /**
   * Removes members. Should be implemented in component.
   * @virtual
   * @param {Array<GraphSingleModel>} members
   * @return {Promise}
   */
  removeMembers( /* members */ ) {
    return notImplementedReject();
  },

  /**
   * Creates child group. Should be implemented in component.
   * @virtual
   * @param {string} name group name
   * @return {Promise}
   */
  createChildGroup( /* name */ ) {
    return notImplementedReject();
  },

  /**
   * Adds child group. Should be implemented in component.
   * @virtual
   * @param {Group} group
   * @return {Promise}
   */
  addMemberGroup( /* group */ ) {
    return notImplementedReject();
  },

  /**
   * Joins user directly to the record. Should be implemented in component.
   * @virtual
   * @return {Promise}
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
      inviteTokenModalType: null,
      selectedUsersProxies: A(),
      selectedGroupsProxies: A(),
    });
  },

  /**
   * Loads all data necessary for creating batch edit model
   * @returns {PrivilegeRecordProxy}
   */
  loadBatchPrivilegesEditModel() {
    const selectedMembersProxies = this.get('selectedMembersProxies');
    this.set(
      'batchPrivilegesEditModalModel',
      PrivilegeRecordProxy.create(getOwner(this).ownerInjection(), {
        griArray: _.flatten(selectedMembersProxies
          .map(proxy => get(proxy, 'privilegesProxy.griArray'))
        ),
        sumPrivileges: true,
        groupedPrivilegesFlags: this.get('groupedPrivilegesFlags'),
      })
    );
  },

  actions: {
    toogleViewTools() {
      this.toggleProperty('viewToolsVisible');
      localStorage.setItem(
        'membersAspectBaseMixin.viewToolsVisible',
        String(this.get('viewToolsVisible'))
      );
    },
    changeAspect(aspect) {
      this.set('aspect', String(aspect));
    },
    recordsSelected(type, records) {
      let targetListName = type === 'user' ?
        'selectedUsersProxies' : 'selectedGroupsProxies';
      this.set(targetListName, A(records));
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
  },
});
