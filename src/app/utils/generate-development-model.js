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
import { A } from '@ember/array';
import { Promise } from 'rsvp';

const USER_ID = 'stub_user_id';
const USERNAME = 'Stub User';
const USER_LOGIN = 'stub_user';
const NUMBER_OF_PROVIDERS = 3;
const NUMBER_OF_SPACES = 3;
const NUMBER_OF_CLIENT_TOKENS = 3;
const LINKED_ACCOUNT_TYPES = ['plgrid', 'indigo', 'google'];

const providerStatusList = ['online', 'offline'];

/**
 * @export
 * @function
 * @param {EmberData.Store} store
 * @returns {Promise<undefined, any>}
 */
export default function generateDevelopmentModel(store) {
  const types = ['space', 'group', 'provider', 'clientToken', 'linkedAccount'];
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
      return Promise.all([providers, spaces]).then(([providerList, spacesList]) =>
        Promise.all(providerList.map(provider =>
          createListRecord(store, 'space', spacesList).then(lr => {
            provider.set('spaceList', lr);
            return provider.save();
          })
        ))
      ).then(() => listRecords);
    })
    .then(listRecords => {
      const providers = listRecords[types.indexOf('provider')].get('list');
      const spaces = listRecords[types.indexOf('space')].get('list');
      return Promise.all([providers, spaces]).then(([providerList, spaceList]) =>
        Promise.all(spaceList.map(space =>
          createListRecord(store, 'provider', providerList).then(lr => {
            space.set('providerList', lr);
            return space.save();
          })
        ))
      ).then(() => listRecords);
    })
    .then(listRecords => createUserRecord(store, listRecords));
}

function createUserRecord(store, listRecords) {
  const userRecord = store.createRecord('user', {
    id: userGri(USER_ID),
    name: USERNAME,
    login: USER_LOGIN,
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
    case 'linkedAccount':
      return createLinkedAccount(store);
    default:
      return Promise.all(names.map(number =>
        store.createRecord(type, { name: `${type} ${number}` }).save()
      ));
  }
}

function createListRecord(store, type, records) {
  const listType = type + 'List';
  const listRecord = store.createRecord(listType, {});
  return listRecord.get('list').then(list => {
    list.pushObjects(records);
    return list.save().then(() => listRecord.save());
  });
}

function createProvidersRecords(store) {
  return Promise.all(_.range(NUMBER_OF_PROVIDERS).map((index) => {
    let sign = index % 2 ? -1 : 1;
    return store.createRecord('provider', {
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
      name: `Space ${index}`,
      supportSizes: _.zipObject(
        _.range(NUMBER_OF_PROVIDERS).map(String),
        _.fill(Array(NUMBER_OF_PROVIDERS), perProviderSize)
      ),
    }).save();
  }));
}

function createClientTokensRecords(store) {
  return Promise.all(_.range(NUMBER_OF_CLIENT_TOKENS).map(() => {
    return store.createRecord('clientToken', {}).save();
  }));
}

function createLinkedAccount(store) {
  return Promise.all(LINKED_ACCOUNT_TYPES.map(idp =>
    store.createRecord('linkedAccount', {
      idp,
      emailList: A([
        `email1@${idp}.com`,
        `email2@${idp}.com`,
      ]),
    }).save()
  ));
}
