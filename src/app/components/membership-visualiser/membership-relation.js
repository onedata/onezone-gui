import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['membership-element', 'membership-relation'],
  classNameBindings: ['isHovered:hovered'],

  /**
   * @type {Object}
   * @virtual
   */
  pathElement: null,

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
   * @type {Ember.ComputedProperty<boolean>}
   */
  actionsEnabled: computed(
    'pathElement.child.entityType',
    function actionsEnabled() {
      return this.get('pathElement.child.entityType') !== 'space';
    }
  ),
  
  actionsArray: computed(function actionsArray() {
    return [];
  }),

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
