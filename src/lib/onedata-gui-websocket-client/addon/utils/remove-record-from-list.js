/**
 * Util function that removes record from list-like parent record (that has `list` property).
 *
 * @module utils/remove-record-from-list
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import RSVP from 'rsvp';

/**
 * @param {DS.Model} record record to remove (from list)
 * @param {DS.Model} recordList parent record (with `list` property)
 * @param {boolean} destroyRecordEntity If true, record will be saved before
 * removing it from the list
 * @return {RSVP.Promise} Promise, that resolves to record object if all
 * save operations success.
 */
export default function removeRecordFromList(record, recordList, destroyRecordEntity = true) {
  let initPromise = RSVP.Promise.resolve();
  if (destroyRecordEntity) {
    initPromise = record.destroyRecord();
  }
  return initPromise.then(() =>
    recordList.get('list').then(list => {
      list.removeObject(record);
      return list.save().then(() =>
        recordList.save().then(() => record)
      );
    })
  );
}
