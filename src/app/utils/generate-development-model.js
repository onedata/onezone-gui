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
import groupPrivilegesFlags from 'onedata-gui-websocket-client/utils/group-privileges-flags';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import gri from 'onedata-gui-websocket-client/utils/gri';

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
  let sharedUsers, sharedGroups;
  // create shared users
  return createSharedUsersRecords(store)
    .then(su => sharedUsers = su)
    .then(() =>
      createSharedGroupsRecords(store)
    )
    // create shared groups
    .then(sg => sharedGroups = sg)
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
    // add shared groups, users and privileges to groups
    .then(listRecords =>
      Promise.all(['group', 'space'].map(modelType =>
        listRecords[types.indexOf(modelType)].get('list')
        .then(models =>
          Promise.all(models.map(model =>
            attachSharedUsersGroupsToModel(store, model, sharedUsers, sharedGroups)
          ))
        )
        .then(models =>
          Promise.all(models.map(model =>
            createPrivilegesForModel(
              store, model, modelType, sharedUsers, sharedGroups, groupPrivilegesFlags
            )
          ))
        )
      )).then(() => listRecords)
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
      online: [true, false][index % 2],
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

function attachSharedUsersGroupsToModel(store, group, sharedUsers, sharedGroups) {
  return createListRecord(store, 'sharedGroup', sharedGroups)
    .then(list => group.set('sharedGroupList', list))
    .then(() => createListRecord(store, 'sharedUser', sharedUsers))
    .then(list => {
      group.set('sharedUserList', list);
      return group.save();
    });
}

function createPrivilegesForModel(
  store, model, modelType, sharedUsers, sharedGroups, privilegesFlags
) {
  return Promise.all([
    createPrivilegesRecords(
      store, model, modelType, sharedUsers, privilegesFlags, 'user'
    ),
    createPrivilegesRecords(
      store, model, modelType, sharedGroups, privilegesFlags, 'group'
    ),
  ]);
}

function createPrivilegesRecords(
  store, model, modelType, sharedArray, privilegesArray, privilegesType
) {
  const sharedGriArray = sharedArray.map(subject => subject.get('id'));
  const modelGri = get(model, 'gri');
  let modelId, subjectId;
  try {
    modelId = parseGri(modelGri).entityId;
  } catch (e) {
    return Promise.resolve([]);
  }
  const recordData = {
    privileges: privilegesArray.slice(0),
  };
  let aspect = privilegesType === 'user' ? 'user_privileges' : 'group_privileges';
  if (modelType === 'group' && privilegesType === 'group') {
    aspect = 'child_privileges';
  }
  return Promise.all(_.range(sharedGriArray.length).map((index) => {
    subjectId = parseGri(sharedGriArray[index]).entityId;
    recordData.id = gri({
      entityType: modelType,
      entityId: modelId,
      aspect,
      aspectId: subjectId,
    });
    return store.createRecord('privilege', recordData).save();
  }));
}
