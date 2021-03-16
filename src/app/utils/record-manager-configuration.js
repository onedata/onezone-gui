import { get } from '@ember/object';
import { Promise, resolve } from 'rsvp';
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
    const relationOriginEntityType = this.recordManager
      .getEntityTypeForModelName(relationOriginModelName);
    const relationTargetEntityType = this.recordManager
      .getEntityTypeForModelName(relationTargetModelName);

    switch (relationType) {
      default: {
        const currentUserId = get(
          this.recordManager.getCurrentUserRecord(),
          'entityId'
        );
        const isCurrentUserATarget = relationTargetModelName === 'user' &&
          relationTargetRecordId === currentUserId;
        const orderReversed = isCurrentUserATarget;

        const possibilities = [{
          entityType: relationOriginEntityType,
          entityId: relationOriginRecordId,
          aspect: relationTargetEntityType,
          aspectId: relationTargetRecordId,
        }];
        if (orderReversed) {
          possibilities.reverse();
        }

        return resolve(possibilities);
      }
    }
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
