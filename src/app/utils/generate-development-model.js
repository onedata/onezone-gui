/**
 * Create and save example records for onezone-gui using store
 *
 * @module utils/generate-development-model
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 *
 */

import { camelize } from '@ember/string';
import userGri from 'onedata-gui-websocket-client/utils/user-gri';
import _ from 'lodash';
import { providerStatusList } from 'onedata-gui-websocket-client/models/provider';

const USER_ID = 'stub_user_id';
const USERNAME = 'Stub User';
const NUMBER_OF_PROVIDERS = 3;
const NUMBER_OF_SPACES = 3;
const NUMBER_OF_CLIENT_TOKENS = 0;

const CLIENT_TOKEN_PREFIX = 'MDAxNWxvY2F00aW9uIG9uZXpvbmUKMDAzYmlkZW500aWZpZX' +
  'IgQ1NPdEp5OEc5R19XdG96b1JMUzhlaDlQSkpJbjk3d3U3bzIwbVU1NkhnMAowMDFhY2lkIHRp' +
  'bWUgPCAxNTQ2OTQ3MjY5CjAwMmZzaWduYXR1cmUgGQBEVOx4J8kMbqR5h801dXEcKvkhDEsZA5' +
  'aDoLmCia01E';

/**
 * @export
 * @function
 * @param {EmberData.Store} store
 * @returns {Promise<undefined, any>}
 */
export default function generateDevelopmentModel(store) {
  const types = ['space', 'group', 'provider', 'clientToken'];
  const names = ['one', 'two', 'three'];
  return Promise.all(
      types.map(type =>
        createEntityRecords(store, type, names)
        .then(records => createListRecord(store, type, records))
      )
    )
    .then(listRecords => {
      const providers = listRecords[types.indexOf('provider')].get('list');
      const spaces = listRecords[types.indexOf('space')].get('list');
      return Promise.all(providers.map(provider =>
        createListRecord(store, 'space', spaces).then(lr => {
          provider.set('spaceList', lr);
          return provider.save();
        })
      )).then(() => listRecords);
    })
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
  switch (type) {
    case 'provider':
      return createProvidersRecords(store);
    case 'space':
      return createSpacesRecords(store);
    case 'clientToken':
      return createClientTokensRecords(store);
    default:
      return Promise.all(names.map(number =>
        store.createRecord(type, { name: `${type} ${number}` }).save()
      ));
  }
}

function createListRecord(store, type, records) {
  const listType = type + 'List';
  const listRecord = store.createRecord(listType, {});
  listRecord.get('list').pushObjects(records);
  return listRecord.save();
}

function createProvidersRecords(store) {
  return Promise.all(_.range(NUMBER_OF_PROVIDERS).map((index) => {
    let sign = index % 2 ? -1 : 1;
    return store.createRecord('provider', {
      id: String(index),
      name: `Provider ${index}`,
      latitude: ((180 / (NUMBER_OF_PROVIDERS + 1)) * (index + 1) - 90) * sign,
      longitude: (360 / (NUMBER_OF_PROVIDERS + 1)) * (index + 1) - 180,
      status: providerStatusList[index % providerStatusList.length],
      host: `10.0.0.${index + 1}`,
    }).save();
  }));
}

function createSpacesRecords(store) {
  return Promise.all(_.range(NUMBER_OF_SPACES).map((index) => {
    const perProviderSize = 1048576;
    return store.createRecord('space', {
      id: String(index),
      name: `Space ${index}`,
      supportSizes: _.zipObject(
        _.range(NUMBER_OF_PROVIDERS).map(String),
        _.fill(Array(NUMBER_OF_PROVIDERS), perProviderSize)
      ),
    }).save();
  }));
}

function createClientTokensRecords(store) {
  return Promise.all(_.range(NUMBER_OF_CLIENT_TOKENS).map((index) => {
    const tokenString = CLIENT_TOKEN_PREFIX + String(index);
    return store.createRecord('clientToken', {
      id: tokenString,
      token: tokenString,
    }).save();
  }));
}
