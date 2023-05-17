/**
 * Blocking modal that should be displayed when there is non-recoverable
 * WebSocket connection error.
 *
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { Promise } from 'rsvp';
import { inject as service } from '@ember/service';
import { reads, notEmpty } from '@ember/object/computed';
import globals from 'onedata-gui-common/utils/globals';

export default Component.extend(I18n, {
  i18n: service(),
  onedataWebsocketErrorHandler: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.fatalConnectionErrorModal',

  /**
   * Globally set current error of WebSocket connection.
   * @type {ComputedProperty<string|undefined>}
   */
  error: reads('onedataWebsocketErrorHandler.currentError'),

  /**
   * Show this modal only when the global WS connection error is set.
   * @type {ComputedProperty<boolean>}
   */
  opened: notEmpty('error'),

  actions: {
    reload() {
      return new Promise(() => {
        globals.location.reload();
      });
    },
  },
});
