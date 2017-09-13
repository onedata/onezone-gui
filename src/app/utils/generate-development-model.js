/**
 * Create and save example records for onezone-gui using store
 *
 * @module utils/generate-development-model
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 *
 */

import { camelize } from '@ember/string';
import userGri from 'onedata-gui-websocket-client/utils/user-gri';

const USER_ID = 'stub_user_id';
const USERNAME = 'Stub User';

/*
 * @export
 * @function
 * @param {EmberData.Store} store
 * @returns {Promise<undefined, any>}
 */
export default function generateDevelopmentModel(store) {
  const types = ['space', 'group', 'provider'];
  const names = ['one', 'two', 'three'];
  return Promise.all(
      types.map(type =>
        createEntityRecords(store, type, names)
        .then(records => createListRecord(store, type, records))
      )
    )
    .then(listRecords => createUserRecord(store, listRecords));
}

function createUserRecord(store, listRecords) {
  const userRecord = store.createRecord('user', {
    id: userGri(USER_ID),
    name: USERNAME,
  });
  listRecords.forEach(lr =>
    userRecord.set(camelize(lr.constructor.modelName), lr)
  );
  return userRecord.save();
}

function createEntityRecords(store, type, names) {
  return Promise.all(names.map(number =>
    store.createRecord(type, { name: `${type} ${number}` }).save()
  ));
}

function createListRecord(store, type, records) {
  const listType = type + 'List';
  const listRecord = store.createRecord(listType, {});
  listRecord.get('list').pushObjects(records);
  return listRecord.save();
}
