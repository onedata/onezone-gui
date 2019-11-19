/**
 * A component, that render line between two blocks in a path. Is used internally by
 * membership-visualiser component.
 *
 * @module components/membership-visualiser/membership-relation
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { collect } from '@ember/object/computed';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  classNames: ['membership-row-element', 'membership-relation'],
  classNameBindings: ['isHovered:hovered'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.membershipVisualiser.membershipRelation',

  /**
   * @type {Utils/MembershipRelation}
   * @virtual
   */
  relation: null,

  /**
   * Shows privileges editor
   * @type {Function}
   * @virtual
   * @param {Utils/MembershipRelation} relation
   * @returns {undefined}
   */
  modifyPrivileges: notImplementedThrow,

  /**
   * Triggers relation removing
   * @type {Function}
   * @virtual
   * @param {Utils/MembershipRelation} relation
   * @returns {undefined}
   */
  removeRelation: notImplementedThrow,

  /**
   * True if mouse is over line
   * @type {boolean}
   */
  isMouseOver: false,

  /**
   * If true, line is hovered
   * @type {boolean}
   */
  isHovered: false,

  /**
   * @type {boolean}
   */
  actionsOpened: false,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  arrowText: computed('relation.parentType', function arrowText() {
    const relation = this.get('relation');
    if (relation) {
      return this.t(get(relation, 'parentType') === 'provider' ?
        'isSupportedBy' : 'isMemberOf');
    }
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  actionsEnabled: computed('relation.childType', function actionsEnabled() {
    return this.get('relation') && this.get('relation.childType') !== 'space';
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  modifyPrivilegesAction: computed(
    'relation.canViewPrivileges',
    function modifyPrivilegesAction() {
      return {
        action: () => this.get('modifyPrivileges')(),
        title: this.t('modifyPrivileges'),
        class: 'modify-privileges-action',
        icon: 'permissions',
        disabled: !this.get('relation.canViewPrivileges'),
      };
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  removeRelationAction: computed(
    'relation.exists',
    function removeRelationAction() {
      return {
        action: () => this.get('removeRelation')(),
        title: this.t('removeRelation'),
        class: 'remove-relation-action',
        icon: 'close',
        disabled: !this.get('relation.exists'),
      };
    }
  ),

  /**
   * Relation actions
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  relationActions: collect('modifyPrivilegesAction', 'removeRelationAction'),

  mouseEnter() {
    this.changeHover(true);
  },

  mouseLeave() {
    this.changeHover(false);
  },

  /**
   * Changes hover state of the line
   * @param {boolean} isHovered
   * @returns {undefined}
   */
  changeHover(isHovered) {
    if (this.get('actionsEnabled')) {
      this.set('isMouseOver', isHovered);
      // change hover only when popover is closed
      if (!this.get('actionsOpened')) {
        this.set('isHovered', isHovered);
      }
    }
  },

  actions: {
    toggleActions(opened) {
      const {
        actionsOpened,
        isMouseOver,
      } = this.getProperties('actionsOpened', 'isMouseOver');
      if (opened !== actionsOpened) {
        // is closing and loosing hover
        if (!opened && actionsOpened && !isMouseOver) {
          this.set('isHovered', false);
        }
        this.set('actionsOpened', opened);
      }
    },
  },
});
