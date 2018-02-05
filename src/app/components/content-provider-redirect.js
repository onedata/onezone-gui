/**
 * Immediately tries to fetch provider redirection URL
 * and automatically go to it 
 *
 * @module components/content-provider-redirect
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import { inject } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['content-provider-redirect'],

  onezoneServer: inject(),

  /**
   * @override 
   */
  i18nPrefix: 'components.contentProviderRedirect.',

  /**
   * @virtual
   * @type {models/Provider}
   */
  provider: undefined,

  /**
   * @type {boolean}
   */
  isLoading: false,

  /**
   * For test purposes. Do not change it except when testing!
   * @type {Window}
   */
  _window: window,

  /**
   * @type {string}
   */
  providerId: reads('provider.entityId'),

  init() {
    this._super(...arguments);
    const providerId = this.get('providerId');
    if (providerId) {
      this._goToProvider(providerId);
    } else {
      safeExec(this, 'set', 'error', this.t('noProviderId'));
    }
  },

  _goToProvider(providerId) {
    return this.get('onezoneServer').getProviderRedirectUrl(providerId)
      .then(data => {
        if (data.url) {
          this.get('_window').location = data.url;
        } else {
          safeExec(this, 'set', 'error', this.t('noUrlServer'));
        }
      })
      .catch(error => {
        safeExec(this, 'set', 'error', error);
      })
      .finally(() => safeExec(this, 'set', 'isLoading', false));
  },
});
