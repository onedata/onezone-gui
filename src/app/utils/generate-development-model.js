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
import _ from 'lodash';
import { A } from '@ember/array';
import { Promise, resolve, all as allFulfilled, hash as hashFulfilled } from 'rsvp';
import { get, set } from '@ember/object';
import groupPrivilegesFlags from 'onedata-gui-websocket-client/utils/group-privileges-flags';
import spacePrivilegesFlags from 'onedata-gui-websocket-client/utils/space-privileges-flags';
import harvesterPrivilegesFlags from 'onedata-gui-websocket-client/utils/harvester-privileges-flags';
import { inviteTokenSubtypeToTargetModelMapping } from 'onezone-gui/models/client-token';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import gri from 'onedata-gui-websocket-client/utils/gri';
import moment from 'moment';

const USER_ID = 'stub_user_id';
const USERNAME = 'Stub User';
const USER_LOGIN = 'stub_user';
const NUMBER_OF_SHARED_USERS = 3;
const NUMBER_OF_PROVIDERS = 3;
const NUMBER_OF_SPACES = 3;
const NUMBER_OF_CLIENT_TOKENS = 3;
const NUMBER_OF_GROUPS = 10;
const NUMBER_OF_HARVESTERS = 3;
const LINKED_ACCOUNT_TYPES = ['plgrid', 'indigo', 'google'];

const types = [
  'space',
  'group',
  'provider',
  'linkedAccount',
  'cluster',
  'harvester',
  'clientToken',
];
const names = ['one', 'two', 'three'];

const privileges = {
  space: spacePrivilegesFlags,
  group: groupPrivilegesFlags,
  harvester: harvesterPrivilegesFlags,
};

const perProviderSize = Math.pow(1024, 4);

/**
 * @export
 * @function
 * @param {EmberData.Store} store
 * @returns {Promise<undefined, any>}
 */
export default function generateDevelopmentModel(store) {
  let sharedUsers, groups, spaces, providers, harvesters;

  return createGuiMessages(store)
    // create shared users
    .then(() => createSharedUsersRecords(store))
    .then(su => sharedUsers = su)
    // create main resources lists
    .then(() => hashFulfilled(
      types.reduce((promiseHash, type) => {
        promiseHash[type] = createEntityRecords(store, type, names)
          .then(records => {
            switch (type) {
              case 'group':
                groups = records;
                break;
              case 'space':
                spaces = records;
                break;
              case 'provider':
                providers = records;
                break;
              case 'harvester':
                harvesters = records;
                break;
            }
            return createListRecord(store, type, records);
          });
        return promiseHash;
        }, {}
      )
    ))
    .then(listRecords => attachModelsToInviteTokens(listRecords).then(() => listRecords))
    // push space list into providers
    .then(listRecords => {
      const providers = listRecords.provider.get('list');
      const spaces = listRecords.space.get('list');
      return allFulfilled([providers, spaces])
        .then(([providerList, spacesList]) =>
          allFulfilled(providerList.map(provider =>
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
      const providers = listRecords.provider.get('list');
      const spaces = listRecords.space.get('list');
      const clusters = listRecords.cluster.get('list');
      return allFulfilled([providers, spaces, clusters])
        .then(([providerList, spaceList, clusterList]) =>
          allFulfilled(spaceList.map(space => {
            space.set('supportSizes', _.zipObject(
              get(providers, 'content').mapBy('entityId'),
              _.fill(Array(NUMBER_OF_PROVIDERS), perProviderSize)
            ));
            return createListRecord(store, 'provider', providerList).then(lr => {
              space.set('providerList', lr);
              return space.save();
            });
          }))
          .then(() => allFulfilled(clusterList.map(cluster => {
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
    .then(listRecords => listRecords.group.get('list')
      .then(records =>
        allFulfilled(records.map(record =>
          allFulfilled([
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
      .then(() => listRecords.space.get('list')
        .then(records =>
          allFulfilled(records.map(record =>
            allFulfilled([
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
      .then(() => listRecords.harvester.get('list')
        .then(records =>
          allFulfilled(records.map(record =>
            allFulfilled([
              attachSharedUsersGroupsToModel(
                store, record, 'harvester', false, sharedUsers, groups
              ),
              attachSharedUsersGroupsToModel(
                store, record, 'harvester', true, sharedUsers, groups
              ),
              attachMembershipsToModel(
                store, record, 'harvester', groups
              ),
              attachSpacesToModel(store, record, spaces),
            ])
          ))
        )
      )
      .then(() => allFulfilled(['space', 'group', 'harvester'].map(modelType => {
        return listRecords[modelType].get('list')
          .then(records =>
            allFulfilled(records.map(record =>
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
    .then(listRecords =>
      attachProgressToHarvesterIndices(store, harvesters, spaces, providers)
      .then(() => listRecords)
    )
    .then(listRecords => createUserRecord(store, listRecords));
}

function createGuiMessages(store) {
  const messages = [{
    name: 'privacy_policy',
    body: '<p>Privacy policy</p>',
  }, {
    name: 'cookie_consent_notification',
    body: 'We use cookies for navigation purposes and holding user session state. For more details see our [privacy-policy]privacy policy[/privacy-policy].',
  }, {
    name: 'signin_notification',
    body: 'Onezone will be down for two months. You have 20 seconds to migrate your data. 19... 18...',
  }];

  return allFulfilled(messages.map(({ name, body }) => {
    const messageGri = gri({
      entityType: 'oz_worker',
      entityId: 'null',
      aspect: 'gui_message',
      aspectId: name,
      scope: 'private',
    });
    return store.createRecord('guiMessage', {
      id: messageGri,
      gri: messageGri,
      enabled: true,
      body,
    }).save();
  }));
}

function createUserRecord(store, listRecords) {
  return listRecords.space.get('list')
    .then(list => list.get('length') > 0 ? list.get('firstObject ') : null)
    .then(space => space && space.get('entityId'))
    .then(defaultSpaceId => {
      const userRecord = store.createRecord('user', {
        id: store.userGri(USER_ID),
        fullName: USERNAME,
        basicAuthEnabled: true,
        hasPassword: false,
        username: USER_LOGIN,
        defaultSpaceId,
      });
      Object.values(listRecords).forEach(lr =>
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
    case 'harvester':
      return createHarvesterRecords(store, additionalInfo);
    default:
      return allFulfilled(names.map(number =>
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
  return allFulfilled(_.range(NUMBER_OF_PROVIDERS).map((index) => {
    let sign = index % 2 ? -1 : 1;
    const providerId = `oneprovider-${index + 1}`;
    const id = `provider.${providerId}.instance:auto`;
    return store.createRecord('provider', {
      id,
      gri: id,
      name: `Provider ${index}`,
      latitude: ((180 / (NUMBER_OF_PROVIDERS + 1)) * (index + 1) - 90) *
        sign,
      longitude: (360 / (NUMBER_OF_PROVIDERS + 1)) * (index + 1) - 180,
      online: [true, false][index % 2],
      host: `${providerId}.local-onedata.org`,
    }).save();
  }));
}

function createSpacesRecords(store) {
  return allFulfilled(_.range(NUMBER_OF_SPACES).map((index) => {
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
  const promises = [];
  _.range(NUMBER_OF_CLIENT_TOKENS).forEach((i) => {
    const accessTokenPromise = store.createRecord('clientToken', {
      name: 'Access token ' + i,
      type: {
        accessToken: {},
      },
    }).save();
    const inviteSubtypes = Object.keys(inviteTokenSubtypeToTargetModelMapping);
    const inviteTokenPromises = inviteSubtypes
      .map((subtype, j)  => {
        return store.createRecord('clientToken', {
          name: 'Invite token ' + (i * inviteSubtypes.length + j),
          type: {
            inviteToken: { subtype },
          },
        }).save();
      });
    promises.push(accessTokenPromise, ...inviteTokenPromises);
    // return Promise.all([accessTokenPromise, ...inviteTokenPromises]);
  });
  return allFulfilled(promises);
}

function createGroupsRecords(store) {
  return allFulfilled(_.range(NUMBER_OF_GROUPS).map((index) => {
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
  return allFulfilled(LINKED_ACCOUNT_TYPES.map(idp =>
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
  const onezoneId = clusterInstanceGri('onezone');
  const oneprovider1Id = clusterInstanceGri('oneprovider-1');
  const oneprovider2Id = clusterInstanceGri('oneprovider-2');
  return allFulfilled([{
      id: onezoneId,
      gri: onezoneId,
      type: 'onezone',
      name: 'PL-Grid',
      onepanelProxy: true,
      hasViewPrivilege: true,
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
      id: oneprovider1Id,
      gri: oneprovider1Id,
      type: 'oneprovider',
      name: 'Cyfronet',
      onepanelProxy: false,
      provider: 'provider.oneprovider-1.instance:auto',
      hasViewPrivilege: true,
      info: {
        creatorType: 'root',
        creatorId: '',
        creationTime: 1550156285,
      },
      workerVersion: {
        release: '18.02.*',
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
      id: oneprovider2Id,
      gri: oneprovider2Id,
      type: 'oneprovider',
      name: 'PCSS',
      onepanelProxy: true,
      provider: 'provider.oneprovider-2.instance:auto',
      hasViewPrivilege: false,
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

function createHarvesterRecords(store) {
  return allFulfilled(_.range(NUMBER_OF_HARVESTERS).map((index) => {
    return store.createRecord('harvester', {
      name: `Harvester ${index}`,
      scope: 'private',
      plugin: 'elasticsearch_plugin',
      endpoint: '127.0.0.1:9200',
      directMembership: true,
      canViewPrivileges: true,
      public: false,
      info: {
        creationTime: 1540995468,
      },
    }).save().then(record =>
      store.createRecord('harvesterGuiPluginConfig', {
        id: gri({
          entityType: 'harvester',
          entityId: get(record, 'entityId'),
          aspect: 'gui_plugin_config',
          scope: 'private',
        }),
        config: {
          studyIdTypeMapping: [
            { id: 11, name: 'Trial Registry ID' },
            { id: 'founderId', name: 'Founder ID' },
          ],
          typeMapping: [
            { id: 0, name: 'Type 0' },
            { id: 1, name: 'Type 1' },
            { id: 2, name: 'Type 2' },
            { id: 3, name: 'Type 3' },
            { id: 4, name: 'Type 4' },
            { id: 5, name: 'Type 5' },
          ],
          accessTypeMapping: [
            { id: 0, name: 'Public' },
            { id: 1, name: 'Private' },
          ],
          publisherMapping: [
            { id: 0, name: 'Publisher 0' },
            { id: 1, name: 'Publisher 1' },
            { id: 2, name: 'Publisher 2' },
            { id: 3, name: 'Publisher 3' },
          ],
        },
      }).save().then(() => record)
    ).then(record => {
      return allFulfilled(_.range(3).map((index) => {
          return store.createRecord('index', {
            id: gri({
              entityType: 'harvester',
              entityId: get(record, 'entityId'),
              aspect: 'index',
              aspectId: 'index' + index,
              scope: 'private',
            }),
            name: `Index ${index}`,
            schema: '{}',
          }).save();
        }))
        .then(records => createListRecord(store, 'index', records))
        .then(listRecord => record.set('indexList', listRecord))
        .then(() => record);
    });
  }));
}

function createSharedUsersRecords(store) {
  return allFulfilled(_.range(NUMBER_OF_SHARED_USERS).map((index) => {
    return store.createRecord('sharedUser', { name: `sharedUser${index}` }).save();
  }));
}

function attachModelsToInviteTokens(listRecords) {
  return listRecords.clientToken.get('list').then(tokensList =>
    allFulfilled(tokensList
      .filter(token => get(token, 'typeName') === 'invite')
      .map(token => {
        const subtype = get(token, 'tokenSubtype');
        const modelMapping = inviteTokenSubtypeToTargetModelMapping[subtype];
        const targetRecordsList = listRecords[modelMapping.modelName];
        if (targetRecordsList) {
          return targetRecordsList.get('list')
            .then(modelList => modelList.objectAt(0))
            .then(model => {
              const existingTokenType = get(token, 'type');
              const newTokenType = {
                inviteToken: Object.assign({}, existingTokenType.inviteToken, {
                  [modelMapping.idFieldName]: get(model, 'entityId'),
                }),
              };
              set(token, 'type', newTokenType);
              return token.save();
            });
        } else {
          return resolve();
        }
      })
    )
  );
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

function attachSpacesToModel(store, record, spaces) {
  return createListRecord(store, 'space', spaces)
    .then(list => {
      record.set('spaceList', list);
      return record.save();
    });
}

function createPrivilegesForModel(
  store,
  record,
  modelType,
  sharedUsers,
  groups,
  privilegesFlags
) {
  return allFulfilled([
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
  return allFulfilled(_.range(sharedGriArray.length).map((index) => {
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

function clusterInstanceGri(entityId) {
  return gri({
    entityType: 'cluster',
    entityId,
    aspect: 'instance',
    scope: 'auto',
  });
}

function attachProgressToHarvesterIndices(
  store,
  harvesters,
  spaces,
  providers
) {
  const harvestersNumber = get(harvesters, 'length');
  const perHarvesterSeq = 100;
  const maxSeq = perHarvesterSeq * harvestersNumber;
  const lastUpdate = moment().unix();
  return allFulfilled(harvesters.map((harvester, harvesterIndex) => {
    const harvesterEntityId = get(harvester, 'entityId');
    return get(harvester, 'indexList')
      .then(indexList => get(indexList, 'list'))
      .then(indices => {
        const indicesNumber = get(indices, 'length');
        const perIndexSeq = Math.ceil(perHarvesterSeq / indicesNumber);
        return allFulfilled(indices.map((index, indexIndex) => {
          const indexEntityId = get(index, 'aspectId');
          const currentSeq = harvesterIndex * perHarvesterSeq +
            Math.min((indexIndex + 1) * perIndexSeq, perHarvesterSeq);
          const indexStats = {};
          spaces.forEach(space => {
            const spaceProgress = {};
            const spaceEntityId = get(space, 'entityId');
            set(indexStats, spaceEntityId, spaceProgress);
            providers.forEach(provider => {
              const providerEntityId = get(provider, 'entityId');
              set(spaceProgress, providerEntityId, {
                maxSeq,
                currentSeq,
                lastUpdate,
                error: null,
                archival: false,
              });
            });
          });
          return store.createRecord('indexStat', {
            id: gri({
              entityType: 'harvester',
              entityId: harvesterEntityId,
              aspect: 'index_stats',
              aspectId: indexEntityId,
              scope: 'private',
            }),
            indexStats,
          }).save();
        }));
      });
  }));
}
