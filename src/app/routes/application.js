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
import { all as allFulfilled } from 'rsvp';
import OnedataApplicationRoute from 'onedata-gui-common/routes/application';
import DevelopmentModelRouteMixin from 'onedata-gui-websocket-client/mixins/routes/development-model';
import generateDevelopmentModel from 'onezone-gui/utils/generate-development-model';

export default OnedataApplicationRoute.extend(DevelopmentModelRouteMixin, {
  onedataWebsocket: service(),
  privacyPolicyManager: service(),
  acceptableUsePolicyManager: service(),
  cookiesConsentManager: service(),

  /**
   * @override
   */
  clearLocalStoragePrefix: 'onezone-gui:',

  developmentModelConfig: Object.freeze({
    clearOnReload: false,
  }),
  generateDevelopmentModel,

  beforeModel() {
    const superResult = this._super(...arguments);
    const {
      privacyPolicyManager,
      acceptableUsePolicyManager,
      cookiesConsentManager,
      onedataWebsocket,
    } = this.getProperties(
      'privacyPolicyManager',
      'acceptableUsePolicyManager',
      'cookiesConsentManager',
      'onedataWebsocket'
    );
    return get(onedataWebsocket, 'webSocketInitializedProxy')
      .catch(() => {
        throw {
          isOnedataCustomError: true,
          type: 'cannot-init-websocket',
        };
      })
      .then(() =>
        allFulfilled([
          get(privacyPolicyManager, 'privacyPolicyProxy'),
          get(acceptableUsePolicyManager, 'acceptableUsePolicyProxy'),
          get(cookiesConsentManager, 'cookieConsentNotificationProxy'),
        ]).catch(error => {
          console.error(error);
          // Error while loading gui messages is not critical, so it should not
          // stop loading the page.
          return undefined;
        })
      )
      .then(() => superResult);
  },
});
