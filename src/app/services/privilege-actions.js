/**
 * Provides gui actions related to privileges.
 *
 * @module services/privilege-actions
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Service.extend(I18n, {
  globalNotify: service(),
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'services.privilegeActions',

  /**
   * Adds proper notifications related to save process status
   * @param {Promise} promise
   * @returns {Promise}
   */
  handleSave(promise) {
    return promise
      .then(() => this.get('globalNotify').info(this.t('privilegesSaveSuccess')))
      .catch((error) => {
        this.get('globalNotify')
          .backendError(this.t('privilegesPersistence'), error);
        throw error;
      });
  },
});
