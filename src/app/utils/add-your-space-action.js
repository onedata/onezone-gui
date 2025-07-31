/**
 * Shows modal with choose-a-space selector to add it to some relate record.
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
  harvesterManager: service(),
  modalManager: service(),
  recordManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.addYourSpaceAction',

  /**
   * @override
   */
  icon: 'space-add',

  /**
   * @override
   */
  className: 'add-your-space-action',

  //#region state

  /** @type {BatchRecordsLoader} */
  batchRecordsLoader: undefined,

  //#endregion

  /**
   * @override
   */
  title: computedT('title'),

  /**
   * @type {ComputedProperty<GraphSingleModel>}
   */
  relatedRecord: reads('context.relatedRecord'),

  /** @type {'sourceFor'} */
  relation: reads('context.relation'),

  /** @type {(space: Models.Space) => Promise<void>} */
  onSpaceAdd: reads('context.onSpaceAdd'),

  /** @type {ComputedProperty<string|SafeString>} */
  loadingText: computed(
    'batchRecordsLoader.progressTracker.progressText',
    function loadingText() {
      const progressText = this.batchRecordsLoader?.progressTracker.progressText;
      return this.t('loading', { progress: progressText ?? '' });
    }
  ),

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
        await this.recordManager.resolveUserRecordListLoader('space');
      this.set('batchRecordsLoader', batchRecordsLoader);
      return batchRecordsLoader.getPromise();
    })();

    const modalOptions = EmberObject.extend({
      headerText: this.t('modalHeader'),
      descriptionText: this.messageText,
      submitText: this.t('modalSubmit'),
      loadingText: reads('parentAction.loadingText'),
      selectorPlaceholderText: this.t('dropdownPlaceholder'),
      modalClass: 'add-your-space-modal',
      recordsPromise,
      onSubmit: space =>
        result.interceptPromise(this.onSpaceAdd(space)),
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
