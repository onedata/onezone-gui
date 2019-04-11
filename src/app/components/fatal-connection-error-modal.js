/**
 * Blocking modal that should be displayed when there is non-recoverable
 * WebSocket connection error.
 * 
 * @module components/fatal-connection-error-modal
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { Promise } from 'rsvp';
import { inject as service } from '@ember/service';
import { reads, notEmpty } from '@ember/object/computed';
import { computed } from '@ember/object';
import { closedBeforeOpenCode } from 'onezone-gui/services/onedata-websocket-error-handler';

export default Component.extend(I18n, {
  i18n: service(),
  browser: service(),
  onedataWebsocketErrorHandler: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.fatalConnectionErrorModal',

  _location: location,

  error: reads('onedataWebsocketErrorHandler.currentError'),

  opened: notEmpty('error'),

  specialReason: computed('error', function specialReason() {
    const isSafari = (this.get('browser.browser.browserCode') === 'safari');
    const error = this.get('error');
    if (error && error.isCustomOnedataError &&
      error.type === closedBeforeOpenCode && isSafari) {
      return 'safariCert';
    }
  }),

  actions: {
    reload() {
      return new Promise(() => {
        this.get('_location').reload();
      });
    },
  },
});
