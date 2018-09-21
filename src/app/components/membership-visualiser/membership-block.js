import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads, not } from '@ember/object/computed';

export default Component.extend({
  classNames: ['membership-element', 'membership-block'],
  classNameBindings: ['recordType'],

  /**
   * @type {Ember.ComputerProperty<GraphSingleModel>}
   */
  record: reads('pathElement.record'),

  /**
   * @type {Ember.ComputerProperty<string>}
   */
  recordType: reads('record.entityType'),

  /**
   * @type {Ember.ComputerProperty<boolean>}
   */
  showName: not('pathElement.startBlock'),

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
