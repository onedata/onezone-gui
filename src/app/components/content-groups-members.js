/**
 * A members aspect of group.
 *
 * @module components/content-groups-members
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import EmberObject, { computed } from '@ember/object';
import { union } from '@ember/object/computed';
import { A } from '@ember/array';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { groupedFlags } from 'onedata-gui-websocket-client/utils/group-privileges-flags';
import { Promise } from 'rsvp';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { inject } from '@ember/service';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import privilegesArrayToObject from 'onedata-gui-websocket-client/utils/privileges-array-to-object';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import _ from 'lodash';

export default Component.extend(I18n, GlobalActions, {
  classNames: ['content-groups-members'],

  i18n: inject(),
  store: inject(),
  globalNotify: inject(),
  navigationState: inject(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentGroupsMembers',

  /**
   * @type {Array<Object>}
   */
  groupedPrivilegesFlags: groupedFlags,

  /**
   * Set in `init` method
   * @type {DS.ManyArray}
   */
  sharedGroupList: undefined,

  /**
   * Set in `init` method
   * @type {DS.ManyArray}
   */
  sharedUserList: undefined,

  /**
   * @type {PromiseObject<string>}
   */
  invitationTokenProxy: undefined,

  /**
   * @type {PrivilegesModelProxy}
   */
  batchEditModalModel: Object.freeze({}),

  /**
   * @type {Ember.Array<PrivilegesModelProxy>}
   */
  selectedUserModelProxies: Object.freeze(A()),

  /**
   * @type {Ember.Array<PrivilegesModelProxy>}
   */
  selectedGroupModelProxies: Object.freeze(A()),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  privilegesTranslationsPath: computed('i18nPrefix', function () {
    return this.get('i18nPrefix') + '.privileges';
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  privilegeGroupsTranslationsPath: computed('i18nPrefix', function () {
    return this.get('i18nPrefix') + '.privilegeGroups';
  }),
  
  /**
   * @type {Ember.ComputedProperty<Ember.A<PrivilegesModelProxy>>}
   */
  proxyGroupModelList: computed('sharedGroupList.isFulfilled', function () {
    return this.get('sharedGroupList.isFulfilled') ?
      this.preparePermissionListProxy(this.get('sharedGroupList'), 'group') :
      A();
  }),

  /**
   * @type {Ember.ComputedProperty<Ember.A<PrivilegesModelProxy>>}
   */
  proxyUserModelList: computed('sharedUserList.isFulfilled', function () {
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
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  headerActions: computed(function () {
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
   * @type {Ember.ComputedProperty<Action>}
   */
  batchEditAction: computed('batchEditAvailable', function () {
    return {
      action: () => this.send('batchEdit'),
      title: this.t('batchEdit'),
      class: 'batch-edit',
      icon: 'rename',
      disabled: !this.get('batchEditAvailable'),
    };
  }),

  /**
   * @override 
   * @type {Ember.ComputedProperty<string>}
   */
  globalActionsTitle: computed(function () {
    return this.t('groupMembers');
  }),

  /**
   * @override 
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  globalActions: computed('headerActions', 'batchEditAction', function () {
    const {
      headerActions,
      batchEditAction,
    } = this.getProperties('headerActions', 'batchEditAction');
    return [batchEditAction, ...headerActions];
  }),

  init() {
    this._super(...arguments);
    this.set('sharedGroupList', PromiseArray.create({
      promise: this.get('group').get('sharedGroupList')
        .then(sgl => sgl.get('list')),
    }));
    this.set('sharedUserList', PromiseArray.create({
      promise: this.get('group').get('sharedUserList')
        .then(sgl => sgl.get('list')),
    }));
  },

  /**
   * Generates privilege model GRI for given subject model
   * @param {DS.Model} subjectModel
   * @param {string} type `group` or `user`
   * @returns {string}
   */
  getPrivilegesGriForModel(subjectModel, type) {
    let groupId, subjectId;
    try {
      groupId = parseGri(this.get('group.id')).entityId;
      subjectId = parseGri(subjectModel.get('id')).entityId;
    } catch (e) {
      console.error(e);
      return '';
    }
    return gri({
      entityType: 'group',
      entityId: groupId,
      aspect: type === 'user' ? 'user_privileges' : 'child_privileges',
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
    if (modelProxy.get('model')) {
      return Promise.resolve(modelProxy);
    } else {
      return store
        .findRecord('privilege', modelProxy.get('modelGri'))
        .then((privilegesModel) => {
          const privileges = privilegesArrayToObject(
            privilegesModel.get('privileges'),
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
          this.loadModelForProxy(modelProxy)
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
      const privileges = _.assign({}, ..._.values(model.get('modifiedPrivileges')));
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
    const batchModifiedPrivileges = batchEditModalModel.get('modifiedPrivileges');
    selectedModelProxies.forEach(modelProxy => {
      const {
        modifiedPrivileges,
        persistedPrivileges,
      } = modelProxy.getProperties('modifiedPrivileges', 'persistedPrivileges');
      const resultTree = {};
      let modified = false;
      Object.keys(modifiedPrivileges).forEach(groupName => {
        resultTree[groupName] = {};
        Object.keys(modifiedPrivileges[groupName]).forEach(privName => {
          const obtainedValue = batchModifiedPrivileges[groupName][privName];
          resultTree[groupName][privName] = obtainedValue === 2 ?
            modifiedPrivileges[groupName][privName] : obtainedValue;
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
   * @returns {Promise}
   */
  saveModel(modelProxy) {
    const {
      modifiedPrivileges,
      model,
    } = modelProxy.getProperties('modifiedPrivileges', 'model');
    const flattenedPrivilegesTree =
      _.assign({}, ..._.values(modifiedPrivileges));
    const privileges = Object.keys(flattenedPrivilegesTree)
      .filter(key => flattenedPrivilegesTree[key]);
    model.set('privileges', privileges);
    modelProxy.set('saving', true);
    const promise = model.get('content').save().then(() => {
      safeExec(modelProxy, () => modelProxy.setProperties({
        modified: false,
        persistedPrivileges: modifiedPrivileges,
      }));
    });
    promise.finally(() => {
      safeExec(modelProxy, () => modelProxy.set('saving', false));
    });
    return promise;
  },

  /**
   * Loads new invitation token for selected subject
   * @param {string} subject `user` or `group`
   * @returns {PromiseObject<string>}
   */
  loadInvitationToken(subject) {
    return this.set(
      'invitationTokenProxy',
      PromiseObject.create({
        promise: this.get('group').getInviteToken(subject),
      })
    );
  },

  actions: {
    modelsSelected(type, models) {
      this.set(
        type === 'user' ? 'selectedUserModelProxies' : 'selectedGroupModelProxies',
        A(models),
      );
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
        .catch(error => this.get('globalNotify')
          .backendError(this.t('privilegesPersistence'), error)
        );
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
    copyTokenSuccess() {
      this.get('globalNotify').info(this.t('copyTokenSuccess'));
    },
    copyTokenError() {
      this.get('globalNotify').info(this.t('copyTokenError'));
    },
  },
});
