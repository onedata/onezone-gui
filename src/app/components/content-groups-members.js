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
import { computed } from '@ember/object';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import _ from 'lodash';

export default Component.extend(I18n, {
  classNames: ['content-groups-members'],

  /**
   * @override
   */
  i18nPrefix: 'components.contentGroupsMembers',

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

  init() {
    this._super(...arguments);
    this.set('groupPermissionList', PromiseArray.create({
      promise: this.get('group.groupPermissionList').then((l) => l.get('list')),
    }));
    this.set('userPermissionList', PromiseArray.create({
      promise: this.get('group.userPermissionList').then((l) => l.get('list')),
    }));
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
        listProxy.get('content').every(perm =>
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
});
