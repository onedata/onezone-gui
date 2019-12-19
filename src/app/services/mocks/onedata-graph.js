/**
 * Mock of Onedata Websocket WebSocket API - Graph level service
 *
 * @module services/mocks/onedata-graph
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OnedataGraphMock, {
  messageNotSupported,
  randomToken,
} from 'onedata-gui-websocket-client/services/mocks/onedata-graph';
import { resolve } from 'rsvp';
import { get } from '@ember/object';
import _ from 'lodash';

const spaceHandlers = {
  provider(operation) {
    if (operation !== 'delete') {
      return messageNotSupported;
    }
    return resolve();
  },
  invite_provider_token(operation, /* spaceId, data, authHint*/ ) {
    if (operation === 'create') {
      return {
        success: true,
        data: randomToken(),
      };
    } else {
      return messageNotSupported;
    }
  },
  space_support_token(operation, /* entityId, data, authHint*/ ) {
    if (operation === 'create') {
      return {
        success: true,
        data: randomToken(),
      };
    } else {
      return messageNotSupported;
    }
  },
};

const harvesterHandlers = {
  all_plugins(operation) {
    if (operation === 'get') {
      return {
        success: true,
        allPlugins: [{
          id: 'elasticsearch_plugin',
          name: 'Elasticsearch plugin',
        }],
      };
    } else {
      return messageNotSupported;
    }
  },
};

const providerHandlers = {
  eff_users(operation, entityId) {
    if (operation === 'get') {
      return {
        gri: `provider.${entityId}.eff_users`,
        list: ['user1', 'user2'],
      };
    } else {
      return messageNotSupported;
    }
  },
  eff_groups(operation, entityId) {
    if (operation === 'get') {
      return {
        gri: `provider.${entityId}.groups`,
        list: ['group1', 'group2', 'group3'],
      };
    } else {
      return messageNotSupported;
    }
  },
};

const userHandlers = {
  client_tokens(operation) {
    if (operation === 'create') {
      const token = randomToken();
      return this.get('store')
        .createRecord('clientToken', {
          token,
        })
        .save()
        .then(clientToken => {
          const clientTokenId = get(clientToken, 'id');
          // real operation of adding token to list is server-side
          return this.get('currentUser')
            .getCurrentUserRecord()
            .then(user => get(user, 'clientTokenList'))
            .then(clientTokens => get(clientTokens, 'list'))
            .then(list => {
              list.pushObject(clientToken);
              return list.save();
            })
            .then(() => ({
              success: true,
              id: clientTokenId,
              gri: clientTokenId,
              token,
            }));
        });
    } else {
      return messageNotSupported;
    }
  },
  provider_registration_token(operation) {
    if (operation === 'create') {
      return randomToken();
    } else {
      return messageNotSupported;
    }
  },
};

export default OnedataGraphMock.extend({
  _handlers: Object.freeze({
    space: spaceHandlers,
    harvester: harvesterHandlers,
    user: userHandlers,
    provider: providerHandlers,
  }),

  init() {
    this._super(...arguments);
    this.set(
      'handlers',
      _.merge({}, this.get('handlers'), this.get('_handlers'))
    );
  },
});
