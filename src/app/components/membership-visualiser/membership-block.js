import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads, collect } from '@ember/object/computed';
import _ from 'lodash';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['membership-element', 'membership-block'],
  classNameBindings: ['recordType', 'actionsOpened'],

  /**
   * @override
   */
  i18nPrefix: 'components.membershipVisualiser.membershipBlock',

  /**
   * @type {GraphSingleModel}
   */
  record: null,

  /**
   * @type {Ember.ComputerProperty<string>}
   */
  recordType: reads('record.entityType'),

  /**
   * True if mouse is over block icon
   * @type {boolean}
   */
  isMouseOverIcon: false,

  /**
   * If true, block icon is hovered
   * @type {boolean}
   */
  isIconHovered: false,

  /**
   * @type {boolean}
   */
  actionsOpened: false,

  /**
   * Redirects to record dedicated page
   * @type {Function}
   * @virtual
   * @returns {undefined}
   */
  view: notImplementedThrow,

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  viewAction: computed('recordType', function viewAction() {
    return {
      action: () => this.get('view')(),
      title: this.t('view' + _.upperFirst(this.get('recordType'))),
      class: 'view-action',
      icon: 'overview',
    };
  }),
  
  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  blockActions: collect('viewAction'),

  /**
   * Block icon
   * @type {Ember.ComputerProperty<string>}
   */
  iconName: computed('recordType', function iconName() {
    const recordType = this.get('recordType');
    switch (recordType) {
      case 'group':
        return 'groups';
      default:
        return recordType;
    }
  }),

  actions: {
    toggleActions(opened) {
      const {
        actionsOpened,
        isMouseOverIcon,
      } = this.getProperties('actionsOpened', 'isMouseOverIcon');
      if (opened !== actionsOpened) {
        // is closing and loosing hover
        if (!opened && actionsOpened && !isMouseOverIcon) {
          this.set('isIconHovered', false);
        }
        this.set('actionsOpened', opened);
      }
    },
    changeIconHover(isIconHovered) {
      this.set('isMouseOver', isIconHovered);
      // change hover only when popover is closed
      if (!this.get('actionsOpened')) {
        this.set('isIconHovered', isIconHovered);
      }
    },
  },
});
