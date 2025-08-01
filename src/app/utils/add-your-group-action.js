/**
 * Shows modal with choose-a-group selector to add relation to it to some record.
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

/**
 * @typedef {'child'|'parent'|'member'} GroupRelationAddType
 */

export default Action.extend({
  modalManager: service(),
  recordManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.addYourGroupAction',

  /**
   * @override
   */
  icon: 'group-invite',

  /**
   * @override
   */
  className: 'add-your-group-action',

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

  /** @type {GroupRelationAddType} */
  relation: reads('context.relation'),

  /** @type {(baseGroup: Models.Group, addedGroup: Models.Group, [relation]: GroupRelationAddType) => Promise<void>} */
  onGroupAdd: reads('context.onGroupAdd'),

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
        await this.recordManager.resolveUserRecordListLoader('group');
      this.set('batchRecordsLoader', batchRecordsLoader);
      return batchRecordsLoader.getPromise();
    })();

    const modalOptions = EmberObject.extend({
      headerText: this.t('modalHeader'),
      descriptionText: this.messageText,
      submitText: this.t('modalSubmit'),
      loadingText: reads('parentAction.loadingText'),
      selectorPlaceholderText: this.t('dropdownPlaceholder'),
      modalClass: 'add-your-group-modal',
      recordsPromise,
      onSubmit: selectedGroup => result.interceptPromise(
        this.onGroupAdd(this.relatedRecord, selectedGroup, this.relation)
      ),
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
