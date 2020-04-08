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

export default OnedataConnection.extend({
  zoneName: 'Hello world',
  zoneDomain: location.hostname,
  serviceVersion: '19.02.9',
  serviceBuildVersion: 'm-23493894y7238',
  brandSubtitle: 'Isolated zone',
  maxTemporaryTokenTtl: 7 * 24 * 60 * 60,
});
