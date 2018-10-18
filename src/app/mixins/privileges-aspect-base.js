/**
 * Base functionality for privileges aspects of application.
 *
 * @module mixins/privileges-aspect-base
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
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
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
   * @type {string|undefined}
   */
  visibleInvitationToken: undefined,

  /**
   * @type {PromiseObject<string>}
   */
  invitationTokenProxy: undefined,

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
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  inviteActions: computed(function inviteActions() {
    return [{
      action: () => this.send('showInvitationToken', 'group'),
      title: this.t('inviteGroup'),
      class: 'invite-group',
      icon: 'group-invite',
    }, {
      action: () => this.send('showInvitationToken', 'user'),
      title: this.t('inviteUser'),
      class: 'invite-user',
      icon: 'user-add',
    }];
  }),

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
    'inviteActions',
    'batchEditAction',
    function globalActions() {
      const {
        inviteActions,
        batchEditAction,
      } = this.getProperties('inviteActions', 'batchEditAction');
      return [batchEditAction, ...inviteActions];
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
   * Loads new invitation token for selected subject
   * @param {string} subject `user` or `group`
   * @returns {PromiseObject<string>}
   */
  loadInvitationToken(subject) {
    return this.set(
      'invitationTokenProxy',
      PromiseObject.create({
        promise: this.get('record').getInviteToken(subject),
      })
    );
  },

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
        'mixin:privileges-aspect-base: getPrivilegesGriForRecord: ' +
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
    showInvitationToken(subject) {
      this.loadInvitationToken(subject);
      this.set('visibleInvitationToken', subject);
    },
    generateInvitationToken() {
      this.loadInvitationToken(this.get('visibleInvitationToken'));
    },
    hideInvitationToken() {
      this.set('visibleInvitationToken', null);
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
  },
});
