/**
 * Util function that saves record in list-like parent record (that has `list` property).
 *
 * @module utils/add-record-to-list
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import RSVP from 'rsvp';

/**
 * @param {DS.Model} record record to save (add to list)
 * @param {DS.Model} recordList parent record (with `list` property)
 * @param {boolean} saveRecordEntity If true, record will be saved before
 * pushing it to the list
 * @return {RSVP.Promise} Promise, that resolves to record object if all
 * save operations success.
 */
export default function addRecordToList(record, recordList, saveRecordEntity = false) {
  let initPromise = RSVP.Promise.resolve();
  if (saveRecordEntity) {
    initPromise = record.save();
  }
  return initPromise.then(() =>
    recordList.get('list').then(list => {
      list.pushObject(record);
      return list.save().then(() =>
        recordList.save().then(() => record)
      );
    })
  );
}
