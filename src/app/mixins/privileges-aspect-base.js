/**
 * Base functionality for privileges aspects of application.
 *
 * @module mixins/privileges-aspect-base
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import EmberObject, { computed, get, getProperties, observer } from '@ember/object';
import { union } from '@ember/object/computed';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { Promise } from 'rsvp';
import privilegesArrayToObject from 'onedata-gui-websocket-client/utils/privileges-array-to-object';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import _ from 'lodash';

export default Mixin.create({
  store: service(),
  globalNotify: service(),

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
    user: 'user_privileges',
    group: 'group_privileges',
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
   * @type {Ember.Array<PrivilegesModelProxy>}
   */
  selectedUserModelProxies: Object.freeze(A()),

  /**
   * @type {Ember.Array<PrivilegesModelProxy>}
   */
  selectedGroupModelProxies: Object.freeze(A()),

  /**
   * @type {boolean}
   */
  batchEditActive: false,

  /**
   * @type {PrivilegesModelProxy}
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
  sharedGroupList: computed('model', function () {
    return PromiseArray.create({
      promise: get(this.get('model'), 'sharedGroupList')
        .then(sgl => get(sgl, 'list')),
    });
  }),

  /**
   * @type {Ember.ComputedProperty<DS.ManyArray>}
   */
  sharedUserList: computed('model', function () {
    return PromiseArray.create({
      promise: get(this.get('model'), 'sharedUserList')
        .then(sgl => get(sgl, 'list')),
    });
  }),

  /**
   * @type {Ember.ComputedProperty<Ember.A<PrivilegesModelProxy>>}
   */
  proxyGroupModelList: computed('sharedGroupList.content.[]', function () {
    return this.get('sharedGroupList.isFulfilled') ?
      this.preparePermissionListProxy(this.get('sharedGroupList'), 'group') :
      A();
  }),

  /**
   * @type {Ember.ComputedProperty<Ember.A<PrivilegesModelProxy>>}
   */
  proxyUserModelList: computed('sharedUserList.content.[]', function () {
    return this.get('sharedUserList.isFulfilled') ?
      this.preparePermissionListProxy(this.get('sharedUserList'), 'user') :
      A();
  }),

  /**
   * @type {Ember.ComputedProperty<Array<PrivilegesModelProxy>>}
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
    'sharedGroupList.content.[]',
    'sharedUserList.content.[]',
    function () {
      // reset state after lists change
      this.setProperties({
        selectedUserModelProxies: A(),
        selectedGroupModelProxies: A(),
        batchEditActive: false,
        batchEditModalModel: {},
      });
    }
  ),

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
        'component:content-group-members: getPrivilegesGriForModel: ' +
        'error parsing GRI: ',
        error
      );
      return '';
    }
    return gri({
      entityType: modelType,
      entityId: modelId,
      aspect: this.get(`privilegeGriAspects.${type}`),
      aspectId: subjectId,
    });
  },

  /**
   * Prepares list of container objects for privileges models
   * @param {DS.ManyArray} subjectList List of subject models
   * @param {string} subjectType `user` or `group`
   * @returns {Ember.A<EmberObject>}
   */
  preparePermissionListProxy(subjectList, subjectType) {
    return A(subjectList.map(subject => {
      const modelGri = this.getPrivilegesGriForModel(subject, subjectType);
      return EmberObject.create({
        subject,
        modelGri,
        model: undefined,
        modifiedPrivileges: undefined,
        persistedPrivileges: undefined,
        overridePrivileges: undefined,
        modified: false,
        saving: false,
      });
    }));
  },

  /**
   * Loads (if necessary) model for given modelProxy
   * @param {PrivilegesModelProxy} modelProxy 
   * @returns {Promise<PrivilegesModelProxy>}
   */
  loadModelForProxy(modelProxy) {
    const {
      store,
      groupedPrivilegesFlags,
    } = this.getProperties('store', 'groupedPrivilegesFlags');
    if (get(modelProxy, 'model')) {
      return Promise.resolve(modelProxy);
    } else {
      return store
        .findRecord('privilege', get(modelProxy, 'modelGri'))
        .then((privilegesModel) => {
          const privileges = privilegesArrayToObject(
            get(privilegesModel, 'privileges'),
            groupedPrivilegesFlags
          );
          modelProxy.setProperties({
            model: PromiseObject.create({
              promise: Promise.resolve(privilegesModel),
            }),
            modifiedPrivileges: privileges,
            persistedPrivileges: privileges,
            overridePrivileges: privileges,
          });
          return modelProxy;
        });
    }
  },

  /**
   * Loads all data necessary for creating batch edit model
   * @returns {PrivilegesModelProxy}
   */
  loadBatchEditModel() {
    const selectedModelProxies = this.get('selectedModelProxies');
    const modelProxy = EmberObject.create({
      modifiedPrivileges: undefined,
      persistedPrivileges: undefined,
      overridePrivileges: undefined,
      modified: false,
    });
    modelProxy.set('model', PromiseObject.create({
      promise: Promise.all(selectedModelProxies.map(modelProxy =>
          this.loadModelForProxy(modelProxy).then(mp => {
            const model = get(mp, 'model');
            if (get(model, 'isRejected')) {
              throw get(model, 'reason');
            }
            return mp;
          })
        ))
        .then(modelProxies => safeExec(this, () => {
          const batchPrivileges = this.calculateBatchEditModel(modelProxies);
          modelProxy.setProperties({
            modifiedPrivileges: batchPrivileges,
            persistedPrivileges: batchPrivileges,
            overridePrivileges: batchPrivileges,
          });
        })),
    }));
    this.set('batchEditModalModel', modelProxy);
    return modelProxy;
  },

  /**
   * Calculates model for batch edition tree. It merges all permissions from
   * given models creating a new tree.
   * @param {Ember.Array<PrivilegesModelProxy>} modelProxies model proxies
   * @returns {Object}
   */
  calculateBatchEditModel(modelProxies) {
    const groupedPrivilegesFlags = this.get('groupedPrivilegesFlags');
    const privilegesFlatTree = {};
    modelProxies.forEach(model => {
      const privileges = _.assign({}, ..._.values(get(model, 'modifiedPrivileges')));
      Object.keys(privileges).forEach(privName => {
        if (privilegesFlatTree[privName] === undefined) {
          privilegesFlatTree[privName] = privileges[privName];
        } else if (privilegesFlatTree[privName] !== privileges[privName]) {
          // toggle middle state
          privilegesFlatTree[privName] = 2;
        }
      });
    });
    return groupedPrivilegesFlags.reduce((tree, group) => {
      tree[group.groupName] = group.privileges.reduce((subtree, priv) => {
        subtree[priv] = privilegesFlatTree[priv];
        return subtree;
      }, {});
      return tree;
    }, {});
  },

  /**
   * Gets all changes from batch edit values tree and applies them
   * to all selected models.
   * @returns {Ember.Array<PrivilegesModelProxy>}
   */
  batchEditApply() {
    const {
      selectedModelProxies,
      batchEditModalModel,
    } = this.getProperties('selectedModelProxies', 'batchEditModalModel');
    const batchModifiedPrivileges = get(batchEditModalModel, 'modifiedPrivileges');
    selectedModelProxies.forEach(modelProxy => {
      const {
        modifiedPrivileges,
        persistedPrivileges,
      } = modelProxy.getProperties('modifiedPrivileges', 'persistedPrivileges');
      const resultTree = {};
      let modified = false;
      Object.keys(modifiedPrivileges || {}).forEach(groupName => {
        resultTree[groupName] = {};
        Object.keys(modifiedPrivileges[groupName]).forEach(privName => {
          const obtainedValue = batchModifiedPrivileges[groupName][privName];
          resultTree[groupName][privName] = (obtainedValue === 2 ?
            modifiedPrivileges[groupName][privName] : obtainedValue
          );
          modified = modified ||
            resultTree[groupName][privName] !==
            persistedPrivileges[groupName][privName];
        });
      });
      modelProxy.setProperties({
        modifiedPrivileges: resultTree,
        overridePrivileges: resultTree,
        modified,
      });
    });
    return selectedModelProxies;
  },

  /**
   * Saves model (taken from model proxy)
   * @param {EmberObject} modelProxy
   * @returns {Promise<ModelProxy>}
   */
  saveModel(modelProxy) {
    const {
      modifiedPrivileges,
      model,
    } = getProperties(modelProxy, 'modifiedPrivileges', 'model');
    const flattenedPrivilegesTree =
      _.assign({}, ..._.values(modifiedPrivileges));
    const privileges = Object.keys(flattenedPrivilegesTree)
      .filter(key => flattenedPrivilegesTree[key]);
    model.set('privileges', privileges);
    modelProxy.set('saving', true);
    const promise = get(model, 'content').save().then(() => {
      safeExec(modelProxy, () => modelProxy.setProperties({
        modified: false,
        persistedPrivileges: modifiedPrivileges,
      }));
      return modelProxy;
    }).finally(() => {
      safeExec(modelProxy, () => modelProxy.set('saving', false));
    });
    return promise;
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
      return this.saveModel(modelProxy)
        .then(() => this.get('globalNotify').info(this.t('privilegesSaveSuccess')))
        .catch(error => {
          this.get('globalNotify')
            .backendError(this.t('privilegesPersistence'), error);
          throw error;
        });
    },
    saveBatch() {
      this.batchEditApply();
      const savePromises = this.get('selectedModelProxies').map(
        modelProxy => this.saveModel(modelProxy)
      );
      return Promise.all(savePromises)
        .then(() => this.get('globalNotify').info(this.t('privilegesSaveSuccess')))
        .catch((error) => {
          this.get('globalNotify')
            .backendError(this.t('privilegesPersistence'), error);
          throw error;
        })
        .finally(() => safeExec(this, 'set', 'batchEditActive', false));
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
