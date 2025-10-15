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

/** @import BatchRequestRegistryService from '../../lib/onedata-gui-websocket-client/addon/services/batch-request-registry' */
/** @import BatchRequestContainer from '../../lib/onedata-gui-websocket-client/addon/utils/batch-request-container' */

/**
 * @implements {GroupHierarchyColumnDataModel}
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
    this.listContainerProxy = promiseObject(this.#resolveListBatchContainer());
    this.childrenContainerProxy = this.#resolveChildrenBatchContainer();
    this.parentsContainerProxy = this.#resolveParentsBatchContainer();
    this.groupsProxy = this.#createGroupsProxy();
  }

  get groupListProxy() {
    const listName = `${this.relationName}List`;
    return this.group[listName];
  }

  /** @override */
  destroy() {
    const containers = [
      this.listContainerProxy.content,
      this.childrenContainerProxy.content,
      this.parentsContainerProxy.content,
    ].filter(Boolean);
    for (const container of containers) {
      try {
        this.batchRequestRegistry.destroyContainer(container);
      } catch (error) {
        console.error(error);
      }
    }
  }

  #createGroupsProxy() {
    const groupsPromise = (async () => {
      const listContainer = await this.listContainerProxy;
      const listProxy = (await this.groupListProxy).list;
      this.batchRequestRegistry.flushAndDestroy(listContainer);
      listContainer.scheduleFlush();
      await listProxy;
      return await this.groupListProxy;
    })();
    return promiseObject(groupsPromise);
  }

  // FIXME: usunąć redundancję w tworzeniu kontenterów

  async #resolveListBatchContainer() {
    return this.#resolveBatchContainer();
  }

  async #resolveChildrenBatchContainer() {
    return this.#resolveBatchContainer((id) => {
      return gri({
        entityType: groupEntityType,
        entityId: parseGri(id).entityId,
        aspect: 'children',
        scope: 'private',
      });
    });
  }

  async #resolveParentsBatchContainer() {
    return this.#resolveBatchContainer((id) => {
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
   * @returns {Promise<BatchRequestContainer>}
   */
  async #resolveBatchContainer(griGenerator = (id) => id) {
    const groupList = await this.groupListProxy;
    const groupGris = groupList.hasMany('list').ids();
    const targetGris = groupGris.map(id => griGenerator(id));
    const containerSpec = new GrisBatchContainerSpec(
      OwsGraphOperation.Get,
      targetGris
    );
    return await this.batchRequestRegistry.createContainer(
      containerSpec,
      DebouncedBatchFlushStrategy
    );
  }

  // FIXME: ta klasa mogłaby robić wzsystko sama na podstawie przekanaznego group (lub groupList) i relationName
  // - groupsProxy: (await group[listName]).list -> ale przed jego ewaluacją należy użyć containera
  // - listBatchContainer: container zawierający idki powyższych grup, używany wewnętrznie, może być użyty do pokazania progressu w przyszłości
  // - childrenBatchContainer: container zawierający idki list children dla powyższych grup
  //   w swoim cyklu życia jest inicjalizowany od razu przy konstrukcji, więc zacznie od razu zbierać requesty
  //   trzeba uruchomić jego flush, najlepiej kiedy zakończy się render całej listy grup
  // - parentsBatchContainer: jw. tylko dla parentów
}
