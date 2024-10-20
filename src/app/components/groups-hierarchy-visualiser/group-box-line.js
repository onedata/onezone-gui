/**
 * Draws a group box line (left or right) in groups hierarchy visualiser according
 * to values passed using the `line` property.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { getProperties, computed } from '@ember/object';
import { reads, and, collect } from '@ember/object/computed';
import { next } from '@ember/runloop';
import { htmlSafe } from '@ember/string';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';

export default Component.extend(I18n, {
  classNames: ['group-box-line'],
  classNameBindings: [
    'hovered',
    'actionsVisible',
    'actionsOpened',
  ],
  attributeBindings: ['style'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.groupsHierarchyVisualiser.groupBoxLine',

  /**
   * Line definition
   * @type {Utils/GroupHierarchyVisualiser/GroupBoxLine}
   * @virtual
   */
  line: undefined,

  /**
   * If true, popover with relation actions is visible
   * @type {boolean}
   */
  actionsOpened: false,

  /**
   * True if mouse is over line
   * @type {boolean}
   */
  isMouseOver: false,

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
   * @type {(() => void) | null}
   */
  mouseEnterHandler: null,

  /**
   * @type {(() => void) | null}
   */
  mouseLeaveHandler: null,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  hovered: reads('line.hovered'),

  /**
   * @type {Ember.ComputedProperty<Utils/MembershipRelation>}
   */
  relation: reads('line.relation'),

  /**
   * If true, actions popover trigger is visible
   * @type {Ember.ComputedProperty<boolean>}
   */
  actionsVisible: and('hovered', 'line.actionsEnabled'),

  /**
   * @type {Ember.ComputedProperty<SafeString>}
   */
  style: computed('line.{x,y,length}', function style() {
    const {
      x,
      y,
      length,
    } = getProperties(this.get('line'), 'x', 'y', 'length');
    return htmlSafe(`left: ${x}px; top: ${y}px; width: ${length}px;`);
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  modifyPrivilegesAction: computed(
    'relation.parent.canViewPrivileges',
    function modifyPrivilegesAction() {
      return {
        action: () => this.get('modifyPrivileges')(this.get('relation')),
        title: this.t('modifyPrivileges'),
        class: 'modify-privileges-action',
        icon: 'permissions',
        disabled: !this.get('relation.parent.canViewPrivileges'),
      };
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  removeRelationAction: computed(function removeRelationAction() {
    return {
      action: () => this.get('removeRelation')(this.get('relation')),
      title: this.t('removeRelation'),
      class: 'remove-relation-action',
      icon: 'close',
    };
  }),

  /**
   * Relation actions
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  relationActions: collect('modifyPrivilegesAction', 'removeRelationAction'),

  /**
   * @override
   */
  didInsertElement() {
    this._super(...arguments);

    if (!this.element) {
      return;
    }

    this.setProperties({
      mouseEnterHandler: () => {
        this.changeHover(true);
      },
      mouseLeaveHandler: () => {
        this.changeHover(false);
      },
    });
    this.element.addEventListener('mouseenter', this.mouseEnterHandler);
    this.element.addEventListener('mouseleave', this.mouseLeaveHandler);
  },

  /**
   * @override
   */
  willDestroyElement() {
    try {
      if (this.mouseEnterHandler) {
        this.element?.removeEventListener('mouseenter', this.mouseEnterHandler);
      }
      if (this.mouseLeaveHandler) {
        this.element?.removeEventListener('mouseleave', this.mouseLeaveHandler);
      }
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * Changes hover state of the line
   * @param {boolean} isHovered
   * @returns {undefined}
   */
  changeHover(isHovered) {
    if (this.get('line.actionsEnabled')) {
      this.set('isMouseOver', isHovered);
      // change hover only when popover is closed
      if (!this.get('actionsOpened')) {
        this.set('line.hovered', isHovered);
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
          // when popover is closing and line is loosing its hover in the same
          // time, then rendering of the line is corrupted. Moving loosing hover
          // to the next runloop frame.
          next(() => safeExec(this, 'set', 'line.hovered', false));
        }
        this.set('actionsOpened', opened);
      }
    },
  },
});
