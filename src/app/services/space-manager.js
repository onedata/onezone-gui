/**
 * Provides data for routes and components associated with spaces tab
 *
 * @module services/space-manager
 * @author Jakub Liput
 * @copyright (C) 2018-2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import EmberObject, { get, getProperties, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { resolve, all as allFulfilled } from 'rsvp';
import ignoreForbiddenError from 'onedata-gui-common/utils/ignore-forbidden-error';
import gri from 'onedata-gui-websocket-client/utils/gri';
import {
  entityType as spaceEntityType,
  aspects as spaceAspects,
} from 'onezone-gui/models/space';
import { exampleMarkdownLong } from 'onedata-gui-common/utils/mock-data';

/**
 * @typedef {Pick<SpaceSupportParameters, 'dirStatsServiceEnabled'>} SpaceSupportParametersUpdate
 */

// TODO: VFS-10252 prototype of SpaceMarketplaceModel; integrate with backend
/**
 * Target model:
 * - list GRI: `space.null.marketplace_spaces`
 *   - content: `list: [gri1, gri2]`
 * - single marketplace data record: `space.id1.marketplace_data`
 */
const SpaceMarketplaceModel = EmberObject.extend({
  name: '',
  organizationName: '',
  description: '',
  tags: Object.freeze([]),
  spaceId: '',
  isOwned: false,
  supportSize: 0,
  // TODO: VFS-10252 maybe it will be list of GRIs; integrate with backend
  providerIds: Object.freeze([]),
});

// TODO: VFS-10252 mock for SpaceMarketplaceModel
const SpaceMarketplaceData = SpaceMarketplaceModel.extend({
  space: undefined,

  name: reads('space.name'),
  organizationName: reads('space.organizationName'),
  description: reads('space.description'),
  tags: reads('space.tags'),
  spaceId: reads('space.entityId'),
  supportSize: reads('space.totalSize'),
  providerIds: computed('space.supportSizes', function providerIds() {
    return Object.keys(get(this.space, 'supportSizes'));
  }),
});

export default Service.extend({
  store: service(),
  currentUser: service(),
  providerManager: service(),
  harvesterManager: service(),
  groupManager: service(),
  onedataGraph: service(),
  onedataGraphUtils: service(),
  recordManager: service(),
  onedataConnection: service(),

  /**
   * Fetches collection of all spaces
   *
   * @returns {Promise<Models.SpaceList>}
   */
  getSpaces() {
    return this.get('currentUser')
      .getCurrentUserRecord()
      .then(user => user.get('spaceList'))
      .then(spaceList => get(spaceList, 'list')
        .then(() => spaceList)
      );
  },

  /**
   * Returns provider with specified id
   * @param {string} id
   * @returns {Promise<Provider>} space promise
   */
  getRecord(id) {
    return this.get('store').findRecord('space', id);
  },

  getRecordById(entityId) {
    const recordGri = gri({
      entityType: spaceEntityType,
      entityId: entityId,
      aspect: 'instance',
      scope: 'auto',
    });
    return this.getRecord(recordGri);
  },

  /**
   * Creates new space
   * @returns {Promise<Space>}
   */
  createRecord({ name }) {
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => {
        return this.get('store').createRecord('space', {
            name,
            _meta: {
              authHint: ['asUser', get(user, 'entityId')],
            },
          })
          .save()
          .then(space => this.reloadList().then(() => space));
      });
  },

  /**
   * Removes space
   * @param {String} spaceId
   * @returns {Promise}
   */
  removeSpace(spaceId) {
    const recordManager = this.get('recordManager');
    return recordManager.removeRecordById('space', spaceId)
      .then(() => allFulfilled([
        recordManager.reloadUserRecordList('space'),
        recordManager.reloadUserRecordList('provider').then(() =>
          recordManager.reloadRecordListInAllRecords('provider', 'space')
        ),
        recordManager.reloadRecordListInAllRecords('group', 'space'),
        recordManager.reloadRecordListInAllRecords('harvester', 'space'),
      ]));
  },

  /**
   * Reloads space list
   * @returns {Promise<SpaceList>}
   */
  reloadList() {
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => user.belongsTo('spaceList').reload(true))
      .then(spaceList => get(spaceList, 'list'))
      .then(list => list.reload());
  },

  /**
   * Removes user from a space
   * @param {string} entityId
   * @returns {Promise}
   */
  leaveSpace(entityId) {
    const space = this.getLoadedSpaceByEntityId(entityId);
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => user.leaveSpace(entityId))
      .then(destroyResult => {
        return allFulfilled([
          this.reloadList(),
          space ? space.reload().catch(ignoreForbiddenError) : resolve(),
          this.reloadEffUserList(entityId).catch(ignoreForbiddenError),
          this.reloadUserList(entityId).catch(ignoreForbiddenError),
          this.get('providerManager').reloadList(),
        ]).then(() => destroyResult);
      });
  },

  /**
   * Joins user to a space without token
   * @param {string} entityId
   * @returns {Promise}
   */
  joinSpaceAsUser(entityId) {
    const space = this.getLoadedSpaceByEntityId(entityId);
    const {
      currentUser,
      onedataGraph,
    } = this.getProperties('currentUser', 'onedataGraph');
    return currentUser.getCurrentUserRecord()
      .then(user =>
        onedataGraph.request({
          gri: gri({
            entityType: spaceEntityType,
            entityId,
            aspect: 'user',
            aspectId: get(user, 'entityId'),
            scope: 'private',
          }),
          operation: 'create',
          subscribe: false,
        })
      )
      .then(() => allFulfilled([
        space ? space.reload() : resolve(),
        this.reloadUserList(entityId).catch(ignoreForbiddenError),
        this.reloadEffUserList(entityId).catch(ignoreForbiddenError),
        this.get('providerManager').reloadList(),
      ]));
  },

  /**
   * Creates member group for specified space
   * @param {string} spaceEntityId
   * @param {Object} childGroupRepresentation
   * @returns {Promise}
   */
  createMemberGroup(spaceEntityId, childGroupRepresentation) {
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => this.get('onedataGraph').request({
        gri: gri({
          entityType: spaceEntityType,
          entityId: spaceEntityId,
          aspect: 'group',
          scope: 'auto',
        }),
        operation: 'create',
        data: childGroupRepresentation,
        authHint: ['asUser', get(user, 'entityId')],
      }).then(() => {
        return allFulfilled([
          this.reloadGroupList(spaceEntityId).catch(ignoreForbiddenError),
          this.reloadEffGroupList(spaceEntityId).catch(ignoreForbiddenError),
          this.get('groupManager').reloadList(),
        ]);
      }));
  },

  /**
   * Adds group to the members of a space
   * @param {string} spaceEntityId
   * @param {string} groupEntityId
   * @returns {Promise}
   */
  addMemberGroup(spaceEntityId, groupEntityId) {
    return this.get('onedataGraph').request({
      gri: gri({
        entityType: spaceEntityType,
        entityId: spaceEntityId,
        aspect: 'group',
        aspectId: groupEntityId,
        scope: 'auto',
      }),
      operation: 'create',
    }).then(() => {
      return allFulfilled([
        this.reloadGroupList(spaceEntityId).catch(ignoreForbiddenError),
        this.reloadEffGroupList(spaceEntityId).catch(ignoreForbiddenError),
        this.get('groupManager').reloadSpaceList(groupEntityId)
        .catch(ignoreForbiddenError),
      ]);
    });
  },

  /**
   * @param {string} spaceEntityId
   * @param {string} userEntityId
   * @returns {Promise}
   */
  removeUserFromSpace(spaceEntityId, userEntityId) {
    const currentUser = this.get('currentUser');
    const space = this.getLoadedSpaceByEntityId(spaceEntityId);
    return this.get('onedataGraphUtils').leaveRelation(
      spaceEntityType,
      spaceEntityId,
      'user',
      userEntityId
    ).then(() =>
      allFulfilled([
        this.reloadUserList(spaceEntityId).catch(ignoreForbiddenError),
        this.reloadEffUserList(spaceEntityId).catch(ignoreForbiddenError),
        currentUser.runIfThisUser(userEntityId, () => allFulfilled([
          this.reloadList(),
          this.get('providerManager').reloadList(),
          space ? space.reload().catch(ignoreForbiddenError) : resolve(),
        ])),
      ])
    );
  },

  /**
   * @param {string} spaceEntityId
   * @param {string} groupEntityId
   * @returns {Promise}
   */
  leaveSpaceAsGroup(spaceEntityId, groupEntityId) {
    return this.get('onedataGraphUtils').leaveRelation(
      'group',
      groupEntityId,
      spaceEntityType,
      spaceEntityId
    ).then(() =>
      allFulfilled([
        this.reloadGroupList(spaceEntityId).catch(ignoreForbiddenError),
        this.reloadList(),
        this.get('providerManager').reloadList(),
        this.get('groupManager').reloadSpaceList(groupEntityId)
        .catch(ignoreForbiddenError),
      ])
    );
  },

  /**
   * @param {string} spaceEntityId
   * @param {string} groupEntityId
   * @returns {Promise}
   */
  removeGroupFromSpace(spaceEntityId, groupEntityId) {
    return this.get('onedataGraphUtils').leaveRelation(
      spaceEntityType,
      spaceEntityId,
      'group',
      groupEntityId
    ).then(() =>
      allFulfilled([
        this.reloadGroupList(spaceEntityId).catch(ignoreForbiddenError),
        this.reloadEffGroupList(spaceEntityId).catch(ignoreForbiddenError),
        this.reloadList(),
        this.get('providerManager').reloadList(),
        this.get('groupManager').reloadSpaceList(groupEntityId)
        .catch(ignoreForbiddenError),
      ])
    );
  },

  /**
   * Returns already loaded space by entityId (or undefined if not loaded)
   * @param {string} entityId space entityId
   * @returns {Space|undefined}
   */
  getLoadedSpaceByEntityId(entityId) {
    return this.get('store').peekAll('space').findBy('entityId', entityId);
  },

  /**
   * Reloads selected list from space identified by entityId.
   * @param {string} entityId space entityId
   * @param {string} listName e.g. `childList`
   * @returns {Promise}
   */
  reloadModelList(entityId, listName) {
    const space = this.getLoadedSpaceByEntityId(entityId);
    return space ? space.reloadList(listName) : resolve();
  },

  /**
   * Reloads groupList of space identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId group entityId
   * @returns {Promise}
   */
  reloadGroupList(entityId) {
    return this.reloadModelList(entityId, 'groupList');
  },

  /**
   * Reloads effGroupList of space identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId group entityId
   * @returns {Promise}
   */
  reloadEffGroupList(entityId) {
    return this.reloadModelList(entityId, 'effGroupList');
  },

  /**
   * Reloads userList of space identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId group entityId
   * @returns {Promise}
   */
  reloadUserList(entityId) {
    return this.reloadModelList(entityId, 'userList');
  },

  /**
   * Reloads effUserList of space identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId group entityId
   * @returns {Promise}
   */
  reloadEffUserList(entityId) {
    return this.reloadModelList(entityId, 'effUserList');
  },

  ceaseOneproviderSupport(space, provider) {
    const {
      entityType,
      entityId,
    } = getProperties(space, 'entityType', 'entityId');
    const aspectId = get(provider, 'entityId');
    const ceaseGri = gri({
      entityType,
      entityId,
      aspect: 'provider',
      aspectId,
    });
    return this.get('onedataGraph').request({
        operation: 'delete',
        gri: ceaseGri,
        scope: 'private',
      })
      .then(() => space.belongsTo('providerList').reload())
      .finally(() => this.get('currentUser').getCurrentUserRecord()
        .then(user => {
          return user.belongsTo('providerList').reload()
            .then(userProviderList => {
              const providerStillPresent = userProviderList
                .hasMany('list').ids().includes(get(provider, 'id'));
              if (providerStillPresent) {
                return provider.belongsTo('spaceList').reload();
              }
            });
        })
      );
  },

  /**
   * @param {string} spaceId
   * @param {string} providerId
   * @param {SpaceSupportParametersUpdate} spaceSupportParametersUpdate
   * @returns {Promise<void>}
   */
  async modifySupportParameters(spaceId, providerId, spaceSupportParametersUpdate) {
    const {
      onedataGraph,
      recordManager,
    } = this.getProperties('onedataGraph', 'recordManager');

    const requestGri = gri({
      entityType: spaceEntityType,
      entityId: spaceId,
      aspect: spaceAspects.supportParameters,
      aspectId: providerId,
    });
    await onedataGraph.request({
      operation: 'update',
      gri: requestGri,
      data: spaceSupportParametersUpdate,
    });

    try {
      await recordManager.reloadRecordById('space', spaceId);
    } catch (error) {
      console.error(
        'service:space-manager: Cannot reload space model after support parameters modification due to:',
        error
      );
    }
  },

  // TODO: VFS-10252 it will be probably live list
  async getSpacesMarketplaceData() {
    // TODO: VFS-10252 integrate with backend
    // const requestGri = gri({
    //   entityType: 'space',
    //   entityId: 'null',
    //   aspect: 'marketplace_spaces',
    // });
    // TODO: VFS-10252 creating mock of space marketplace records
    const allSpaces = (await this.getSpaces()).get('list').toArray();
    const advertisedSpaces = allSpaces
      .filter(space => get(space, 'advertisedInMarketplace'));
    const ownedSpaces = advertisedSpaces.map(space =>
      SpaceMarketplaceData.create({
        space,
        isOwned: true,
      })
    );
    return [
      ...ownedSpaces,
      SpaceMarketplaceModel.create({
        name: 'Shared space number one Shared space number one Shared space number one',
        organizationName: 'ACK Cyfronet AGH',
        tags: ['large', 'experimental', 'scientific'],
        description: exampleMarkdownLong,
        isOwned: false,
        spaceId: 'space-10',
        supportSize: 1000000000,
        providerIds: ['oneprovider1', 'oneprovider2'],
      }),
      SpaceMarketplaceModel.create({
        name: 'Xyz space',
        organizationName: 'Uniwersytet Jagielloński',
        tags: ['small', 'scientific'],
        description: 'Lorem ipsum dolor sit amet, qui minim labore adipisicing minim sint cillum sint consectetur cupidatat. Lorem ipsum dolor sit amet, qui minim labore adipisicing minim sint cillum sint consectetur cupidatat. Lorem ipsum dolor sit amet, qui minim labore adipisicing minim sint cillum sint consectetur cupidatat.',
        isOwned: false,
        spaceId: 'space-11',
        supportSize: 300000000,
        providerIds: ['oneprovider2', 'oneprovider3'],
      }),
    ];
  },

  // TODO: VFS-10252 mock of successful response; integrate with backend
  /**
   * @param {SpaceAccessRequestMessageData} requestData
   * @returns {Promise}
   */
  async requestSpaceAccess( /* requestData */ ) {
    return {};
    // const requestGri = gri({
    //   entityType: spaceEntityType,
    //   entityId: requestData.spaceId,
    //   aspect: 'request_membership',
    // });
    // return this.onedataGraph.request({
    //   gri: requestGri,
    //   operation: 'create',
    //   subscribe: false,
    // });
  },

  // TODO: VFS-10252 mock of possible implementation; integrate with backend
  getAvailableSpaceTags() {
    return this.onedataConnection.availableSpaceTags;
  },
});
