/**
 * Shows modal asking for new relative group name.
 *
 * @module components/group-create-relative-modal
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer, get } from '@ember/object';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import _ from 'lodash';

export default Component.extend(I18n, {
  tagName: '',

  groupManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.groupAddYourGroupModal',

  /**
   * If true, modal is opened
   * @type {boolean}
   * @virtual
   */
  opened: false,

  /**
   * If true, modal cannot be closed and proceed button has active spinner
   * @type {boolean}
   * @virtual
   */
  processing: false,

  /**
   * Action called to close modal
   * @type {function}
   * @virtual
   * @returns {*}
   */
  close: notImplementedThrow,

  /**
   * Action called to proceed
   * @type {function}
   * @virtual
   * @returns {*}
   */
  proceed: notImplementedThrow,

  /**
   * Group to which another group will be added
   * @type {Group}
   * @virtual
   */
  relatedGroup: undefined,

  /**
   * Selected group will be with `group` in relation specified by this field.
   * One of `child`, `parent`.
   * @type {string}
   * @virtual
   */
  relation: 'child',

  /**
   * @type {PromiseArray<Group>}
   */
  availableGroups: undefined,

  /**
   * Selected group
   * @type {Group}
   */
  selectedGroup: null,

  /**
   * @type {Ember.ComputedProperty<Array<Group>>}
   */
  groupsForDropdown: computed(
    'availableGroups.content.[]',
    'relatedGroup',
    function groupsForDropdown() {
      const {
        availableGroups,
        relatedGroup,
      } = this.getProperties('availableGroups', 'relatedGroup');
      if (get(availableGroups, 'isFulfilled')) {
        return get(availableGroups, 'content')
          .filter(group => group !== relatedGroup)
          .sort((g1, g2) =>
            get(g1, 'name').localeCompare(get(g2, 'name'))
          );
      } else {
        return [];
      }
    }
  ),

  /**
   * If true, proceed button is disabled
   * @type {Ember.ComputedProperty<boolean<}
   */
  proceedDisabled: computed(
    'processing',
    'selectedGroup',
    function proceedDisabled() {
      const {
        processing,
        selectedGroup,
      } = this.getProperties('processing', 'selectedGroup');
      return processing || !selectedGroup;
    }
  ),

  openedObserver: observer('opened', function openedObserver() {
    this.set('selectedGroup', null);
    this.loadGroups();
  }),

  /**
   * Loads groups for dropdown
   * @returns {undefined}
   */
  loadGroups() {
    this.set('availableGroups', PromiseArray.create({
      promise: this.get('groupManager').getGroups()
        .then(groupList => get(groupList, 'list')),
    }));
  },

  actions: {
    add() {
      return this.get('proceed')(this.get('selectedGroup'));
    },
    groupMatcher(provider, term) {
      return _.includes(get(provider, 'name'), term) ? 1 : -1;
    },
  },
});
