/**
 * NOTE: it always throw an error, because `onedata-websocket` is not mocked
 *
 * Development implementation of `service:onedata-websocket`
 * 
 * Just to notify user, that trying to use onedata-websocket in development
 * mode is wrong
 *
 * @module services/mocks/onedata-websocket
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';

export default Service.extend({
  init() {
    this._super(...arguments);
    throw new Error(
      'service:mocks/onedata-websocket: Cannot use service:onedata-websocket ' +
      'in mocked environment'
    );
  },
});
