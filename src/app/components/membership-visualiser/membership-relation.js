import Component from '@ember/component';
import { computed } from '@ember/object';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['membership-element', 'membership-relation'],
  classNameBindings: ['isHovered:hovered'],

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
   * @type {Ember.ComputedProperty<boolean>}
   */
  actionsEnabled: computed('relation.childType', function actionsEnabled() {
    return this.get('relation') && this.get('relation.childType') !== 'space';
  }),

    /**
   * @type {Ember.ComputedProperty<Action>}
   */
  modifyPrivilegesAction: computed(function modifyPrivilegesAction() {
    return {
      action: () => this.get('modifyPrivileges')(),
      title: this.t('modifyPrivileges'),
      class: 'modify-privileges-action',
      icon: 'permissions',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  removeRelationAction: computed(function removeRelationAction() {
    return {
      action: () => this.get('removeRelation')(),
      title: this.t('removeRelation'),
      class: 'remove-relation-action',
      icon: 'close',
    };
  }),

  /**
   * Relation actions
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  relationActions: computed(
    'modifyPrivilegesAction',
    'removeRelationAction',
    'relation.canViewPrivileges',
    function relationActions() {
      const {
        modifyPrivilegesAction,
        removeRelationAction,
      } = this.getProperties(
        'modifyPrivilegesAction',
        'removeRelationAction',
      );
      const canViewPrivileges = this.get('relation.canViewPrivileges');
      const actions = [];
      if (canViewPrivileges) {
        actions.push(modifyPrivilegesAction);
      }
      actions.push(removeRelationAction);
      return actions;
    }
  ),

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
