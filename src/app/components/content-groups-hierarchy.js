/**
 * A content page for group hierarchy
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { collect } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';

export default Component.extend(I18n, GlobalActions, {
  classNames: ['content-groups-hierarchy'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentGroupsHierarchy',

  /**
   * @virtual
   * @type {Group}
   */
  group: undefined,

  /**
   * @type {string}
   */
  searchString: '',

  /**
   * Reset trigger. Value of that property is meaningless - only change of that
   * value is important.
   * @type {any}
   */
  resetTrigger: undefined,

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  resetViewAction: computed(function resetViewAction() {
    return {
      action: () => this.resetView(),
      title: this.t('resetView'),
      class: 'reset-view-action',
      icon: 'update',
    };
  }),

  /**
   * @override
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  globalActions: collect('resetViewAction'),

  /**
   * @override
   * @type {Ember.ComputedProperty<string>}
   */
  globalActionsTitle: computed(function globalActionsTitle() {
    return this.t('groupsHierarchy');
  }),

  /**
   * Resets hierarchy view
   * @returns {undefined}
   */
  resetView() {
    this.set('resetTrigger', {});
  },
});
