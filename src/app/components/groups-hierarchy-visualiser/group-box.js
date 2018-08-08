/**
 * Draws block representation of a group in groups hierarchy visualiser.
 *
 * @module components/groups-hierarchy-visualiser/group-box
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, getProperties } from '@ember/object';
import { reads, or } from '@ember/object/computed';
import { htmlSafe } from '@ember/string';
import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';

export default Component.extend(I18n, {
  classNames: ['group-box'],
  classNameBindings: [
    'isBoxActive:active',
    'isFilteredOut:filtered-out',
    'actionsOpened',
    'hovered',
  ],
  attributeBindings: ['style'],

  /**
   * @override
   */
  i18nPrefix: 'components.groupsHierarchyVisualiser.groupBox',

  /**
   * Group box definition
   * @type {Utils/GroupHierarchyVisualiser/GroupBox}
   * @virtual
   */
  groupBox: undefined,

  /**
   * True if parents relation is expanded
   * @type {boolean}
   */
  parentsRelationActive: undefined,

  /**
   * True if children relation is expanded
   * @type {boolean}
   */
  childrenRelationActive: undefined,

  /**
   * True if actions popover is opened
   * @type {boolean}
   */
  actionsOpened: false,

  /**
   * True if group name is being edited now
   * @type {boolean}
   */
  isRenaming: false,

  /**
   * Shows parents for this group
   * @type {Function}
   * @virtual
   * @returns {undefined}
   */
  showParents: notImplementedThrow,

  /**
   * Shows children for this group
   * @type {Function}
   * @virtual
   * @returns {undefined}
   */
  showChildren: notImplementedThrow,

  /**
   * Redirects to group page
   * @type {Function}
   * @virtual
   * @returns {undefined}
   */
  viewGroup: notImplementedThrow,

  /**
   * Renames group
   * @type {Function}
   * @virtual
   * @param {string} name
   * @returns {Promise}
   */
  renameGroup: notImplementedThrow,

  /**
   * Triggers creating relative group (adds as `relationType`)
   * @type {Function}
   * @virtual
   * @param {string} relationType `child` or `parent`
   * @returns {undefined}
   */
  createRelativeGroup: notImplementedThrow,

  /**
   * Triggers adding existing group (adds as `relationType`)
   * @type {Function}
   * @virtual
   * @param {string} relationType `child` or `parent`
   * @returns {undefined}
   */
  addYourGroup: notImplementedThrow,

  /**
   * Triggers generating group invitation token
   * @type {Function}
   * @virtual
   * @returns {undefined}
   */
  inviteUsingToken: notImplementedThrow,

  /**
   * Triggers joining to group using token
   * @type {Function}
   * @virtual
   * @returns {undefined}
   */
  joinUsingToken: notImplementedThrow,

  /**
   * Triggers leaving group (as user)
   * @type {Function}
   * @virtual
   * @returns {undefined}
   */
  leaveGroup: notImplementedThrow,

  /**
   * Triggers group removing
   * @type {Function}
   * @virtual
   * @returns {undefined}
   */
  removeGroup: notImplementedThrow,

  /**
   * Shows privileges editor
   * @type {Function}
   * @virtual
   * @param {Utils/GroupHierarchyVisualiser/Relation} relation
   * @returns {undefined}
   */
  modifyPrivileges: notImplementedThrow,

  /**
   * Triggers relation removing
   * @type {Function}
   * @virtual
   * @param {Utils/GroupHierarchyVisualiser/Relation} relation
   * @returns {undefined}
   */
  removeRelation: notImplementedThrow,

  /**
   * If true, tooltip for direct membership icon is rendered
   * @type {boolean}
   */
  directMembershipTooltip: false,

  /**
   * True if group box does not match to search query
   * @type {Ember.ComputedProperty<boolean>}
   */
  isFilteredOut: reads('groupBox.isFilteredOut'),

  /**
   * True if box has some expanded relation
   * @type {Ember.ComputedProperty<boolean>}
   */
  isBoxActive: or('parentsRelationActive', 'childrenRelationActive'),

  /**
   * True if box is in hovered state (== box itself or lines are hovered)
   * @type {Ember.ComputedProperty<boolean>}
   */
  hovered: or(
    'actionsOpened',
    'groupBox.leftLine.hovered',
    'groupBox.rightLine.hovered'
  ),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  viewGroupAction: computed(function viewGroupAction() {
    return {
      action: () => this.get('viewGroup')(),
      title: this.t('viewGroup'),
      class: 'view-group-action',
      icon: 'overview',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  renameAction: computed('isRenaming', function renameAction() {
    const isRenaming = this.get('isRenaming');
    return {
      action: () => this.set('isRenaming', true),
      title: this.t('rename'),
      class: 'rename-group-action',
      icon: 'rename',
      disabled: isRenaming,
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  addChildGroupAction: computed(function addChildGroupAction() {
    return {
      nestedActions: [{
        action: () => this.get('createRelativeGroup')('child'),
        title: this.t('createNewGroup'),
        class: 'create-new-action',
        icon: 'add-filled',
      }, {
        action: () => this.get('addYourGroup')('child'),
        title: this.t('addYourGroup'),
        class: 'add-your-group-action',
        icon: 'group-invite',
      }, {
        action: () => this.get('inviteUsingToken')(),
        title: this.t('inviteUsingToken'),
        class: 'invite-using-token-action',
        icon: 'join-plug',
      }],
      title: this.t('addChildGroup'),
      class: 'add-group-action',
      icon: 'add-filled',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  addParentGroupAction: computed(function addParentGroupAction() {
    return {
      nestedActions: [{
        action: () => this.get('createRelativeGroup')('parent'),
        title: this.t('createNewGroup'),
        class: 'create-new-action',
        icon: 'add-filled',
      }, {
        action: () => this.get('addYourGroup')('parent'),
        title: this.t('addYourGroup'),
        class: 'add-your-group-action',
        icon: 'group-invite',
      }, {
        action: () => this.get('joinUsingToken')(),
        title: this.t('joinUsingToken'),
        class: 'join-using-token-action',
        icon: 'join-plug',
      }],
      title: this.t('addParentGroup'),
      class: 'add-group-action',
      icon: 'add-filled',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  leaveAction: computed(function leaveAction() {
    return {
      action: () => this.get('leaveGroup')(),
      title: this.t('leave'),
      class: 'leave-group-action',
      icon: 'group-leave-group',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  removeAction: computed(function removeAction() {
    return {
      action: () => this.get('removeGroup')(),
      title: this.t('remove'),
      class: 'remove-group-action',
      icon: 'remove',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  groupActions: computed(
    'viewGroupAction',
    'renameAction',
    'addChildGroupAction',
    'addParentGroupAction',
    'leaveAction',
    'removeAction',
    'groupBox.group.directMembership',
    function groupActions() {
      const {
        viewGroupAction,
        renameAction,
        addChildGroupAction,
        addParentGroupAction,
        leaveAction,
        removeAction,
      } = this.getProperties(
        'viewGroupAction',
        'renameAction',
        'addChildGroupAction',
        'addParentGroupAction',
        'leaveAction',
        'removeAction'
      );
      const actions = [
        viewGroupAction,
        renameAction,
        addChildGroupAction,
        addParentGroupAction,
      ];
      if (this.get('groupBox.group.directMembership')) {
        actions.push(leaveAction);
      }
      actions.push(removeAction);
      return actions;
    }
  ),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  style: computed('groupBox.{x,y,width,marginBottom}', function style() {
    const {
      x,
      y,
      width,
      marginBottom,
    } = getProperties(this.get('groupBox'), 'x', 'y', 'width', 'marginBottom');
    let css = '';
    if (x !== undefined) {
      css += `left: ${x}px;`;
    }
    if (y !== undefined) {
      css += `top: ${y}px;`;
    }
    return htmlSafe(
      css + `width: ${width}px; margin-bottom: ${marginBottom}px;`
    );
  }),

  actions: {
    toggleActions(opened) {
      if (opened !== this.get('actionsOpened')) {
        this.set('actionsOpened', opened);
      }
    },
    rename(name) {
      return this.get('renameGroup')(name)
        .then(() => safeExec(this, 'set', 'isRenaming', false));
    },
  },
});
