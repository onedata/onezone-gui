/**
 * Immediately tries to fetch provider redirection URL
 * and automatically go to it 
 *
 * @module components/content-provider-redirect
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import checkImg from 'onedata-gui-common/utils/check-img';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(I18n, {
  classNames: ['content-provider-redirect'],

  onezoneServer: service(),
  globalNotify: service(),

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
   * @virutal optional
   * @type {string}
   */
  spaceId: undefined,

  /**
   * @type {boolean}
   */
  isLoading: false,

  /**
   * For test purposes. Do not change it except when testing!
   * @type {Window}
   */
  _window: window,

  goToProviderProxy: computed('spaceId', function goToProviderProxy() {
    return PromiseObject.create({
      promise: this._goToProvider(this.get('provider.entityId'), this.get('spaceId')),
    });
  }),

  /**
   * @returns {Promise<boolean>}
   */
  checkIsProviderAvailable() {
    return checkImg(`https://${this.get('provider.domain')}/favicon.ico`);
  },

  _goToProvider(providerId, spaceId) {
    const path = spaceId ? `/#/onedata/data/${spaceId}` : null;
    return this.get('onezoneServer').getProviderRedirectUrl(providerId, path)
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
