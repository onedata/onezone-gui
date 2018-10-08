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
import { union, reads } from '@ember/object/computed';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import { reject } from 'rsvp';
import PrivilegeRecordProxy from 'onezone-gui/utils/privilege-record-proxy';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import _ from 'lodash';
import { getOwner } from '@ember/application';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';

export default Mixin.create({
  privilegeManager: service(),
  privilegeActions: service(),

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
  privilegeGriAspects: Object.freeze({
    user: 'user',
    group: 'group',
  }),

  /**
   * @type {Ember.Array<PrivilegeRecordProxy>}
   */
  selectedUserRecordProxies: Object.freeze(A()),

  /**
   * @type {Ember.Array<PrivilegeRecordProxy>}
   */
  selectedGroupRecordProxies: Object.freeze(A()),

  /**
   * @type {boolean}
   */
  batchEditActive: false,

  /**
   * @type {PrivilegeRecordProxy}
   */
  batchEditModalModel: Object.freeze({}),

  /**
   * @type {GraphSingleModel}
   */
  memberToRemove: null,

  /**
   * `group` or `user`
   * @type {string}
   */
  memberTypeToRemove: null,

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
   * @type {Ember.ComputedProperty<DS.ManyArray>}
   */
  groupList: computed('record.hasViewPrivilege', function groupList() {
    return PromiseArray.create({
      promise: this.get('record.hasViewPrivilege') !== false ?
        get(this.get('record'), 'groupList').then(sgl =>
          sgl ? get(sgl, 'list') : A()
        ) : reject({ id: 'forbidden' }),
    });
  }),

  /**
   * @type {Ember.ComputedProperty<DS.ManyArray>}
   */
  userList: computed('record.hasViewPrivilege', function userList() {
    return PromiseArray.create({
      promise: this.get('record.hasViewPrivilege') !== false ?
        get(this.get('record'), 'userList').then(sul =>
          sul ? get(sul, 'list') : A()
        ) : reject({ id: 'forbidden' }),
    });
  }),

  /**
   * @type {Ember.ComputedProperty<Ember.A<PrivilegeRecordProxy>>}
   */
  proxyGroupRecordList: computed(function proxyGroupRecordList() {
    return A();
  }),

  /**
   * @type {Ember.ComputedProperty<Ember.A<PrivilegeRecordProxy>>}
   */
  proxyUserRecordList: computed(function proxyUserRecordList() {
    return A();
  }),

  /**
   * @type {Ember.ComputedProperty<Array<PrivilegeRecordProxy>>}
   */
  selectedRecordProxies: union(
    'selectedUserRecordProxies',
    'selectedGroupRecordProxies'
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isAnySelectedRecordSaving: computed(
    'selectedRecordProxies.@each.saving',
    function isAnySelectedRecordSaving() {
      return this.get('selectedRecordProxies').filterBy('saving', true).length > 0;
    }
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  batchEditAvailable: computed(
    'selectedRecordProxies.length',
    'isAnySelectedRecordSaving',
    function batchEditAvailable() {
      return this.get('selectedRecordProxies.length') > 0 &&
        !this.get('isAnySelectedRecordSaving');
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  batchEditAction: computed('batchEditAvailable', function batchEditAction() {
    return {
      action: () => this.send('batchEdit'),
      title: this.t('multiedit'),
      class: 'batch-edit',
      icon: 'rename',
      disabled: !this.get('batchEditAvailable'),
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  groupActions: computed(function groupActions() {
    return [{
      action: (...args) => this.send('showRemoveMemberModal', 'group', ...args),
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
      action: (...args) => this.send('showRemoveMemberModal', 'user', ...args),
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
    'batchEditAction',
    function globalActions() {
      const {
        batchEditAction,
      } = this.getProperties('batchEditAction');
      return [batchEditAction];
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  headerActions: reads('inviteActions'),

  recordObserver: observer('record', function recordObserver() {
    // reset state after record change
    this.setProperties({
      visibleInvitationToken: undefined,
    });
  }),

  directMembershipObserver: observer(
    'record.directMembership',
    function directMembershipObserver() {
      if (this.get('record.directMembership') && !this.get('isJoiningAsUser')) {
        this.set('joinAsUserModalVisible', false);
      }
    }
  ),

  listsObserver: observer(
    'groupList.content.[]',
    'userList.content.[]',
    function listsObserver() {
      // reset state after lists change
      this.setProperties({
        selectedUserRecordProxies: A(),
        selectedGroupRecordProxies: A(),
        batchEditActive: false,
      });
    }
  ),

  groupListObserver: observer('groupList.[]', function groupListObserver() {
    this.preparePermissionListProxy('group');
  }),

  userListObserver: observer('userList.[]', function userListObserver() {
    this.preparePermissionListProxy('user');
  }),

  /**
   * Generates privilege record GRI for given subject record
   * @param {DS.Model} subjectRecord
   * @param {string} type `group` or `user`
   * @returns {string}
   */
  getPrivilegesGriForRecord(subjectRecord, type) {
    const modelType = this.get('modelType');
    let recordId, subjectId;
    try {
      recordId = parseGri(this.get('record.id')).entityId;
      subjectId = parseGri(get(subjectRecord, 'id')).entityId;
    } catch (error) {
      console.error(
        'mixin:members-aspect-base: getPrivilegesGriForRecord: ' +
        'error parsing GRI: ',
        error
      );
      return '';
    }
    return this.get('privilegeManager').generateGri(
      modelType,
      recordId,
      this.get(`privilegeGriAspects.${type}`),
      subjectId
    );
  },

  /**
   * Prepares list of container objects for privileges records
   * @param {string} subjectType `user` or `group`
   * @returns {Ember.A<EmberObject>}
   */
  preparePermissionListProxy(subjectType) {
    const subjectListName = `${subjectType}List`;
    const subjectList = this.get(subjectListName);
    const proxyListName = `proxy${_.upperFirst(subjectType)}RecordList`;
    const proxyList = this.get(proxyListName);
    let newProxyList;

    if (get(subjectList, 'isFulfilled')) {
      newProxyList = A(subjectList.map(subject => {
        let recordProxy = proxyList.findBy('subject', subject);
        if (!recordProxy) {
          const recordGri = this.getPrivilegesGriForRecord(subject, subjectType);
          return PrivilegeRecordProxy.create(getOwner(this).ownerInjection(), {
            groupedPrivilegesFlags: this.get('groupedPrivilegesFlags'),
            griArray: [recordGri],
            subject,
          });
        }
        return recordProxy;
      }));
    } else {
      newProxyList = A();
    }
    this.set(proxyListName, newProxyList);
  },

  /**
   * Loads all data necessary for creating batch edit model
   * @returns {PrivilegeRecordProxy}
   */
  loadBatchEditModel() {
    const selectedRecordProxies = this.get('selectedRecordProxies');
    this.set(
      'batchEditModalModel',
      PrivilegeRecordProxy.create(getOwner(this).ownerInjection(), {
        griArray: _.flatten(selectedRecordProxies.mapBy('griArray')),
        sumPrivileges: true,
        groupedPrivilegesFlags: this.get('groupedPrivilegesFlags'),
      })
    );
  },

  /**
   * Removes member. Should be implemented in component.
   * @virtual
   * @param {string} type type of member model
   * @param {GraphSingleModel} member member record
   * @return {Promise}
   */
  removeMember() {
    return notImplementedReject();
  },

  /**
   * Creates child group. Should be implemented in component.
   * @virtual
   * @param {string} name group name
   * @return {Promise}
   */
  createChildGroup() {
    return notImplementedReject();
  },

  /**
   * Adds child group. Should be implemented in component.
   * @virtual
   * @param {Group} group
   * @return {Promise}
   */
  addMemberGroup(/* group */) {
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

  actions: {
    recordsSelected(type, records) {
      const {
        proxyGroupRecordList,
        proxyUserRecordList,
      } = this.getProperties('proxyGroupRecordList', 'proxyUserRecordList');
      let originList, targetListName;
      if (type === 'user') {
        originList = proxyUserRecordList;
        targetListName = 'selectedUserRecordProxies';
      } else {
        originList = proxyGroupRecordList;
        targetListName = 'selectedGroupRecordProxies';
      }
      records = records.filter(m => originList.includes(m));
      this.set(targetListName, A(records));
    },
    batchEdit() {
      this.loadBatchEditModel();
      this.set('batchEditActive', true);
    },
    batchEditClose() {
      this.set('batchEditActive', false);
    },
    saveOne(recordProxy) {
      return this.get('privilegeActions')
        .handleSave(recordProxy.save(true))
        .then(() => recordProxy);
    },
    saveBatch() {
      const {
        privilegeActions,
        batchEditModalModel,
      } = this.getProperties('privilegeActions', 'batchEditModalModel');
      return privilegeActions.handleSave(batchEditModalModel.save())
        .finally(() => safeExec(this, () => {
          this.set('batchEditActive', false);
          this.get('selectedRecordProxies').invoke('reloadRecords');
        }));
    },
    showRemoveMemberModal(type, recordProxy) {
      this.setProperties({
        memberToRemove: get(recordProxy, 'subject'),
        memberTypeToRemove: type,
      });
    },
    removeMember() {
      this.set('isRemovingMember', true);
      return this.removeMember(
        this.get('memberTypeToRemove'),
        this.get('memberToRemove')
      ).finally(() =>
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
