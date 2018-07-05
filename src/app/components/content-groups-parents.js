/**
 * A parents aspect of a group.
 *
 * @module components/content-groups-parents
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, get } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { A } from '@ember/array';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';

export default Component.extend(I18n, GlobalActions, {
  classNames: ['content-groups-parents'],

  i18n: service(),
  groupActions: service(),
  navigationState: service(),
  guiUtils: service(),
  router: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentGroupsParents',

  /**
   * @type {Group}
   * @virtual
   */
  group: undefined,

  /**
   * @type {string}
   */
  searchString: '',

  /**
   * @type {Group}
   */
  parentToLeave: undefined,

  /**
   * @type {Ember.ComputedProperty<DS.ManyArray>}
   */
  parentListProxy: computed('group', function () {
    return PromiseArray.create({
      promise: get(this.get('group'), 'parentList')
        .then(pl => pl ? get(pl, 'list') : A()),
    });
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  itemActions: computed(function () {
    return [{
      action: (parent) => this.send('showLeaveParentModal', parent),
      title: this.t('leaveParent'),
      class: 'leave-parent',
      icon: 'group-leave-group',
    }];
  }),

  /**
   * @override 
   * @type {Ember.ComputedProperty<string>}
   */
  globalActionsTitle: computed(function () {
    return this.t('groupParents');
  }),

  /**
   * @override 
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  globalActions: computed(function () {
    const {
      router,
      guiUtils,
      group,
    } = this.getProperties('router', 'guiUtils', 'group');
    return [{
      action: () => router.transitionTo(
        'onedata.sidebar.content.aspect',
        guiUtils.getRoutableIdFor(group),
        'join-as-subgroup'
      ),
      title: this.t('joinAsSubgroup'),
      class: 'join-as-subgroup-action',
      icon: 'join-space',
    }];
  }),

  actions: {
    showLeaveParentModal(parent) {
      this.set('parentToLeave', parent);
    },
    closeLeaveParentModal() {
      this.set('parentToLeave', null);
    },
    leaveParent() {
      const {
        groupActions,
        parentToLeave,
        group,
      } = this.getProperties('groupActions', 'parentToLeave', 'group');
      this.set('isLeaving', true);
      return groupActions.leaveParentGroup(parentToLeave, group)
        .finally(() => {
          safeExec(this, 'setProperties', {
            isLeaving: false,
            parentToLeave: null,
          });
        });
    },
  },
});
