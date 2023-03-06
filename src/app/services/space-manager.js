/**
 * Provides data for routes and components associated with spaces tab
 *
 * @module services/space-manager
 * @author Jakub Liput
 * @copyright (C) 2018-2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { get, getProperties } from '@ember/object';
import { resolve, all as allFulfilled, allSettled } from 'rsvp';
import ignoreForbiddenError from 'onedata-gui-common/utils/ignore-forbidden-error';
import gri from 'onedata-gui-websocket-client/utils/gri';
import {
  entityType as spaceEntityType,
  aspects as spaceAspects,
} from 'onezone-gui/models/space';
import {
  generateGri as generateSpaceMarketplaceInfoGri,
} from 'onezone-gui/models/space-marketplace-info';

export const listMarketplaceAspect = 'list_marketplace';

/**
 * @typedef {Pick<SpaceSupportParameters, 'dirStatsServiceEnabled'>} SpaceSupportParametersUpdate
 */

/**
 * The same properties as in `Models.SpaceMarketplaceInfo` model.
 * @typedef {Object} SpaceMarketplaceRawData
 */

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

  // TODO: VFS-10384 mock of successful response; integrate with backend
  /**
   * @param {SpaceAccessRequestMessageData} requestData
   * @returns {Promise}
   */
  async requestSpaceAccess(requestData) {
    const requestGri = gri({
      entityType: spaceEntityType,
      entityId: requestData.spaceId,
      aspect: 'membership_request',
    });
    return this.onedataGraph.request({
      gri: requestGri,
      operation: 'create',
      data: {
        contactEmail: requestData.contactEmail,
        message: requestData.message,
      },
      subscribe: false,
    });
  },

  /**
   * Maps: categoryName -> Array of available tags.
   * @returns {Object<string, Array<string>>}
   */
  getAvailableSpaceTags() {
    const availableSpaceTags = this.onedataConnection.availableSpaceTags;
    return (availableSpaceTags && typeof availableSpaceTags === 'object') ?
      availableSpaceTags : {};
  },

  // TODO: VFS-10384 integrate with backend
  async checkSpaceAccessRequest(spaceId, requestId) {
    const requestGri = gri({
      entityType: spaceEntityType,
      entityId: spaceId,
      aspect: 'membership_request',
      aspectId: requestId,
    });
    return this.onedataGraph.request({
      gri: requestGri,
      operation: 'get',
      subscribe: false,
    });
  },

  /**
   * @param {string} spaceId
   * @param {string} requestId
   * @param {boolean} grantAccess If true, user will gain access to the space and request
   *   will be resolved. If false, request will be rejected and user will receive
   *   information about rejection via e-mail.
   */
  async resolveMarketplaceSpaceAccess(spaceId, requestId, grantAccess) {
    const requestGri = gri({
      entityType: spaceEntityType,
      entityId: spaceId,
      aspect: 'resolve_membership_request',
    });
    return this.onedataGraph.request({
      gri: requestGri,
      operation: 'create',
      subscribe: false,
      data: {
        requestId,
        grant: grantAccess,
      },
    });
  },

  // FIXME: maybe unnecessary
  async grantSpaceAccess(spaceId, requestId) {
    return this.resolveMarketplaceSpaceAccess(spaceId, requestId, true);
  },

  // FIXME: maybe unnecessary
  async rejectSpaceAccess(spaceId, requestId) {
    return this.resolveMarketplaceSpaceAccess(spaceId, requestId, false);
  },

  /**
   * @param {InfiniteScrollListingParams} listingParams
   * @param {Array<string>} [tags]
   * @returns {Promise<{ list: Array<{ spaceId: string, index: string }>, isLast: boolean }>}
   */
  async fetchSpacesMarkeplaceIds(listingParams, tags) {
    const requestGri = gri({
      entityType: 'space',
      entityId: 'null',
      aspect: listMarketplaceAspect,
      scope: 'protected',
    });
    const data = { ...listingParams };
    if (tags) {
      data.tags = tags;
    }
    return await this.onedataGraph.request({
      gri: requestGri,
      operation: 'create',
      data,
      subscribe: false,
    });
  },

  // TODO: VFS-10524 use LS+ version of spaces marketplace info listing in list view
  /**
   * @param {InfiniteScrollListingParams} listingParams
   * @param {Array<string>} tags
   * @returns {Promise<{ list: Array<SpaceMarketplaceRawData>, isLast: boolean }>}
   */
  async fetchSpacesMarkeplaceRawData(listingParams, tags) {
    const requestGri = gri({
      entityType: 'space',
      entityId: 'null',
      aspect: 'list_marketplace_with_data',
      scope: 'protected',
    });
    const data = { ...listingParams };
    if (tags) {
      data.tags = tags;
    }
    return await this.onedataGraph.request({
      gri: requestGri,
      operation: 'create',
      data,
      subscribe: false,
    });
  },

  /**
   * @param {InfiniteScrollListingParams} listingParams
   * @param {Array<string>} [tags]
   * @returns {Promise<{ array: Array<Models.SpaceMarketplaceInfo>, isLast: boolean }>}
   */
  async fetchSpacesMarkeplaceInfoRecords(listingParams, tags) {
    const { list: idsList, isLast } = await this.fetchSpacesMarkeplaceIds(
      listingParams,
      tags
    );
    const recordsPromises = idsList.map(({ spaceId }) =>
      this.getSpaceMarketplaceInfo(spaceId)
    );
    const promiseStates = await allSettled(recordsPromises);
    const array = promiseStates
      .filter(promiseState => promiseState.state === 'fulfilled')
      .map(promiseState => promiseState.value);
    // protection for arrays with only failed items
    const effIsLast = (listingParams.limit && !array.length) ? true : isLast;
    return {
      array,
      isLast: effIsLast,
    };
  },

  async getSpaceMarketplaceInfo(spaceId) {
    return this.store.findRecord(
      'spaceMarketplaceInfo',
      generateSpaceMarketplaceInfoGri(spaceId)
    );
  },
});
