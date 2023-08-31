/**
 * Allows current user to leave specific record (remove direct membership).
 * At first it shows modal with information about current membership status
 * and warnings, then - after user approval - removes user from members of
 * `recordToLeave`.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import _ from 'lodash';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';

/**
 * @typedef {Object} LeaveActionContext
 * @property {GraphSingleModel} recordToLeave
 */

export default Action.extend({
  recordManager: service(),
  modalManager: service(),
  navigationState: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.userActions.leaveAction',

  /**
   * @override
   */
  className: 'leave-action-trigger',

  /**
   * @override
   */
  icon: 'leave-space',

  /**
   * @type {ComputedProperty<LeaveActionContext['recordToLeave']>}
   */
  recordToLeave: reads('context.recordToLeave'),

  /**
   * @type {ComputedProperty<SafeString | null>}
   */
  translatedModelNameToLeave: computed(
    'recordToLeave',
    function translatedModelNameToLeave() {
      const modelName = this.recordToLeave ?
        this.recordManager.getModelNameForRecord(this.recordToLeave) : null;
      if (!modelName) {
        return null;
      }

      return this.t(`common.modelNames.${modelName}`, {}, {
        usePrefix: false,
        defaultValue: null,
      });
    }
  ),

  /**
   * @override
   */
  async onExecute() {
    const result = ActionResult.create();

    await this.modalManager
      .show('leave-modal', {
        recordToLeave: this.recordToLeave,
        onSubmit: () =>
          result.interceptPromise(this.leaveFromTargetRecord()),
      }).hiddenPromise;

    result.cancelIfPending();
    if (result.status === 'done') {
      await this.navigationState.redirectToCollectionIfResourceNotExist();
    }

    return result;
  },

  /**
   * @override
   */
  getSuccessNotificationText() {
    if (this.translatedModelNameToLeave) {
      return this.t('successNotificationText', {
        readableModelName: _.upperFirst(String(this.translatedModelNameToLeave)),
      });
    }
  },

  /**
   * @override
   */
  getFailureNotificationActionName() {
    if (this.translatedModelNameToLeave) {
      return this.t('failureNotificationActionName', {
        readableModelName: this.translatedModelNameToLeave,
      });
    }
  },

  /**
   * @returns {Promise<void>}
   */
  async leaveFromTargetRecord() {
    await this.recordManager.removeUserRelation(this.recordToLeave);
  },
});
