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
import { groupedFlags } from 'onedata-gui-websocket-client/utils/group-permissions-flags';
import { Promise } from 'rsvp';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { inject } from '@ember/service';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import privilegesArrayToObject from 'onedata-gui-websocket-client/utils/privileges-array-to-object';
import _ from 'lodash';

export default Component.extend(I18n, {
  classNames: ['content-groups-members'],

  i18n: inject(),
  store: inject(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentGroupsMembers',

  /**
   * @type {Array<Object>}
   */
  groupedPermissionsFlags: groupedFlags,

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
   * Prepares list of container objects for permissions models
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
        modifiedPermissions: undefined,
        persistedPermissions: undefined,
        overridePermissions: undefined,
        modified: false,
      });
    }));
  },

  calculateBatchEditModel(models) {
    const groupedPermissionsFlags = this.get('groupedPermissionsFlags');
    const privilegesFlatTree = {};
    models.forEach(model => {
      const privileges = _.assign({}, ..._.values(model.get('modifiedPermissions')));
      Object.keys(privileges).forEach(privName => {
        if (privilegesFlatTree[privName] === undefined) {
          privilegesFlatTree[privName] = privileges[privName];
        } else if (privilegesFlatTree[privName] !== privileges[privName]) {
          privilegesFlatTree[privName] = 2;
        }
      });
    });
    return groupedPermissionsFlags.reduce((tree, group) => {
      tree[group.groupName] = group.permissions.reduce((subtree, priv) => {
        subtree[priv] = privilegesFlatTree[priv];
        return subtree;
      }, {});
      return tree;
    }, {});
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
        groupedPermissionsFlags,
      } = this.getProperties('selectedModelProxies', 'store', 'groupedPermissionsFlags');
      const modelProxy = EmberObject.create({
        modifiedPermissions: undefined,
        persistedPermissions: undefined,
        overridePermissions: undefined,
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
                    groupedPermissionsFlags
                  );
                  selectedProxy.setProperties({
                    model: PromiseObject.create({
                      promise: Promise.resolve(privilegesModel),
                    }),
                    modifiedPermissions: privileges,
                    persistedPermissions: privileges,
                    overridePermissions: privileges,
                  });
                  return selectedProxy;
                });
            }
          }))
          .then(modelProxies => safeExec(this, () => {
            const batchPrivileges = this.calculateBatchEditModel(modelProxies);
            modelProxy.setProperties({
              modifiedPermissions: batchPrivileges,
              persistedPermissions: batchPrivileges,
              overridePermissions: batchPrivileges,
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
  },
});
