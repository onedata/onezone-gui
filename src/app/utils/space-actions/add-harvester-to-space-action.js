/**
 * Adds harvester to space.
 *
 * @module utils/token-actions/add-harvester-to-space-action
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import computedT from 'onedata-gui-common/utils/computed-t';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';

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

  /**
   * @override
   */
  execute() {
    if (!this.get('disabled')) {
      const {
        space,
        recordManager,
        modalManager,
      } = this.getProperties(
        'space',
        'recordManager',
        'modalManager'
      );

      const result = ActionResult.create();
      return modalManager
        .show('record-selector-modal', {
          headerText: this.t('modalHeader'),
          descriptionText: this.t('modalDescription', {
            spaceName: get(space, 'name'),
          }),
          submitText: this.t('modalSubmit'),
          recordsPromise: recordManager.getUserRecordList('harvester')
            .then(harvesterList => get(harvesterList, 'list')),
          onSubmit: harvester =>
            result.interceptPromise(this.addHarvesterToSpace(harvester)),
        }).hiddenPromise
        .then(() => {
          result.cancelIfPending();
          this.notifyResult(result);
          return result;
        });
    }
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
