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
import { gt, reads, filterBy, union } from '@ember/object/computed';
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

  /**
   * @override
   */
  i18nPrefix: 'components.contentGroupsMembers',

  editionEnabled: true,

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
   * Set in `init` method
   * @type {DS.ManyArray}
   */
  groupPermissionList: undefined,

  /**
   * Set in `init` method
   * @type {DS.ManyArray}
   */
  userPermissionList: undefined,

  /**
   * @type {*}
   */
  groupPermissionListLoadError: undefined,

  /**
   * @type {*>}
   */
  userPermissionListLoadError: undefined,

  /**
   * @type {Ember.A}
   */
  modifiedModels: undefined,

  /**
   * @type {Ember.ComputedProperty<number>}
   */
  hasModifiedModels: gt('modifiedModels.length', 0),

  /**
   * @type {Ember.ComputedProperty<DS.ManyArray>}
   */
  groupPermissionListLoaded: reads('groupPermissionList.isFulfilled'),

  /**
   * @type {Ember.ComputedProperty<DS.ManyArray>}
   */
  userPermissionListLoaded: reads('userPermissionList.isFulfilled'),

  /**
   * @type {Ember.A<EmberObject>}
   */
  proxySharedGroupList: computed('sharedGroupList.isFulfilled', function () {
    return this.get('sharedGroupList.isFulfilled') ?
      this.preparePermissionListProxy(this.get('sharedGroupList'), 'group') :
      A();
  }),

  /**
   * @type {Ember.A<EmberObject>}
   */
  proxySharedUserList: computed('sharedUserList.isFulfilled', function () {
    return this.get('sharedUserList.isFulfilled') ?
      this.preparePermissionListProxy(this.get('sharedUserList'), 'user') :
      A();
  }),

  modelProxies: union('proxySharedGroupList', 'proxySharedUserList'),

  modifiedModelProxies: filterBy('modelProxies', 'modified', true),

  selectedSharedUserProxies: Object.freeze(A()),

  selectedSharedGroupProxies: Object.freeze(A()),

  selectedModelProxies: union('selectedSharedUserProxies', 'selectedSharedGroupProxies'),

  batchEditModalModel: Object.freeze({}),

  headerActions: computed(function () {
    return [{
      action: () => this.send('inviteGroup'),
      title: this.t('inviteGroup'),
      class: 'invite-group',
      icon: 'remove',
    }, {
      action: () => this.send('inviteUser'),
      title: this.t('inviteUser'),
      class: 'invite-user',
      icon: 'remove',
    }];
  }),

  batchEditAvailable: gt('selectedModelProxies.length', 0),

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
   * @type {Ember.ComputedProperty<string>}
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
    this.set('modifiedModels', A());
    this.set('sharedGroupList', PromiseArray.create({
      promise: this.get('group').get('sharedGroupList').then(sgl => sgl.get('list')),
    }));
    this.set('sharedUserList', PromiseArray.create({
      promise: this.get('group').get('sharedUserList').then(sgl => sgl.get('list')),
    }));
  },

  /**
   * Prepares list of container objects for privileges models
   * @param {DS.ManyArray} list
   * @param {string} subjectType `user` or `group`
   * @returns {Ember.A<EmberObject>}
   */
  preparePermissionListProxy(list, subjectType) {
    const group = this.get('group');
    let groupId;
    try {
      groupId = parseGri(group.get('id')).entityId;
    } catch (e) {
      console.error(e);
      return A();
    }
    return A(list.map(subject => {
      let subjectId;
      try {
        subjectId = parseGri(subject.get('id')).entityId;
      } catch (e) {
        console.error(e);
      }
      const modelGri = gri({
        entityType: 'group',
        entityId: groupId,
        aspect: subjectType === 'user' ? 'user_privileges' : 'child_privileges',
        aspectId: subjectId,
      });
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

  calculateBatchEditModel(models) {
    const groupedPrivilegesFlags = this.get('groupedPrivilegesFlags');
    const privilegesFlatTree = {};
    models.forEach(model => {
      const privileges = _.assign({}, ..._.values(model.get('modifiedPrivileges')));
      Object.keys(privileges).forEach(privName => {
        if (privilegesFlatTree[privName] === undefined) {
          privilegesFlatTree[privName] = privileges[privName];
        } else if (privilegesFlatTree[privName] !== privileges[privName]) {
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
  },

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

  actions: {
    modelsSelected(type, models) {
      this.set(
        type === 'user' ? 'selectedSharedUserProxies' : 'selectedSharedGroupProxies',
        A(models),
      );
    },
    batchEdit() {
      const {
        selectedModelProxies,
        store,
        groupedPrivilegesFlags,
      } = this.getProperties('selectedModelProxies', 'store', 'groupedPrivilegesFlags');
      const modelProxy = EmberObject.create({
        modifiedPrivileges: undefined,
        persistedPrivileges: undefined,
        overridePrivileges: undefined,
        modified: false,
      });
      modelProxy.set('model', PromiseObject.create({
        promise: Promise.all(selectedModelProxies.map(selectedProxy => {
            if (selectedProxy.get('model')) {
              return selectedProxy;
            } else {
              return store
                .findRecord('privilege', selectedProxy.get('modelGri'))
                .then((privilegesModel) => {
                  const privileges = privilegesArrayToObject(
                    privilegesModel.get('privileges'),
                    groupedPrivilegesFlags
                  );
                  selectedProxy.setProperties({
                    model: PromiseObject.create({
                      promise: Promise.resolve(privilegesModel),
                    }),
                    modifiedPrivileges: privileges,
                    persistedPrivileges: privileges,
                    overridePrivileges: privileges,
                  });
                  return selectedProxy;
                });
            }
          }))
          .then(modelProxies => safeExec(this, () => {
            const batchPrivileges = this.calculateBatchEditModel(modelProxies);
            modelProxy.setProperties({
              modifiedPrivileges: batchPrivileges,
              persistedPrivileges: batchPrivileges,
              overridePrivileges: batchPrivileges,
            });
          })),
      }));
      this.setProperties({
        batchEditModalModel: modelProxy,
        batchEditActive: true,
      });
    },
    batchEditClose() {
      this.set('batchEditActive', false);
    },
    saveOne(modelProxy) {
      return this.saveModel(modelProxy)
        .catch(error => this.get('globalNotify')
          .backendError(this.t('privilegesPersistence'), error)
        );
    },
    saveBatch() {
      this.batchEditApply();
      const selectedModelProxies = this.get('selectedModelProxies');
      const savePromises = selectedModelProxies.map(
        modelProxy => this.saveModel(modelProxy)
      );
      return Promise.all(savePromises)
        .catch((error) => {
          this.get('globalNotify')
            .backendError(this.t('privilegesPersistence'), error);
        })
        .finally(() => safeExec(this, 'set', 'batchEditActive', false));
    },
    reset(modelProxy) {
      if (modelProxy.get('modified')) {
        const persistedPrivileges = modelProxy.get('persistedPrivileges');
        modelProxy.setProperties({
          modifiedPrivileges: persistedPrivileges,
          overridePrivileges: _.assign({}, persistedPrivileges),
          modified: false,
        });
      }
    },
  },
});
