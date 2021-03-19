/**
 * Provides project-specific, custom logic to record-manager service.
 *
 * @module utils/record-manager-configuration
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get } from '@ember/object';
import { Promise } from 'rsvp';
import ignoreForbiddenError from 'onedata-gui-common/utils/ignore-forbidden-error';

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
      default: {
        let relationsRemoveOrder;
        if (relationSides[0].isUser && !relationSides[0].isCurrentUser) {
          // Cannot remove relation as a user other than current.
          relationsRemoveOrder = [
            [1, 0],
          ];
        } else if (relationSides[1].isUser && !relationSides[1].isCurrentUser) {
          // The same as above.
          relationsRemoveOrder = [
            [0, 1],
          ];
        } else {
          // None of the relations sides are a non-current user.
          relationsRemoveOrder = [
            [0, 1],
            [1, 0],
          ];
          if (relationSides[1].isCurrentUser) {
            // Removing relation should start with removing it from the side of
            // current user.
            relationsRemoveOrder.reverse();
          }
        }

        return relationsRemoveOrder.map(([a, b]) => ({
          entityType: relationSides[a].entityType,
          entityId: relationSides[a].recordId,
          aspect: relationSides[b].entityType,
          aspectId: relationSides[b].recordId,
        }));
      }
    }
  }

  async onRecordRemove(modelName /**, recordId */ ) {
    await this.recordManager.reloadUserRecordList(modelName);
  }

  async onRelationRemove(
    relationOriginModelName,
    relationOriginRecordId,
    relationTargetModelName,
    relationTargetRecordId,
    // relationType will be necessary when dealing with group-group relation
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

    // Reload relation records
    if (relationOriginRecord && !isCurrentUserAnOrigin) {
      reloadPromises.push(
        relationOriginRecord.reload().catch(ignoreForbiddenError)
      );
    }
    if (relationTargetRecord && !isCurrentUserATarget) {
      reloadPromises.push(
        relationTargetRecord.reload().catch(ignoreForbiddenError)
      );
    }

    // Reload lists of relation-related records in both sides of the relation
    reloadPromises.push(
      this.recordManager.reloadRecordListById(
        relationOriginModelName,
        relationOriginRecordId,
        relationTargetModelName
      ).catch(ignoreForbiddenError),
      this.recordManager.reloadRecordListById(
        relationTargetModelName,
        relationTargetRecordId,
        relationOriginModelName
      ).catch(ignoreForbiddenError)
    );

    // Reload users list in the one side of the relation if the other side was
    // a group
    if (relationOriginModelName === 'group') {
      reloadPromises.push(
        this.recordManager.reloadRecordListById(
          relationTargetModelName,
          relationTargetRecordId,
          'user'
        ).catch(ignoreForbiddenError)
      );
    }
    if (relationTargetModelName === 'group') {
      reloadPromises.push(
        this.recordManager.reloadRecordListById(
          relationOriginModelName,
          relationOriginRecordId,
          'user'
        ).catch(ignoreForbiddenError)
      );
    }

    await Promise.all(reloadPromises);
  }
}
