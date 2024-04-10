/**
 * A component, that shows one block in membership path. Is used internally by
 * membership-visualiser component.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/i18n';
import recordIcon from 'onedata-gui-common/utils/record-icon';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  classNames: ['membership-row-element', 'membership-block'],
  classNameBindings: ['recordTypeClass', 'actionsOpened'],

  recordManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.membershipVisualiser.membershipBlock',

  /**
   * Model represented by block.
   * @type {GraphSingleModel}
   */
  record: null,

  /**
   * @type {Ember.ComputerProperty<string>}
   */
  recordType: computed('record', function recordType() {
    const {
      recordManager,
      record,
    } = this.getProperties('recordManager', 'record');
    return recordManager.getModelNameForRecord(record);
  }),

  /**
   * @type {boolean}
   */
  isCondensed: false,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  recordTypeClass: computed('recordType', function recordTypeClass() {
    const recordType = this.get('recordType');
    return recordType ? `record-${recordType}` : '';
  }),

  /**
   * Block icon
   * @type {Ember.ComputerProperty<string>}
   */
  iconName: computed('record', function iconName() {
    return recordIcon(this.get('record'), true);
  }),
});
