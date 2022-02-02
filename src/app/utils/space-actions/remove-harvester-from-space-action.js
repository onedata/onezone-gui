/**
 * Removes harvester from space.
 *
 * @module utils/space-actions/remove-harvester-from-space-action
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

  /**
   * @override
   */
  i18nPrefix: 'utils.spaceActions.removeHarvesterFromSpaceAction',

  /**
   * @override
   */
  icon: 'close',

  /**
   * @override
   */
  className: 'remove-harvester-from-space-trigger',

  /**
   * @override
   */
  title: computedT('title'),

  /**
   * @type {ComputedProperty<Models.Space>}
   */
  space: reads('context.space'),

  /**
   * @type {ComputedProperty<Models.Harvester>}
   */
  harvester: reads('context.harvester'),

  /**
   * @override
   */
  execute() {
    if (!this.get('disabled')) {
      const {
        space,
        harvester,
        modalManager,
      } = this.getProperties(
        'space',
        'harvester',
        'modalManager'
      );

      const result = ActionResult.create();
      return modalManager
        .show('question-modal', {
          headerIcon: 'sign-warning-rounded',
          headerText: this.t('modalHeader'),
          descriptionParagraphs: [{
            text: this.t('modalDescription', {
              harvesterName: get(harvester, 'name'),
              spaceName: get(space, 'name'),
            }),
          }],
          yesButtonText: this.t('modalYes'),
          yesButtonType: 'danger',
          onSubmit: () =>
            result.interceptPromise(this.removeHarvesterFromSpace()),
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
  removeHarvesterFromSpace() {
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
