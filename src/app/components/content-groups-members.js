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
import { gt, reads } from '@ember/object/computed';
import { A } from '@ember/array';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { groupedFlags } from 'onedata-gui-websocket-client/utils/group-permissions-flags';
import { Promise } from 'rsvp';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

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
  proxyGroupPermissionList: computed('groupPermissionListLoaded', function () {
    return this.get('groupPermissionListLoaded') ?
      this.preparePermissionListProxy(this.get('groupPermissionList')) :
      A();
  }),

  /**
   * @type {Ember.A<EmberObject>}
   */
  proxyUserPermissionList: computed('userPermissionListLoaded', function () {
    return this.get('userPermissionListLoaded') ?
      this.preparePermissionListProxy(this.get('userPermissionList')) :
      A();
  }),

  init() {
    this._super(...arguments);
    this.set('modifiedModels', A());
    this.loadPermissionList('groupPermissionList');
    this.loadPermissionList('userPermissionList');
  },

  /**
   * Loads selected permissions list
   * @param {string} listName `groupPermissionList` or `userPermissionList`
   * @returns {undefined}
   */
  loadPermissionList(listName) {
    this.set(listName, PromiseArray.create({
      promise: this.get('group.' + listName)
        .then((list) => list.get('list'))
        .then((list) => 
          Promise.all(list.map(perms => perms.get('subject')))
            .then(() => list)
        )
        .catch(e => safeExec(this, 'set', listName + 'LoadError', e)),
    }));
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
      overridePermissions: permission.get('permissions'),
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
