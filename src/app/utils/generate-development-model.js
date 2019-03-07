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
import { Promise, resolve } from 'rsvp';
import { get, set } from '@ember/object';
import groupPrivilegesFlags from 'onedata-gui-websocket-client/utils/group-privileges-flags';
import spacePrivilegesFlags from 'onedata-gui-websocket-client/utils/space-privileges-flags';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import gri from 'onedata-gui-websocket-client/utils/gri';

const USER_ID = 'stub_user_id';
const USERNAME = 'Stub User';
const USER_LOGIN = 'stub_user';
const NUMBER_OF_SHARED_USERS = 3;
const NUMBER_OF_PROVIDERS = 3;
const NUMBER_OF_SPACES = 3;
const NUMBER_OF_CLIENT_TOKENS = 3;
const NUMBER_OF_GROUPS = 10;
const LINKED_ACCOUNT_TYPES = ['plgrid', 'indigo', 'google'];

const types = ['space', 'group', 'provider', 'clientToken', 'linkedAccount', 'cluster'];
const names = ['one', 'two', 'three'];

const privileges = {
  space: spacePrivilegesFlags,
  group: groupPrivilegesFlags,
};

const perProviderSize = Math.pow(1024, 4);

/**
 * @export
 * @function
 * @param {EmberData.Store} store
 * @returns {Promise<undefined, any>}
 */
export default function generateDevelopmentModel(store) {
  let sharedUsers, groups;

  // create shared users
  return createSharedUsersRecords(store)
    .then(su => sharedUsers = su)
    // create main resources lists
    .then(() =>
      Promise.all(
        types.map(type =>
          createEntityRecords(store, type, names)
          .then(records => {
            if (type === 'group') {
              groups = records;
            }
            return createListRecord(store, type, records);
          })
        )
      )
    )
    // push space list into providers
    .then(listRecords => {
      const providers = listRecords[types.indexOf('provider')].get('list');
      const spaces = listRecords[types.indexOf('space')].get('list');
      return Promise.all([providers, spaces])
        .then(([providerList, spacesList]) =>
          Promise.all(providerList.map(provider =>
            createListRecord(store, 'space', spacesList).then(lr => {
              provider.set('spaceList', lr);
              return provider.save();
            })
          ))
        )
        .then(() => listRecords);
    })
    // push provider list and support info into spaces
    .then(listRecords => {
      const providers = listRecords[types.indexOf('provider')].get('list');
      const spaces = listRecords[types.indexOf('space')].get('list');
      const clusters = listRecords[types.indexOf('cluster')].get('list');
      return Promise.all([providers, spaces, clusters])
        .then(([providerList, spaceList, clusterList]) =>
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
          .then(() => Promise.all(clusterList.map(cluster => {
            if (get(cluster, 'type') === 'oneprovider') {
              const clusterProvider =
                providerList.findBy('entityId', get(cluster, 'entityId'));
              set(
                cluster,
                'provider',
                clusterProvider
              );
              return cluster.save()
                .then(() => {
                  set(
                    clusterProvider,
                    'cluster',
                    cluster
                  );
                  return clusterProvider.save();
                });
            } else {
              return resolve();
            }
          })))
        )
        .then(() => listRecords);
    })
    // add groups, memberships, users and privileges to groups
    .then(listRecords => listRecords[types.indexOf('group')].get('list')
      .then(records =>
        Promise.all(records.map(record =>
          Promise.all([
            attachSharedUsersGroupsToModel(
              store, record, 'group', false, sharedUsers, groups
            ),
            attachSharedUsersGroupsToModel(
              store, record, 'group', true, sharedUsers, groups
            ),
            attachMembershipsToModel(
              store, record, 'group', groups
            ),
          ])
        ))
      )
      .then(() => listRecords[types.indexOf('space')].get('list')
        .then(records =>
          Promise.all(records.map(record =>
            Promise.all([
              attachSharedUsersGroupsToModel(
                store, record, 'space', false, sharedUsers, groups
              ),
              attachSharedUsersGroupsToModel(
                store, record, 'space', true, sharedUsers, groups
              ),
              attachMembershipsToModel(
                store, record, 'space', groups
              ),
            ])
          ))
        )
      )
      .then(() => Promise.all(['space', 'group'].map(modelType => {
        return listRecords[types.indexOf(modelType)].get('list')
          .then(records =>
            Promise.all(records.map(record =>
              createPrivilegesForModel(
                store,
                record,
                modelType,
                sharedUsers,
                groups,
                privileges[modelType]
              )
            ))
          );
      })))
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

function createEntityRecords(store, type, names, additionalInfo) {
  switch (type) {
    case 'provider':
      return createProvidersRecords(store, additionalInfo);
    case 'space':
      return createSpacesRecords(store, additionalInfo);
    case 'clientToken':
      return createClientTokensRecords(store, additionalInfo);
    case 'group':
      return createGroupsRecords(store, additionalInfo);
    case 'linkedAccount':
      return createLinkedAccount(store, additionalInfo);
    case 'cluster':
      return createClusterRecords(store, additionalInfo);
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
    const providerId = `oneprovider-${index + 1}`;
    const id = `provider.${providerId}.instance:protected`;
    return store.createRecord('provider', {
      id,
      gri: id,
      name: `Provider ${index}`,
      latitude: ((180 / (NUMBER_OF_PROVIDERS + 1)) * (index + 1) - 90) *
        sign,
      longitude: (360 / (NUMBER_OF_PROVIDERS + 1)) * (index + 1) - 180,
      online: [true, false][index % 3],
      host: `${providerId}.local-onedata.org`,
    }).save();
  }));
}

function createSpacesRecords(store) {
  return Promise.all(_.range(NUMBER_OF_SPACES).map((index) => {
    return store.createRecord('space', {
      name: `Space ${index}`,
      scope: 'private',
      directMembership: true,
      canViewPrivileges: true,
      info: {
        creatorType: 'root',
        creationTime: 1540995468,
        sharedDirectories: 0,
      },
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
    return store.createRecord('group', {
      name: `group${index}`,
      scope: 'private',
      type: 'team',
      directMembership: true,
      canViewPrivileges: true,
    }).save();
  }));
}

function createLinkedAccount(store) {
  return Promise.all(LINKED_ACCOUNT_TYPES.map(idp =>
    store.createRecord('linkedAccount', {
      idp,
      emails: A([
        `email1@${idp}.com`,
        `email2@${idp}.com`,
      ]),
    }).save()
  ));
}

function createClusterRecords(store) {
  return Promise.all([{
      id: 'cluster.onezone.instance:protected',
      gri: 'cluster.onezone.instance:protected',
      build: 'lol',
      version: '19.02.0',
      type: 'onezone',
      name: 'PL-Grid',
      onepanelProxy: true,
      info: {
        creatorType: 'root',
        creatorId: '',
        creationTime: 1550156285,
      },
      workerVersion: {
        release: '19.02.0',
        gui: '87bbe581a731f1bce18bdf0a2def80671226f3721bc6685ecad0d468f3d754e5',
        build: '176-g36e2f56',
      },
      onepanelVersion: {
        release: '18.02.0-rc13',
        gui: '47d07d54d0a33c4715f1532c3d50b468db7b66d3e753b0bb13dfdeeefdc450a2',
        build: '161-g344737f',
      },
    },
    {
      id: 'cluster.oneprovider-1.instance:protected',
      gri: 'cluster.oneprovider-1.instance:protected',
      build: 'lol1',
      version: '19.02.0',
      type: 'oneprovider',
      name: 'Cyfronet',
      onepanelProxy: false,
      provider: 'provider.oneprovider-1.instance:protected',
      info: {
        creatorType: 'root',
        creatorId: '',
        creationTime: 1550156285,
      },
      workerVersion: {
        release: '19.02.0',
        gui: '87bbe581a731f1bce18bdf0a2def80671226f3721bc6685ecad0d468f3d754e5',
        build: '176-g36e2f56',
      },
      onepanelVersion: {
        release: '18.02.0-rc13',
        gui: '47d07d54d0a33c4715f1532c3d50b468db7b66d3e753b0bb13dfdeeefdc450a2',
        build: '161-g344737f',
      },
    },
    {
      id: 'cluster.oneprovider-2.instance:protected',
      gri: 'cluster.oneprovider-2.instance:protected',
      build: 'lol2',
      version: '19.02.0',
      type: 'oneprovider',
      name: 'PCSS',
      onepanelProxy: true,
      provider: 'provider.oneprovider-2.instance:protected',
      info: {
        creatorType: 'root',
        creatorId: '',
        creationTime: 1550156285,
      },
      workerVersion: {
        release: '19.02.0',
        gui: '87bbe581a731f1bce18bdf0a2def80671226f3721bc6685ecad0d468f3d754e5',
        build: '176-g36e2f56',
      },
      onepanelVersion: {
        release: '18.02.0-rc13',
        gui: '47d07d54d0a33c4715f1532c3d50b468db7b66d3e753b0bb13dfdeeefdc450a2',
        build: '161-g344737f',
      },
    },
  ].map(c => store.createRecord('cluster', c).save()));
}

function createSharedUsersRecords(store) {
  return Promise.all(_.range(NUMBER_OF_SHARED_USERS).map((index) => {
    return store.createRecord('sharedUser', { name: `sharedUser${index}` }).save();
  }));
}

function attachSharedUsersGroupsToModel(
  store,
  record,
  modelType,
  isEffective,
  sharedUsers,
  groups
) {
  return createListRecord(store, 'group', groups)
    .then(list => {
      let listName = modelType === 'group' ? 'childList' : 'groupList';
      if (isEffective) {
        listName = 'eff' + _.upperFirst(listName);
      }
      return record.set(listName, list);
    })
    .then(() => {
      if (modelType === 'group') {
        return createListRecord(store, 'group', groups)
          .then(list => record.set('parentList', list));
      }
    })
    .then(() => createListRecord(store, 'sharedUser', sharedUsers))
    .then(list => {
      const listName = isEffective ? 'effUserList' : 'userList';
      record.set(listName, list);
      return record.save();
    });
}

function attachMembershipsToModel(
  store,
  record,
  modelType,
  groups
) {
  return store.createRecord('membership', {
    id: gri({
      entityType: modelType,
      entityId: get(record, 'entityId'),
      aspect: 'eff_user_membership',
      aspectId: USER_ID,
      scope: 'private',
    }),
    intermediaries: groups.mapBy('id'),
    directMembership: true,
  }).save();
}

function createPrivilegesForModel(
  store,
  record,
  modelType,
  sharedUsers,
  groups,
  privilegesFlags
) {
  return Promise.all([
    createPrivilegesRecords(
      store, record, modelType, sharedUsers, privilegesFlags, 'user'
    ),
    createPrivilegesRecords(
      store, record, modelType, groups, privilegesFlags, 'group'
    ),
  ]);
}

function createPrivilegesRecords(
  store,
  record,
  modelType,
  sharedArray,
  privilegesArray,
  privilegesType
) {
  const sharedGriArray = sharedArray.map(subject => subject.get('id'));
  const recordGri = get(record, 'gri');
  let recordId, subjectId;
  try {
    recordId = parseGri(recordGri).entityId;
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
      entityId: recordId,
      aspect,
      aspectId: subjectId,
    });
    return store.createRecord('privilege', recordData).save();
  }));
}
