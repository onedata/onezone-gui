/**
 * Provides project-specific, custom logic to record-manager service.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get } from '@ember/object';
import _ from 'lodash';
import { Promise } from 'rsvp';
import ignoreForbiddenError from 'onedata-gui-common/utils/ignore-forbidden-error';
import ignoreNotFoundError from 'onedata-gui-common/utils/ignore-not-found-error';

/**
 * Describes which lists of records should be additionally reloaded when
 * user/group relation with model type (key in this map) has been removed.
 */
const customListsToReloadForRemovedMembership = Object.freeze({
  space: ['provider'],
  group: ['atmInventory', 'cluster', 'harvester', 'provider', 'space'],
});

export default class RecordManagerConfiguration {
  constructor(recordManager) {
    this.recordManager = recordManager;
  }

  /**
   * Computes array of gri objects, which then can be used to perform
   * relation removal. Order of the returned possibilites matters.
   * @param {String} relationOriginModelName
   * @param {String} relationOriginRecordId
   * @param {String} relationTargetModelName
   * @param {String} relationTargetRecordId
   * @param {String|undefined} [relationType=undefined]
   *   one of `'parent'`, `'child'` or undefined (default). Values other than
   *   `undefined` are not handled yet. TODO: VFS-6243
   * @returns {Array<Object>} object format:
   * ```
   * {
   *   entityType: String,
   *   entityId: String,
   *   aspect: String,
   *   aspectId: String,
   * }
   * ```
   */
  async getRemoveRelationPossibilities(
    relationOriginModelName,
    relationOriginRecordId,
    relationTargetModelName,
    relationTargetRecordId,
    relationType = undefined
  ) {
    const currentUserId = get(
      this.recordManager.getCurrentUserRecord(),
      'entityId'
    );

    const relationSides = [{
      modelName: relationOriginModelName,
      recordId: relationOriginRecordId,
    }, {
      modelName: relationTargetModelName,
      recordId: relationTargetRecordId,
    }];
    relationSides.forEach(side => {
      side.entityType = this.recordManager
        .getEntityTypeForModelName(side.modelName);
      side.isUser = side.modelName === 'user';
      side.isCurrentUser = side.isUser && side.recordId == currentUserId;
    });

    switch (relationType) {
      // TODO: VFS-6243 Add other `relationType` values handling
      default: {
        // Is an array of arrays, where each array has two (ordered) elements
        // describing relation. Is needed, because relation can be destroyed from
        // any side of the relation.
        let relationsRemoveOrder;

        if (relationSides[0].isUser && !relationSides[0].isCurrentUser) {
          // Cannot remove relation as a user other than current.
          relationsRemoveOrder = [
            [relationSides[1], relationSides[0]],
          ];
        } else if (relationSides[1].isUser && !relationSides[1].isCurrentUser) {
          // The same as above.
          relationsRemoveOrder = [
            [relationSides[0], relationSides[1]],
          ];
        } else {
          // None of the relations sides are a non-current user.
          relationsRemoveOrder = [
            [relationSides[0], relationSides[1]],
            [relationSides[1], relationSides[0]],
          ];
          if (relationSides[1].isCurrentUser) {
            // Removing relation should start with removing it from the side of
            // current user.
            relationsRemoveOrder.reverse();
          } else if (_.isEqual(
              relationSides.mapBy('modelName').sort(),
              ['atmInventory', 'atmLambda']
            )) {
            // AtmLambda can be removed from the AtmInventory only via relation
            // atmLambda -> atmInventory.
            relationsRemoveOrder = [
              [
                relationSides.findBy('modelName', 'atmLambda'),
                relationSides.findBy('modelName', 'atmInventory'),
              ],
            ];
          }
        }

        return relationsRemoveOrder.map(([relationSide1, relationSide2]) => ({
          entityType: relationSide1.entityType,
          entityId: relationSide1.recordId,
          aspect: relationSide2.entityType,
          aspectId: relationSide2.recordId,
        }));
      }
    }
  }

  /**
   * Performs all needed work after removing record (like reloading other records).
   * @param {String} modelName
   * @param {GraphModel} record
   */
  async onRecordRemove(modelName, record) {
    await this.recordManager.reloadUserRecordList(modelName);

    switch (modelName) {
      case 'atmWorkflowSchema': {
        if (!record) {
          return;
        }
        const atmInventory = record.belongsTo('atmInventory').value();
        if (atmInventory) {
          await this.recordManager.reloadRecordList(atmInventory, modelName);
        }
        break;
      }
    }
  }

  /**
   * Performs all needed work after removing relation (like reloading records).
   * @param {String} relationOriginModelName
   * @param {String} relationOriginRecordId
   * @param {String} relationTargetModelName
   * @param {String} relationTargetRecordId
   * @param {String|undefined} [relationType=undefined]
   *   one of `'parent'`, `'child'` or undefined (default). Values other than
   *   `undefined` are not handled yet. TODO: VFS-6243
   */
  async onRelationRemove(
    relationOriginModelName,
    relationOriginRecordId,
    relationTargetModelName,
    relationTargetRecordId,
    // relationType,
  ) {
    const currentUserId = get(
      this.recordManager.getCurrentUserRecord(),
      'entityId'
    );
    const relationOriginRecord = this.recordManager
      .getLoadedRecordById(relationOriginModelName, relationOriginRecordId);
    const relationTargetRecord = this.recordManager
      .getLoadedRecordById(relationTargetModelName, relationTargetRecordId);
    const isCurrentUserAnOrigin = relationOriginModelName === 'user' &&
      relationOriginRecordId === currentUserId;
    const isCurrentUserATarget = relationTargetModelName === 'user' &&
      relationTargetRecordId === currentUserId;

    const reloadPromises = [];

    if (relationOriginRecord && !isCurrentUserAnOrigin) {
      reloadPromises.push(
        // Reload origin
        relationOriginRecord.reload().catch(ignoreRelationReloadError)
      );
    }
    if (relationTargetRecord && !isCurrentUserATarget) {
      reloadPromises.push(
        // Reload target
        relationTargetRecord.reload().catch(ignoreRelationReloadError)
      );
    }

    reloadPromises.push(
      // Reload list of targets in origin
      this.recordManager.reloadRecordListById(
        relationOriginModelName,
        relationOriginRecordId,
        relationTargetModelName
      ).catch(ignoreRelationReloadError),
      // Reload list of origins in target
      this.recordManager.reloadRecordListById(
        relationTargetModelName,
        relationTargetRecordId,
        relationOriginModelName
      ).catch(ignoreRelationReloadError)
    );

    if (relationOriginModelName === 'group') {
      const customListsToReload =
        customListsToReloadForRemovedMembership[relationTargetModelName] ?? [];

      reloadPromises.push(
        // Reload list of users in target
        this.recordManager.reloadRecordListById(
          relationTargetModelName,
          relationTargetRecordId,
          'user'
        ).catch(ignoreRelationReloadError),
        // Reload list of targets in current user (because it's possible that
        // current user is a member of origin group and that group was a source
        // of relation "current user -> target").
        this.recordManager.reloadUserRecordList(
          relationTargetModelName
        ).catch(ignoreForbiddenError),
        // Reload additional model lists in origin as some types of targets
        // implicitly introduce additional relations
        ...customListsToReload.map((modelInList) =>
          this.recordManager.reloadRecordListById(
            relationOriginModelName,
            relationOriginRecordId,
            modelInList
          ).catch(ignoreRelationReloadError)
        )
      );
    }
    if (relationTargetModelName === 'group') {
      const customListsToReload =
        customListsToReloadForRemovedMembership[relationOriginModelName] ?? [];

      reloadPromises.push(
        // Reload list of users in origin
        this.recordManager.reloadRecordListById(
          relationOriginModelName,
          relationOriginRecordId,
          'user'
        ).catch(ignoreRelationReloadError),
        // Reload list of origins in current user (because it's possible that
        // current user is a member of target group and that group was a source
        // of relation "current user -> origin").
        this.recordManager.reloadUserRecordList(
          relationOriginModelName
        ).catch(ignoreForbiddenError),
        // Reload additional model lists in target as some types of origins
        // implicitly introduce additional relations
        ...customListsToReload.map((modelInList) =>
          this.recordManager.reloadRecordListById(
            relationTargetModelName,
            relationTargetRecordId,
            modelInList
          ).catch(ignoreRelationReloadError)
        )
      );
    }

    if (isCurrentUserAnOrigin || relationOriginModelName === 'group') {
      const customListsToReload =
        customListsToReloadForRemovedMembership[relationTargetModelName] ?? [];
      reloadPromises.push(
        // Reload additional model lists in current user as some types of targets
        // implicitly introduce additional relations
        ...customListsToReload.map((modelInList) =>
          this.recordManager.reloadUserRecordList(modelInList)
          .catch(ignoreForbiddenError))
      );
    } else if (isCurrentUserATarget || relationTargetModelName === 'group') {
      const customListsToReload =
        customListsToReloadForRemovedMembership[relationOriginModelName] ?? [];
      reloadPromises.push(
        // Reload additional model lists in current user as some types of origins
        // implicitly introduce additional relations
        ...customListsToReload.map((modelInList) =>
          this.recordManager.reloadUserRecordList(modelInList)
          .catch(ignoreForbiddenError))
      );
    }

    await Promise.all(reloadPromises);
  }
}

function ignoreRelationReloadError(error) {
  try {
    return ignoreForbiddenError(error);
  } catch (e) {
    return ignoreNotFoundError(error);
  }
}
