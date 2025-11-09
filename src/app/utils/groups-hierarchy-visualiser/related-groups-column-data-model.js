/**
 * Implementation of ColumnDataModel for column containing list of groups related to other
 * groups. Eg. children groups of a group.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { entityType as groupEntityType } from 'onezone-gui/models/group';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import BatchRecordsLoader from 'onezone-gui/utils/batch-records-loader';
import { reject } from 'rsvp';
import { computed } from '@ember/object';

/** @import BatchRequestRegistryService from '../../lib/onedata-gui-websocket-client/addon/services/batch-request-registry' */

/**
 * @implements {GroupsHierarchyColumnDataModel}
 */
export default class RelatedGroupsColumnDataModel {
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
    this.groupListProxy = this.#createGroupListProxy();
  }

  /**
   * Resolves groupList from provided group. Only for internal use, because public
   * groupListProxy should use batch loading.
   * @type {PromiseObject<GroupList>}
   */
  @computed('group.{hasViewPrivilege,childList,parentList}')
  get groupListRelationProxy() {
    const listName = `${this.relationName}List`;
    const listModelProxy = this.group[listName];
    if (!this.group.hasViewPrivilege || !listModelProxy) {
      return reject({ id: 'forbidden' });
    }
    return listModelProxy;
  }

  #createGroupListProxy() {
    const groupsPromise = (async () => {
      const listLoader = await this.listLoaderProxy;
      await listLoader.getPromise();
      // We want to return a GroupList instance - the loader returns an array of groups.
      return await this.groupListRelationProxy;
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
    const groupList = await this.groupListRelationProxy;
    const groupGris = groupList?.hasMany('list').ids() ?? [];
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
