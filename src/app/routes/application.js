/**
 * Injects function for generating development model for onezone-gui
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import { allSettled } from 'rsvp';
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

  async beforeModel(transition) {
    if (transition.isAborted) {
      return;
    }
    // Handshake is done by ember-basic-auth pre-beforeModel hook, so at this point we can
    // have handshare error available.
    const handshakeError = this.onedataWebsocket.handshakeFatalError;
    if (handshakeError) {
      const customErrorType = (handshakeError.id === 'serviceUnavailable') ?
        'service-temporarily-unavailable' : 'cannot-init-websocket';
      throw {
        isOnedataCustomError: true,
        type: customErrorType,
      };
    }
    const superResult = this._super(...arguments);
    UnifiedGuiController.setAsOpened();
    if (transition.intent?.name === 'error') {
      // If there is application error route requested, it makes no sense to load further
      // data.
      return;
    }
    const {
      guiMessageManager,
      onedataWebsocket,
    } = this;
    try {
      await onedataWebsocket.webSocketInitializedProxy;
    } catch {
      throw {
        isOnedataCustomError: true,
        type: 'cannot-init-websocket',
      };
    }
    await allSettled([
      guiMessageManager.guiMessageManagerProxy,
      guiMessageManager.privacyPolicyProxy,
      guiMessageManager.termsOfUseProxy,
      guiMessageManager.cookieConsentNotificationProxy,
    ]);
    return await superResult;
  },
});
