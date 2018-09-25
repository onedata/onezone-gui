import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export default Component.extend({
  classNames: ['membership-element', 'membership-block'],
  classNameBindings: ['recordType'],

  /**
   * @type {GraphSingleModel}
   */
  record: null,

  /**
   * @type {Ember.ComputerProperty<string>}
   */
  recordType: reads('record.entityType'),

  /**
   * @type {boolean}
   */
  showName: true,

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
});
