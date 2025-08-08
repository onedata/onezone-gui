/**
 * Base class for actions that show a modal to add a relation to a record.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import computedT from 'onedata-gui-common/utils/computed-t';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { computed } from '@ember/object';

export default Action.extend({
  modalManager: service(),
  recordManager: service(),

  /**
   * @virtual
   * @type {(record) => Promise<void>}
   */
  onRecordAdd: undefined,

  /**
   * @virtual
   * @type {string}
   */
  addedRecordType: undefined,

  /** @override */
  title: computedT('title'),

  /** @type {ComputedProperty<GraphSingleModel>} */
  relatedRecord: reads('context.relatedRecord'),

  /** @type {string} */
  relation: reads('context.relation'),

  /** @type {ComputedProperty<string|SafeString>} */
  loadingText: computed(
    'batchRecordsLoader.progressTracker.progressText',
    function loadingText() {
      const progressText = this.batchRecordsLoader?.progressTracker.progressText;
      return this.t('loading', { progress: progressText ?? '' });
    }
  ),

  /** @type {ComputedProperty<string|SafeString>} */
  messageText: computed(
    'relatedRecord.{name,entityType}',
    'relation',
    function messageText() {
      return this.t('modalDescription', {
        relation: this.t(this.relation),
        recordType: this.t(this.relatedRecord.entityType),
        recordName: this.relatedRecord.name,
      });
    }
  ),

  /**
   * @override
   */
  async execute() {
    if (this.disabled) {
      return;
    }

    const recordsPromise = (async () => {
      const batchRecordsLoader =
        await this.recordManager.resolveUserRecordListLoader(this.addedRecordType);
      this.set('batchRecordsLoader', batchRecordsLoader);
      return batchRecordsLoader.getPromise();
    })();

    const modalOptions = EmberObject.extend({
      headerText: this.t('modalHeader'),
      descriptionText: this.messageText,
      submitText: this.t('modalSubmit'),
      loadingText: reads('parentAction.loadingText'),
      selectorPlaceholderText: this.t('dropdownPlaceholder'),
      modalClass: this.modalClass,
      recordsPromise,
      onSubmit: record => result.interceptPromise(this.onRecordAdd(record)),
    }).create({
      parentAction: this,
    });
    const result = ActionResult.create();
    await this.modalManager.show('record-selector-modal', modalOptions).hiddenPromise;
    result.cancelIfPending();
    this.notifyResult(result);
    return result;
  },
});
