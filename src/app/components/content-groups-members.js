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
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { groupedFlags } from 'onedata-gui-websocket-client/utils/group-privileges-flags';
import { inject as service } from '@ember/service';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import PrivilegesAspectBase from 'onezone-gui/mixins/privileges-aspect-base';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(I18n, GlobalActions, PrivilegesAspectBase, {
  classNames: ['privileges-aspect-base', 'content-groups-members'],

  i18n: service(),
  navigationState: service(),
  groupActionsService: service('groupActions'),
  router: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentGroupsMembers',

  /**
   * @override
   */
  groupedPrivilegesFlags: groupedFlags,

  /**
   * @override
   */
  privilegeGriAspects: Object.freeze({
    user: 'user',
    group: 'child',
  }),

  /**
   * @override
   */
  modelType: 'group',

  /**
   * @type {Group}
   */
  groupToRemove: null,

  /**
   * @type {SharedUser}
   */
  userToRemove: null,

  /**
   * @type {boolean}
   */
  isRemoving: false,

  /**
   * @override
   */
  model: reads('group'),

  /**
   * @override
   */
  privilegesTranslationsPath: computed('i18nPrefix', function () {
    return this.get('i18nPrefix') + '.privileges';
  }),

  /**
   * @override
   */
  privilegeGroupsTranslationsPath: computed('i18nPrefix', function () {
    return this.get('i18nPrefix') + '.privilegeGroups';
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
  globalActions: computed('inviteActions', 'batchEditAction', function () {
    const {
      inviteActions,
      batchEditAction,
    } = this.getProperties('inviteActions', 'batchEditAction');
    return [batchEditAction, ...inviteActions];
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  headerActions: reads('inviteActions'),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  groupActions: computed(function () {
    return [{
      action: (...args) => this.send('showRemoveModal', 'group', ...args),
      title: this.t('removeGroup'),
      class: 'remove-group',
      icon: 'close',
    }];
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  userActions: computed(function () {
    return [{
      action: (...args) => this.send('showRemoveModal', 'user', ...args),
      title: this.t('removeUser'),
      class: 'remove-user',
      icon: 'close',
    }];
  }),

  actions: {
    showRemoveModal(type, modelProxy) {
      this.set(type + 'ToRemove', get(modelProxy, 'subject'));
    },
    hideRemoveModal(type) {
      this.set(type + 'ToRemove', null);
    },
    remove(type) {
      const model = this.get(type + 'ToRemove');
      const {
        groupActionsService,
        group,
      } = this.getProperties(
        'groupActionsService',
        'group',
      );
      this.set('isRemoving', true);
      const promise = type === 'group' ?
        groupActionsService.removeChildGroup(group, model) :
        groupActionsService.removeUser(group, model);
      return promise
        .finally(() => {
          safeExec(this, 'setProperties', {
            isRemoving: false,
            [type + 'ToRemove']: null,
          });
        });
    },
  },
});
