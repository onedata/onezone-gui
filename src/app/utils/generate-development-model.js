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
import { get } from '@ember/object';
import groupPermissionsFlags from 'onedata-gui-websocket-client/utils/group-permissions-flags';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';

const USER_ID = 'stub_user_id';
const USERNAME = 'Stub User';
const USER_LOGIN = 'stub_user';
const NUMBER_OF_SHARED_USERS = 3;
const NUMBER_OF_SHARED_GROUPS = 3;
const NUMBER_OF_PROVIDERS = 3;
const NUMBER_OF_SPACES = 3;
const NUMBER_OF_CLIENT_TOKENS = 3;
const NUMBER_OF_GROUPS = 3;
const LINKED_ACCOUNT_TYPES = ['plgrid', 'indigo', 'google'];

const providerStatusList = ['online', 'offline'];

const types = ['space', 'group', 'provider', 'clientToken', 'linkedAccount'];
const names = ['one', 'two', 'three'];

const perProviderSize = Math.pow(1024, 4);

/**
 * @export
 * @function
 * @param {EmberData.Store} store
 * @returns {Promise<undefined, any>}
 */
export default function generateDevelopmentModel(store) {
  let sharedUsersGri, sharedGroupsGri;
  // create shared users
  return createSharedUsersRecords(store)
    .then(sharedUsers =>
      sharedUsersGri = sharedUsers.map(sharedUser => get(sharedUser, 'gri'))
    )
    .then(() =>
      createSharedGroupsRecords(store)
    )
    // create shared groups
    .then(sharedGroups =>
      sharedGroupsGri = sharedGroups.map(sharedGroup => get(sharedGroup, 'gri'))
    )
    // create main resources lists
    .then(() =>
      Promise.all(
        types.map(type =>
          createEntityRecords(store, type, names)
            .then(records => createListRecord(store, type, records))
        )
      )
    )
    // push space list into providers
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
    // push provider list and support info into spaces
    .then(listRecords => {
      const providers = listRecords[types.indexOf('provider')].get('list');
      const spaces = listRecords[types.indexOf('space')].get('list');
      return Promise.all([providers, spaces]).then(([providerList, spaceList]) =>
        Promise.all(spaceList.map(space => {
          space.set('supportSizes', _.zipObject(
            get(providers, 'content').mapBy('entityId'),
            _.fill(Array(NUMBER_OF_PROVIDERS), perProviderSize)
          ));
          return createListRecord(store, 'provider', providerList).then(lr => {
            space.set('providerList', lr);
            return space.save();
          });
        }))
      ).then(() => listRecords);
    })
    // add permissions to groups
    .then(listRecords =>
      listRecords[types.indexOf('group')].get('list')
        .then(groups =>
          Promise.all(groups.map(group =>
            createPermissionsForGroup(store, group, sharedUsersGri, sharedGroupsGri)
            .then(() =>
              group.save()
            )
          ))
        )
        .then(() => listRecords)
    )
    .then(listRecords => createUserRecord(store, listRecords));
}

function createUserRecord(store, listRecords) {
  const spacesIndex = types.indexOf('space');
  return listRecords[spacesIndex].get('list')
    .then(list => list.get('length') > 0 ? list.get('firstObject ') : null)
    .then(space => space && space.get('entityId'))
    .then(defaultSpaceId => {
      const userRecord = store.createRecord('user', {
        id: userGri(USER_ID),
        name: USERNAME,
        login: USER_LOGIN,
        defaultSpaceId,
      });
      listRecords.forEach(lr =>
        userRecord.set(camelize(lr.constructor.modelName), lr)
      );
      return userRecord.save();
    });
}

function createEntityRecords(store, type, names) {
  switch (type) {
    case 'provider':
      return createProvidersRecords(store);
    case 'space':
      return createSpacesRecords(store);
    case 'clientToken':
      return createClientTokensRecords(store);
    case 'group':
      return createGroupsRecords(store);
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
      latitude: ((180 / (NUMBER_OF_PROVIDERS + 1)) * (index + 1) - 90) *
        sign,
      longitude: (360 / (NUMBER_OF_PROVIDERS + 1)) * (index + 1) - 180,
      status: providerStatusList[index % providerStatusList.length],
      host: `10.0.0.${index + 1}`,
    }).save();
  }));
}

function createSpacesRecords(store) {
  return Promise.all(_.range(NUMBER_OF_SPACES).map((index) => {
    return store.createRecord('space', {
      name: `Space ${index}`,
    }).save();
  }));
}

function createClientTokensRecords(store) {
  return Promise.all(_.range(NUMBER_OF_CLIENT_TOKENS).map(() => {
    return store.createRecord('clientToken', {}).save();
  }));
}

function createGroupsRecords(store) {
  return Promise.all(_.range(NUMBER_OF_GROUPS).map((index) => {
    return store.createRecord('group', { name: `group${index}` }).save();
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

function createSharedUsersRecords(store) {
  return Promise.all(_.range(NUMBER_OF_SHARED_USERS).map((index) => {
    return store.createRecord('sharedUser', { name: `sharedUser${index}` }).save();
  }));
}

function createSharedGroupsRecords(store) {
  return Promise.all(_.range(NUMBER_OF_SHARED_GROUPS).map((index) => {
    return store.createRecord('sharedGroup', { name: `sharedGroup${index}` }).save();
  }));
}

function createPermissionsForGroup(store, group, sharedUsersGri, sharedGroupsGri) {
  return createGroupPermissionsRecords(store, group, sharedUsersGri, 'user')
    .then((userPermissions) =>
      createListRecord(store, 'groupUserPermission', userPermissions)
    )
    .then((userPermissionList) =>
      group.set('userPermissionList', userPermissionList)
    )
    .then(() =>
      createGroupPermissionsRecords(store, group, sharedGroupsGri, 'group')
    )
    .then((groupPermissions) =>
      createListRecord(store, 'groupGroupPermission', groupPermissions)
    )
    .then((groupPermissionList) =>
      group.set('groupPermissionList', groupPermissionList)
    );
}

function createGroupPermissionsRecords(store, group, sharedGriArray, type) {
  const groupGri = get(group, 'gri');
  let groupId;
  try {
    groupId = parseGri(groupGri).entityId;
  } catch (e) {
    return Promise.resolve([]);
  }
  const permissions = groupPermissionsFlags
    .reduce((perms, flag) => {
      perms[flag] = true;
      return perms;
    }, {});
  const recordData = {
    groupId,
    permissions,
  };
  let griProperty;
  let modelName;
  switch (type) {
    case 'user':
      griProperty = 'sharedUserGri';
      modelName = 'groupUserPermission';
      break;
    case 'group':
      griProperty = 'sharedGroupGri';
      modelName = 'groupGroupPermission';
      break;
  }
  return Promise.all(_.range(sharedGriArray.length).map((index) => {
    recordData[griProperty] = sharedGriArray[index];
    return store.createRecord(modelName, recordData).save();
  }));
}
