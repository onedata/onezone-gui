/**
 * Base class, that should be extended by actions working with application of
 * automation record dumps and apply-atm-record-dump modal.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import _ from 'lodash';

/**
 * @typedef {Object} ApplyAtmRecordDumpActionBaseContext
 * @property {DumpableAtmModelName} atmModelName
 * @property {Models.AtmInventory} atmInventory
 */

/**
 * @typedef {'atmLambda' | 'atmWorkflowSchema'} DumpableAtmModelName
 */

/**
 * @typedef {Models.AtmLambda | Models.AtmWorkflowSchema} DumpableAtmModel
 */

const i18nPrefix = 'utils.workflowActions.applyAtmRecordDumpActionBase';

export default Action.extend({
  workflowManager: service(),

  /**
   * @virtual
   * @type {ApplyAtmRecordDumpActionBaseContext}
   */
  context: undefined,

  /**
   * @type {ComputedProperty<DumpableAtmModelName>}
   */
  atmModelName: reads('context.atmModelName'),

  /**
   * @type {ComputedProperty<Models.AtmInventory>}
   */
  atmInventory: reads('context.atmInventory'),

  /**
   * @override
   */
  getSuccessNotificationText(actionResult) {
    const operation = actionResult?.additionalData?.operation;
    return this.t(`${i18nPrefix}.successNotificationText.${operation}.${this.atmModelName}`, {}, {
      usePrefix: false,
      defaultValue: '',
    });
  },

  /**
   * @override
   */
  getFailureNotificationActionName(actionResult) {
    const operation = actionResult?.additionalData?.operation;
    return this.t(`${i18nPrefix}.failureNotificationActionName.${operation}.${this.atmModelName}`, {}, {
      usePrefix: false,
      defaultValue: '',
    });
  },

  handleModalSubmit(modalSubmitData, actionResult) {
    set(actionResult, 'additionalData', { operation: modalSubmitData.operation });
    return actionResult.interceptPromise(this.persistDump(modalSubmitData));
  },

  async persistDump({
    operation,
    atmInventory,
    atmRecordDump,
    targetAtmRecord,
    newAtmRecordName,
  }) {
    let revisionNumber = atmRecordDump?.revision?.originalRevisionNumber;
    let atmRecord;
    switch (operation) {
      case 'merge': {
        const targetAtmRecordId = get(targetAtmRecord, 'entityId');
        if (this.atmModelName === 'atmLambda') {
          const result = await this.workflowManager
            .mergeAtmLambdaDumpToExistingLambda(
              targetAtmRecordId,
              atmRecordDump
            );
          atmRecord = result?.atmLambda;
          revisionNumber = result?.revisionNumber;
        } else {
          atmRecord = await this.workflowManager
            .mergeAtmWorkflowSchemaDumpToExistingSchema(
              targetAtmRecordId,
              atmRecordDump
            );
        }
        break;
      }
      case 'create': {
        const atmInventoryId = get(atmInventory, 'entityId');
        const atmRecordDumpCopy = _.cloneDeep(atmRecordDump);
        if (this.atmModelName === 'atmLambda') {
          if (atmRecordDumpCopy?.revision?.atmLambdaRevision) {
            atmRecordDumpCopy.revision.atmLambdaRevision.name = newAtmRecordName;
          }
          atmRecord = await this.workflowManager
            .createAtmLambda(atmInventoryId, atmRecordDumpCopy);
        } else {
          atmRecordDumpCopy.name = newAtmRecordName;
          atmRecord = await this.workflowManager
            .createAtmWorkflowSchema(atmInventoryId, atmRecordDumpCopy);
        }
        break;
      }
    }
    return {
      atmRecord,
      revisionNumber,
    };
  },
});
