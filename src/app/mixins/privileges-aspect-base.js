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
import { union } from '@ember/object/computed';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import { reject } from 'rsvp';
import PrivilegeModelProxy from 'onezone-gui/utils/privilege-model-proxy';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import _ from 'lodash';
import { getOwner } from '@ember/application';

export default Mixin.create({
  privilegeManager: service(),
  privilegeActions: service(),

  /**
   * @type {DS.Model}
   * @virtual
   */
  model: undefined,

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
   * @type {string}
   * @virtual
   */
  privilegesTranslationsPath: undefined,

  /**
   * @type {string}
   * @virtual
   */
  privilegeGroupsTranslationsPath: undefined,

  /**
   * @type {Ember.Array<PrivilegeModelProxy>}
   */
  selectedUserModelProxies: Object.freeze(A()),

  /**
   * @type {Ember.Array<PrivilegeModelProxy>}
   */
  selectedGroupModelProxies: Object.freeze(A()),

  /**
   * @type {boolean}
   */
  batchEditActive: false,

  /**
   * @type {PrivilegeModelProxy}
   */
  batchEditModalModel: Object.freeze({}),

  /**
   * @type {Array<Action>}
   */
  userActions: undefined,

  /**
   * @type {Array<Action>}
   */
  groupActions: undefined,

  /**
   * @type {Ember.ComputedProperty<DS.ManyArray>}
   */
  groupList: computed('model.hasViewPrivilege', function () {
    return PromiseArray.create({
      promise: this.get('model.hasViewPrivilege') !== false ?
        get(this.get('model'), 'groupList').then(sgl =>
          sgl ? get(sgl, 'list') : A()
        ) : reject({ id: 'forbidden' }),
    });
  }),

  /**
   * @type {Ember.ComputedProperty<DS.ManyArray>}
   */
  userList: computed('model.hasViewPrivilege', function () {
    return PromiseArray.create({
      promise: this.get('model.hasViewPrivilege') !== false ?
        get(this.get('model'), 'userList').then(sul =>
          sul ? get(sul, 'list') : A()
        ) : reject({ id: 'forbidden' }),
    });
  }),

  /**
   * @type {Ember.ComputedProperty<Ember.A<PrivilegeModelProxy>>}
   */
  proxyGroupModelList: computed(function proxyGroupModelList() {
    return A();
  }),

  /**
   * @type {Ember.ComputedProperty<Ember.A<PrivilegeModelProxy>>}
   */
  proxyUserModelList: computed(function proxyUserModelList() {
    return A();
  }),

  /**
   * @type {Ember.ComputedProperty<Array<PrivilegeModelProxy>>}
   */
  selectedModelProxies: union(
    'selectedUserModelProxies',
    'selectedGroupModelProxies'
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isAnySelectedModelSaving: computed(
    'selectedModelProxies.@each.saving',
    function () {
      return this.get('selectedModelProxies').filterBy('saving', true).length > 0;
    }
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  batchEditAvailable: computed(
    'selectedModelProxies.length',
    'isAnySelectedModelSaving',
    function () {
      return this.get('selectedModelProxies.length') > 0 &&
        !this.get('isAnySelectedModelSaving');
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  inviteActions: computed(function () {
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
  batchEditAction: computed('batchEditAvailable', function () {
    return {
      action: () => this.send('batchEdit'),
      title: this.t('multiedit'),
      class: 'batch-edit',
      icon: 'rename',
      disabled: !this.get('batchEditAvailable'),
    };
  }),

  modelObserver: observer('model', function () {
    // reset state after model change
    this.setProperties({
      visibleInvitationToken: undefined,
    });
  }),

  listsObserver: observer(
    'groupList.content.[]',
    'userList.content.[]',
    function () {
      // reset state after lists change
      this.setProperties({
        selectedUserModelProxies: A(),
        selectedGroupModelProxies: A(),
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
        promise: this.get('model').getInviteToken(subject),
      })
    );
  },

  /**
   * Generates privilege model GRI for given subject model
   * @param {DS.Model} subjectModel
   * @param {string} type `group` or `user`
   * @returns {string}
   */
  getPrivilegesGriForModel(subjectModel, type) {
    const modelType = this.get('modelType');
    let modelId, subjectId;
    try {
      modelId = parseGri(this.get('model.id')).entityId;
      subjectId = parseGri(get(subjectModel, 'id')).entityId;
    } catch (error) {
      console.error(
        'mixin:privileges-aspect-base: getPrivilegesGriForModel: ' +
        'error parsing GRI: ',
        error
      );
      return '';
    }
    return this.get('privilegeManager').generateGri(
      modelType,
      modelId,
      this.get(`privilegeGriAspects.${type}`),
      subjectId
    );
  },

  /**
   * Prepares list of container objects for privileges models
   * @param {string} subjectType `user` or `group`
   * @returns {Ember.A<EmberObject>}
   */
  preparePermissionListProxy(subjectType) {
    const subjectListName = `${subjectType}List`;
    const subjectList = this.get(subjectListName);
    const proxyListName = `proxy${_.upperFirst(subjectType)}ModelList`;
    const proxyList = this.get(proxyListName);
    let newProxyList;

    if (get(subjectList, 'isFulfilled')) {
      newProxyList = A(subjectList.map(subject => {
        let modelProxy = proxyList.findBy('subject', subject);
        if (!modelProxy) {
          const modelGri = this.getPrivilegesGriForModel(subject, subjectType);
          return PrivilegeModelProxy.create(getOwner(this).ownerInjection(), {
            groupedPrivilegesFlags: this.get('groupedPrivilegesFlags'),
            griArray: [modelGri],
            subject,
          });
        }
        return modelProxy;
      }));
    } else {
      newProxyList = A();
    }
    this.set(proxyListName, newProxyList);
  },

  /**
   * Loads all data necessary for creating batch edit model
   * @returns {PrivilegeModelProxy}
   */
  loadBatchEditModel() {
    const selectedModelProxies = this.get('selectedModelProxies');
    this.set(
      'batchEditModalModel',
      PrivilegeModelProxy.create(getOwner(this).ownerInjection(), {
        griArray: _.flatten(selectedModelProxies.mapBy('griArray')),
        sumPrivileges: true,
        groupedPrivilegesFlags: this.get('groupedPrivilegesFlags'),
      })
    );
  },

  actions: {
    modelsSelected(type, models) {
      const {
        proxyGroupModelList,
        proxyUserModelList,
      } = this.getProperties('proxyGroupModelList', 'proxyUserModelList');
      let originList, targetListName;
      if (type === 'user') {
        originList = proxyUserModelList;
        targetListName = 'selectedUserModelProxies';
      } else {
        originList = proxyGroupModelList;
        targetListName = 'selectedGroupModelProxies';
      }
      models = models.filter(m => originList.includes(m));
      this.set(targetListName, A(models));
    },
    batchEdit() {
      this.loadBatchEditModel();
      this.set('batchEditActive', true);
    },
    batchEditClose() {
      this.set('batchEditActive', false);
    },
    saveOne(modelProxy) {
      return this.get('privilegeActions').handleSave(modelProxy.save(true));
    },
    saveBatch() {
      const {
        privilegeActions,
        batchEditModalModel,
      } = this.getProperties('privilegeActions', 'batchEditModalModel');
      return privilegeActions.handleSave(batchEditModalModel.save())
        .finally(() => safeExec(this, () => {
          this.setProperties({
            batchEditActive: false,
          });
          this.get('selectedModelProxies').invoke('reloadModels');
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
  },
});
