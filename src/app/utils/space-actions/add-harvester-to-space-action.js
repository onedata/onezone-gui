/**
 * Adds harvester to space.
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import AddYourRecordAction from 'onezone-gui/utils/add-your-record-action';

export default AddYourRecordAction.extend({
  harvesterManager: service(),

  /** @override */
  i18nPrefix: 'utils.spaceActions.addHarvesterToSpaceAction',

  /** @override */
  icon: 'plus',

  /** @override */
  className: 'add-harvester-to-space-trigger',

  /** @override */
  addedRecordType: 'harvester',

  /**
   * @override
   * @param {Models.Harvester} harvester
   * @returns {Promise}
   */
  onRecordAdd(harvester) {
    return this.harvesterManager.addSpaceToHarvester(
      harvester.entityId,
      this.relatedRecord.entityId
    );
  },
});
