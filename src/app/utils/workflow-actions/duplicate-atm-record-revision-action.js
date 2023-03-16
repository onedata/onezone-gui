/**
 * Duplicates automation record revision to another record.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { dasherize } from '@ember/string';
import ActionResult from 'onedata-gui-common/utils/action-result';
import ObjectProxy from '@ember/object/proxy';
import ApplyAtmRecordDumpActionBase from 'onezone-gui/utils/workflow-actions/apply-atm-record-dump-action-base';

/**
 * @typedef {ApplyAtmRecordDumpActionBaseContext} DuplicateAtmRecordRevisionActionContext
 * @property {DumpableAtmModel} atmRecord
 * @property {RevisionNumber} revisionNumber
 */

export default ApplyAtmRecordDumpActionBase.extend({
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.workflowActions.duplicateAtmRecordRevisionAction',

  /**
   * @virtual
   * @type {DuplicateAtmRecordRevisionActionContext}
   */
  context: undefined,

  /**
   * @override
   */
  icon: 'browser-copy',

  /**
   * @override
   */
  className: computed('atmModelName', function className() {
    return `duplicate-atm-record-revision-action-trigger duplicate-${dasherize(this.atmModelName)}-revision-action-trigger`;
  }),

  /**
   * @type {ComputedProperty<DumpableAtmModel>}
   */
  atmRecord: reads('context.atmRecord'),

  /**
   * @type {ComputedProperty<RevisionNumber>}
   */
  revisionNumber: reads('context.revisionNumber'),

  /**
   * @override
   */
  async onExecute() {
    const result = ActionResult.create();
    const dumpSourceProxy = ObjectProxy.create({
      content: {
        dump: await this.getAtmRecordDump(),
      },
    });

    await this.modalManager.show('apply-atm-record-dump-modal', {
      initialAtmInventory: this.atmInventory,
      atmModelName: this.atmModelName,
      dumpSourceType: 'duplication',
      dumpSourceProxy,
      onSubmit: (data) => this.handleModalSubmit(data, result),
    }).hiddenPromise;

    result.cancelIfPending();
    return result;
  },

  async getAtmRecordDump() {
    const atmRecordId = this.get('atmRecord.entityId');

    if (this.atmModelName === 'atmLambda') {
      return await this.workflowManager.getAtmLambdaDump(
        atmRecordId,
        this.revisionNumber
      );
    } else {
      return await this.workflowManager.getAtmWorkflowSchemaDump(
        atmRecordId,
        this.revisionNumber
      );
    }
  },
});
