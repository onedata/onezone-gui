/**
 * Introduces extra methods configuration to default local-storage adapter implementation.
 *
 * @module adapters/local-storage
 * @author Michał Borzęcki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import LocalStorageAdapter from 'onedata-gui-websocket-client/adapters/local-storage';
import { randomToken } from 'onedata-gui-websocket-client/services/mocks/onedata-graph';

export default LocalStorageAdapter.extend({
  createRecord(store, type, snapshot) {
    const result = this._super(...arguments);
    switch (snapshot.modelName) {
      case 'token':
        return {
          data: {
            type: snapshot.modelName,
            id: snapshot.id,
            attributes: Object.assign({}, snapshot._attributes, {
              token: randomToken(),
            }),
          },
        };
      default:
        return result;
    }
  },
});
