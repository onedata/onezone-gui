/**
 * Injects function for generating development model for onezone-gui
 *
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
import UnifiedGuiController from 'onedata-gui-common/utils/unified-gui-controller';

export default OnedataApplicationRoute.extend(DevelopmentModelRouteMixin, {
  onedataWebsocket: service(),
  guiMessageManager: service(),

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
    UnifiedGuiController.setAsOpened();
    const {
      guiMessageManager,
      onedataWebsocket,
    } = this.getProperties(
      'guiMessageManager',
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
          get(guiMessageManager, 'guiMessageManagerProxy'),
          get(guiMessageManager, 'privacyPolicyProxy'),
          get(guiMessageManager, 'termsOfUseProxy'),
          get(guiMessageManager, 'cookieConsentNotificationProxy'),
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
