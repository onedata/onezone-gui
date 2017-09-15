/**
 * Default Onedata Websocket service mock using hanshake that checks cookies
 *
 * To use with `authenticator:mocks/onedata-websocket` that also uses cookies
 *
 * @module services/mocks/onedata-websocket
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OnedataWebsocketBase from 'onedata-gui-websocket-client/services/mocks/onedata-websocket-base';
import CookiesHandshake from 'onedata-gui-websocket-client/mixins/services/onedata-websocket-cookies-handshake';

import { Promise } from 'rsvp';

export default OnedataWebsocketBase.extend(CookiesHandshake, {
  handleSendGraph({
    gri,
    operation,
  }) {
    if (gri.match(/od_user/) && operation === 'get') {
      return Promise.resolve({
        payload: {
          success: true,
          data: {
            gri,
            name: 'Some user',
          },
        },
      });
    }
  },
});
