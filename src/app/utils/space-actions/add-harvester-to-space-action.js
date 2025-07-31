/**
 * Adds harvester to space.
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { get } from '@ember/object';
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
  i18nPrefix: 'utils.spaceActions.addHarvesterToSpaceAction',

  /**
   * @override
   */
  icon: 'plus',

  /**
   * @override
   */
  className: 'add-harvester-to-space-trigger',

  /**
   * @override
   */
  title: computedT('title'),

  /**
   * @type {ComputedProperty<Models.Space>}
   */
  space: reads('context.space'),

  /** @type {ComputedProperty<string|SafeString>} */
  loadingText: computed(
    'batchRecordsLoader.progressTracker.progressText',
    function loadingText() {
      const progressText = this.batchRecordsLoader?.progressTracker.progressText;
      return this.t('loading', { progress: progressText ?? '' });
    }
  ),

  //#region state

  /** @type {BatchRecordsLoader} */
  batchRecordsLoader: undefined,

  //#endregion

  /**
   * @override
   */
  async execute() {
    if (this.disabled) {
      return;
    }

    const {
      space,
      recordManager,
      modalManager,
    } = this;

    const recordsPromise = (async () => {
      const batchRecordsLoader =
        await recordManager.resolveUserRecordListLoader('harvester');
      this.set('batchRecordsLoader', batchRecordsLoader);
      return batchRecordsLoader.getPromise();
    })();

    const modalOptions = EmberObject.extend({
      headerText: this.t('modalHeader'),
      descriptionText: this.t('modalDescription', {
        spaceName: space.name,
      }),
      submitText: this.t('modalSubmit'),
      loadingText: reads('parentAction.loadingText'),
      recordsPromise,
      onSubmit: harvester =>
        result.interceptPromise(this.addHarvesterToSpace(harvester)),
    }).create({
      parentAction: this,
    });
    const result = ActionResult.create();
    await modalManager
      .show('record-selector-modal', modalOptions).hiddenPromise;
    result.cancelIfPending();
    this.notifyResult(result);
    return result;
  },

  /**
   * @param {Models.Harvester} harvester
   * @returns {Promise}
   */
  addHarvesterToSpace(harvester) {
    const {
      harvesterManager,
      space,
    } = this.getProperties('harvesterManager', 'space');

    return harvesterManager.addSpaceToHarvester(
      get(harvester, 'entityId'),
      get(space, 'entityId')
    );
  },
});
