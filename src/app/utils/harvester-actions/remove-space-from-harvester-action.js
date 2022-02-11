/**
 * Removes space from harvester.
 *
 * @module utils/harvester-actions/remove-space-from-harvester-action
 * @author Agnieszka Warchoł
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { get } from '@ember/object';
import computedT from 'onedata-gui-common/utils/computed-t';

export default Action.extend({
  modalManager: service(),
  harvesterManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.harvesterActions.removeSpaceFromHarvesterAction',

  /**
   * @override
   */
  icon: 'close',

  /**
   * @override
   */
  className: 'remove-space-from-harvester-trigger',

  /**
   * @override
   */
  title: computedT('title'),

  /**
   * @type {ComputedProperty<Models.Harvester>}
   */
  harvester: reads('context.harvester'),

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
        harvester,
        space,
        modalManager,
      } = this.getProperties('harvester', 'space', 'modalManager');
      const result = ActionResult.create();

      return modalManager
        .show('question-modal', {
          headerIcon: 'sign-warning-rounded',
          headerText: this.t('modalHeader'),
          descriptionParagraphs: [{
            text: this.t('modalDescription', {
              spaceName: get(space, 'name'),
              harvesterName: get(harvester, 'name'),
            }),
          }],
          yesButtonText: this.t('modalYes'),
          yesButtonType: 'danger',
          onSubmit: () =>
            result.interceptPromise(this.removeSpaceFromHarvester()),
        }).hiddenPromise
        .then(() => {
          result.cancelIfPending();
          this.notifyResult(result);
          return result;
        });
    }
  },

  /**
   * @returns {Promise}
   */
  removeSpaceFromHarvester() {
    const {
      harvesterManager,
      space,
      harvester,
    } = this.getProperties('harvesterManager', 'space', 'harvester');

    return harvesterManager.removeSpaceFromHarvester(
      get(harvester, 'entityId'),
      get(space, 'entityId')
    );
  },
});
