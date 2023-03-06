/**
 * A mocked version of Onedata RPC service.
 * For properties description see non-mocked `services/onedata-rpc`
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OnedataRpc from 'onedata-gui-websocket-client/services/mocks/onedata-rpc';
import authorizers from 'onezone-gui/utils/authorizers-mock';
import { Promise } from 'rsvp';

export default OnedataRpc.extend({
  __handle_getSupportedIdPs() {
    return Promise.resolve({
      idps: authorizers,
    });
  },
});
