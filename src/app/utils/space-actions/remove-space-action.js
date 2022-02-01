/**
 * Removes space.
 *
 * @module utils/space-actions/remove-space-action
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
  spaceManager: service(),
  modalManager: service(),
  navigationState: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.spaceActions.removeSpaceAction',

  /**
   * @override
   */
  icon: 'remove',

  /**
   * @override
   */
  className: 'remove-space-trigger',

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
    if (this.get('disabled')) {
      return;
    }

    const {
      space,
      modalManager,
    } = this.getProperties(
      'space',
      'modalManager'
    );

    const result = ActionResult.create();
    return modalManager
      .show('question-modal', {
        headerIcon: 'sign-warning-rounded',
        headerText: this.t('modalHeader'),
        descriptionParagraphs: [{
          text: this.t('modalDescription', {
            spaceName: get(space, 'name'),
          }),
        }, {
          text: this.t('modalDisclaimer'),
        }],
        checkboxMessage: this.t('modalCheckboxMessage'),
        yesButtonText: this.t('modalYes'),
        yesButtonType: 'danger',
        onSubmit: () =>
          result.interceptPromise(this.removeSpace()),
      }).hiddenPromise
      .then(() => {
        result.cancelIfPending();
        this.notifyResult(result);
        return result;
      });
  },

  /**
   * @returns {Promise}
   */
  removeSpace() {
    const {
      spaceManager,
      space,
      navigationState,
    } = this.getProperties(
      'spaceManager',
      'space',
      'navigationState'
    );

    return spaceManager.removeSpace(get(space, 'entityId'))
      .then(() => navigationState.redirectToCollectionIfResourceNotExist());
  },
});
