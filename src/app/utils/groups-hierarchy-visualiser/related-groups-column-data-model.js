/**
 * FIXME:
 *
 * @author Jakub Liput
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { OwsGraphOperation } from 'onedata-gui-websocket-client/services/onedata-graph';
import { DebouncedBatchFlushStrategy } from 'onedata-gui-websocket-client/utils/batch-flush-strategies';
import GrisBatchContainerSpec from 'onedata-gui-websocket-client/utils/gris-batch-container-spec';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { entityType as groupEntityType } from 'onezone-gui/models/group';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import BatchRecordsLoader from '../batch-records-loader';

/** @import BatchRequestRegistryService from '../../lib/onedata-gui-websocket-client/addon/services/batch-request-registry' */
/** @import BatchRequestContainer from '../../lib/onedata-gui-websocket-client/addon/utils/batch-request-container' */

/**
 * @implements {GroupsHierarchyColumnDataModel}
 */
export default class RelatedGroupsDataModel {
  /**
   * @param {Models.Group} group
   * @param {'parent'|'child'} relationName
   * @param {BatchRequestRegistryService} batchRequestRegistry
   */
  constructor(group, relationName, batchRequestRegistry) {
    this.group = group;
    this.batchRequestRegistry = batchRequestRegistry;
    this.relationName = relationName;
    this.listLoaderProxy = promiseObject(this.#resolveListLoader());
    this.childrenLoaderProxy = promiseObject(this.#resolveChildrenLoader());
    this.parentsLoaderProxy = promiseObject(this.#resolveParentsLoader());
    this.groupsProxy = this.#createGroupsProxy();
  }

  get groupListProxy() {
    const listName = `${this.relationName}List`;
    return this.group[listName];
  }

  #createGroupsProxy() {
    const groupsPromise = (async () => {
      const listLoader = await this.listLoaderProxy;
      await listLoader.getPromise();
      // We want to return a GroupList instance - the loader returns an array of groups.
      return await this.groupListProxy;
    })();
    return promiseObject(groupsPromise);
  }

  async #resolveListLoader() {
    return this.#resolveLoader();
  }

  async #resolveChildrenLoader() {
    return this.#resolveLoader((id) => {
      return gri({
        entityType: groupEntityType,
        entityId: parseGri(id).entityId,
        aspect: 'children',
        scope: 'private',
      });
    });
  }

  async #resolveParentsLoader() {
    return this.#resolveLoader((id) => {
      return gri({
        entityType: groupEntityType,
        entityId: parseGri(id).entityId,
        aspect: 'parents',
        scope: 'private',
      });
    });
  }

  /**
   * @param {(gri: string) => string} griGenerator Convert group instance GRI into target
   *   GRI (eg. child list of the group).
   * @returns {Promise<BatchRecordsLoader>}
   */
  async #resolveLoader(griGenerator = (id) => id) {
    const groupList = await this.groupListProxy;
    const groupGris = groupList.hasMany('list').ids();
    const itemsGris = groupGris.map(id => griGenerator(id));
    return new BatchRecordsLoader({
      batchRequestRegistry: this.batchRequestRegistry,
      itemsGris,
      listResolver: async () => {
        return (await groupList.list).toArray();
      },
    });
  }
}
