/**
 * Injects function for generating development model for onezone-gui
 *
 * @module routes/application
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { Promise } from 'rsvp';
import OnedataApplicationRoute from 'onedata-gui-common/routes/application';
import DevelopmentModelRouteMixin from 'onedata-gui-websocket-client/mixins/routes/development-model';
import generateDevelopmentModel from 'onezone-gui/utils/generate-development-model';
import clearLocalStorageModel from 'onezone-gui/utils/clear-local-storage-model';

export default OnedataApplicationRoute.extend(DevelopmentModelRouteMixin, {
  onedataWebsocket: service(),
  privacyPolicyManager: service(),

  developmentModelConfig: Object.freeze({
    clearOnReload: false,
  }),
  generateDevelopmentModel,
  clearDevelopmentModel: clearLocalStorageModel,

  beforeModel() {
    const superResult = this._super(...arguments);
    const {
      privacyPolicyManager,
      onedataWebsocket,
    } = this.getProperties('privacyPolicyManager', 'onedataWebsocket');
    return get(onedataWebsocket, 'webSocketInitializedProxy')
      .catch(() => {
        throw {
          isOnedataCustomError: true,
          type: 'cannot-init-websocket',
        };
      })
      .then(() => Promise.all([
        get(privacyPolicyManager, 'privacyPolicyProxy'),
        get(privacyPolicyManager, 'cookieConsentNotificationProxy'),
      ]).catch(error => {
        console.error(error);
        // Error while loading gui messages is not critical, so it should not
        // stop loading the page.
        return undefined;
      }))
      .then(() => superResult);
  },
});
