/**
 * A mocked abstraction layer for Onedata Sync API Websocket connection properties 
 * For properties description see non-mocked `services/onedata-connection`
 *
 * @module services/mocks/onedata-connection
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OnedataConnection from 'onedata-gui-websocket-client/services/mocks/onedata-connection';
import authorizers from 'onezone-gui/utils/authorizers-mock';

export default OnedataConnection.extend({
  zoneName: 'Hello world',
  identityProviders: Object.freeze(authorizers),
  brandSubtitle: 'Isolated zone',
  loginNotification: '',
});
