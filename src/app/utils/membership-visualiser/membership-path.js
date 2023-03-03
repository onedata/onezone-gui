/**
 * Object used internally by membership-visualiser component. Acts as a container
 * for records, which create membership path.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed } from '@ember/object';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { inject as service } from '@ember/service';
import { Promise, resolve } from 'rsvp';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import { A } from '@ember/array';

export default EmberObject.extend({
  store: service(),

  /**
   * Array of records gri, that creates the path. First element in the path
   * (contextRecord) is not included in array, because it is (should be)
   * the same across all membership paths in the visualiser.
   * The order of gri:
   * [immediateParentGri, ...nthLevelParentGri, topParentGri]`
   * where topParent is usually targetRecord passed to viusaliser
   * @type {Array<string>}
   */
  griPath: Object.freeze([]),

  /**
   * If true, then path does not satisfy filter query.
   */
  isFilteredOut: false,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  id: computed('griPath', function id() {
    return this.get('griPath').join('|');
  }),

  /**
   * @type {Ember.ComputedProperty<PromiseArray<GraphSingleModel|null>>}
   */
  model: computed('griPath', function model() {
    return PromiseArray.create({
      promise: Promise.all(
        this.get('griPath')
        .map(recordGri => this.fetchRecordByGri(recordGri)),
      ),
    });
  }),

  /**
   * @type {Ember.ComputedProperty<Array<string>>}
   */
  names: computed('model.content.@each.name', function names() {
    return (this.get('model.content') || A())
      .map(x => x || {})
      .mapBy('name');
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  concatenatedNames: computed('names', function concatenatedNames() {
    return this.get('names').map(n => n || '#').join('-');
  }),

  /**
   * Loads record using given GRI
   * @param {string} recordGri
   * @returns {Promise<GraphSingleModel|null>}
   */
  fetchRecordByGri(recordGri) {
    if (!recordGri) {
      // empty recordGri means, that record should be ommitted while loading
      // path elements (e.g. due to lack of privileges to fetch them).
      return resolve(null);
    }
    const entityType = parseGri(recordGri).entityType;
    return this.get('store').findRecord(entityType, recordGri)
      .then(record => Promise.all([
        record.get('groupList'),
        record.get('userList'),
      ]).then(() => record));
  },
});
