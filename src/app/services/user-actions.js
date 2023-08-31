/**
 * A service which provides user manipulation functions ready to use for GUI
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import ToggleBeingOwnerAction from 'onezone-gui/utils/user-actions/toggle-being-owner-action';
import LeaveAction from 'onezone-gui/utils/user-actions/leave-action';

export default Service.extend(I18n, {
  i18n: service(),
  userManager: service(),
  globalNotify: service(),

  /**
   * @override
   */
  i18nPrefix: 'services.userActions',

  createToggleBeingOwnerAction(context) {
    return ToggleBeingOwnerAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Utils.UserActions.LeaveAction.LeaveActionContext} context
   * @returns {Utils.UserActions.LeaveAction}
   */
  createLeaveAction(context) {
    return LeaveAction.create({ ownerSource: this, context });
  },

  /**
   * Changes user password
   * @param {models.User} user
   * @param {string} oldPassword
   * @param {string} newPassword
   * @returns {Promise} resolves if password has been changed successfully
   */
  changeUserPassword(user, oldPassword, newPassword) {
    const {
      globalNotify,
      userManager,
    } = this.getProperties('globalNotify', 'userManager');
    const userEntityId = get(user, 'entityId');
    return userManager
      .changeUserPassword(userEntityId, oldPassword, newPassword)
      .then(() => {
        globalNotify.success(this.t('passwordChangeSuccess'));
      })
      .catch(error => {
        globalNotify.backendError(this.t('changingPassword'), error);
        throw error;
      });
  },
});
