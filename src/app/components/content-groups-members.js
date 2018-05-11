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
import EmberObject, { computed, observer, get } from '@ember/object';
import { gt } from '@ember/object/computed';
import { A } from '@ember/array';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import _ from 'lodash';
import { groupedFlags } from 'onedata-gui-websocket-client/utils/group-permissions-flags';
import { Promise } from 'rsvp';

export default Component.extend(I18n, {
  classNames: ['content-groups-members'],

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
  groupPermissionList: undefined,

  /**
   * Set in `init` method
   * @type {DS.ManyArray}
   */
  userPermissionList: undefined,

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
  groupPermissionListLoaded: computed(
    'groupPermissionList.{isFulfilled,@each.isLoaded,@each.sharedGroupLoaded}',
    function () {
      return this.isPermissionListLoaded(this.get('groupPermissionList'), 'group');
    }
  ),

  /**
   * @type {Ember.ComputedProperty<DS.ManyArray>}
   */
  userPermissionListLoaded: computed(
    'userPermissionList.{isFulfilled,@each.isLoaded,@each.sharedUserLoaded}',
    function () {
      return this.isPermissionListLoaded(this.get('userPermissionList'), 'user');
    }
  ),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  groupPermissionListLoadError: computed(
    'groupPermissionList.{reason,@each.sharedGroupLoadError}',
    function () {
      return this.getPermissionListLoadError(
        this.get('groupPermissionList'),
        'group'
      );
    }
  ),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  userPermissionListLoadError: computed(
    'userPermissionList.{reason,@each.sharedUserLoadError}',
    function () {
      return this.getPermissionListLoadError(
        this.get('userPermissionList'),
        'user'
      );
    }
  ),

  permissionsLoadObserver: observer(
    'groupPermissionListLoaded',
    'userPermissionListLoaded',
    function () {
      const {
        groupPermissionListLoaded,
        userPermissionListLoaded,
        proxyGroupPermissionList,
        proxyUserPermissionList,
        groupPermissionList,
        userPermissionList,
      } = this.getProperties(
        'groupPermissionListLoaded',
        'userPermissionListLoaded',
        'proxyGroupPermissionList',
        'proxyUserPermissionList',
        'groupPermissionList',
        'userPermissionList',
      );
      if (groupPermissionListLoaded && !get(proxyGroupPermissionList, 'length')) {
        this.set(
          'proxyGroupPermissionList',
          this.preparePermissionListProxy(groupPermissionList)
        );
      }
      if (userPermissionListLoaded && !get(proxyUserPermissionList, 'length')) {
        this.set(
          'proxyUserPermissionList',
          this.preparePermissionListProxy(userPermissionList)
        );
      }
    }
  ),

  /**
   * @type {Ember.A<EmberObject>}
   */
  proxyGroupPermissionList: Object.freeze(A()),

  /**
   * @type {Ember.A<EmberObject>}
   */
  proxyUserPermissionList: Object.freeze(A()),

  init() {
    this._super(...arguments);
    this.set('modifiedModels', A());
    this.set('groupPermissionList', PromiseArray.create({
      promise: this.get('group.groupPermissionList')
        .then((list) => list.get('list'))
        .then((list) => 
          Promise.all(list.map(perms => perms.get('sharedGroup')))
            .then(() => list)
        ),
    }));
    this.set('userPermissionList', PromiseArray.create({
      promise: this.get('group.userPermissionList')
        .then((l) => l.get('list'))
        .then((list) => 
          Promise.all(list.map(perms => perms.get('sharedUser')))
            .then(() => list)
        ),
    }));
    this.permissionsLoadObserver();
  },

  /**
   * Returns true if all permissions data is loaded and ready for passed list
   * @param {PromiseArray<DS.ManyArray>} listProxy 
   * @param {string} type user or group
   * @return {boolean}
   */
  isPermissionListLoaded(listProxy, type) {
    if (!listProxy) {
      return false;
    } else {
      return listProxy.get('isFulfilled') &&
        listProxy.every(perm =>
            perm.get('isLoaded') && perm.get(`shared${_.upperFirst(type)}Loaded`)
        );
    }
  },

  /**
   * Returns load error for given permission list if occurred, falsy value
   * otherwise.
   * @param {PromiseArray<DS.ManyArray>} listProxy 
   * @param {string} type user or group
   * @return {boolean}
   */
  getPermissionListLoadError(listProxy, type) {
    if (!listProxy) {
      return '';
    } else {
      return listProxy.get('reason') || listProxy.reduce(
        (err, perm) => err || perm.get(`shared${_.upperFirst(type)}LoadError`)
      );
    }
  },

  /**
   * Prepares list of container objects for permissions models
   * @param {DS.ManyArray} list
   * @returns {Ember.A<EmberObject>}
   */
  preparePermissionListProxy(list) {
    return A(list.map(permission => EmberObject.create({
      id: permission.get('id'),
      model: permission,
      persistedPermissions: permission.get('permissions'),
      modified: false,
    })));
  },

  actions: {
    permissionsModified(modelProxy, permissions) {
      const modifiedModels = this.get('modifiedModels');
      modelProxy.set('model.permissions', permissions);
      if (modelProxy.get('persistedPermissions') === permissions) {
        modifiedModels.removeObject(modelProxy);
        modelProxy.set('modified', false);
      } else {
        modifiedModels.addObject(modelProxy);
        modelProxy.set('modified', true);
      }
    },
  },
});
