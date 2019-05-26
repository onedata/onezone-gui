/**
 * A service which provides user manipulation functions ready to use for GUI 
 *
 * @module services/user-actions
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Service.extend(I18n, {
  i18n: service(),
  userManager: service(),
  globalNotify: service(),

  /**
   * @override
   */
  i18nPrefix: 'services.userActions',

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
