/**
 * Mock of Onedata Websocket WebSocket API - Graph level service
 *
 * @module services/mocks/onedata-graph
 * @author Jakub Liput
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
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
  privileges(operation) {
    if (operation === 'get') {
      return {
        member: ['space_view'],
      };
    } else {
      throw messageNotSupported;
    }
  },
};

const groupHandlers = {
  privileges(operation) {
    if (operation === 'get') {
      return {
        member: ['group_view'],
      };
    } else {
      throw messageNotSupported;
    }
  },
};

const harvesterHandlers = {
  all_backend_types(operation) {
    if (operation === 'get') {
      return {
        success: true,
        allBackendTypes: [{
          id: 'elasticsearch_harvesting_backend',
          name: 'Elasticsearch backend',
        }],
      };
    } else {
      return messageNotSupported;
    }
  },
  privileges(operation) {
    if (operation === 'get') {
      return {
        member: ['harvester_view'],
      };
    } else {
      throw messageNotSupported;
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
  current_time(operation) {
    if (operation === 'get') {
      return {
        timeMillis: new Date().valueOf(),
      };
    }
  },
};

const clusterHandlers = {
  privileges(operation) {
    if (operation === 'get') {
      return {
        member: ['cluster_view'],
      };
    } else {
      throw messageNotSupported;
    }
  },
};

const userHandlers = {
  client_tokens(operation) {
    if (operation === 'create') {
      const token = randomToken();
      return this.get('store')
        .createRecord('token', {
          token,
        })
        .save()
        .then(token => {
          const clientTokenId = get(token, 'id');
          // real operation of adding token to list is server-side
          return this.get('currentUser')
            .getCurrentUserRecord()
            .then(user => get(user, 'clientTokenList'))
            .then(clientTokens => get(clientTokens, 'list'))
            .then(list => {
              list.pushObject(token);
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

const tokenHandlers = {
  user_temporary_token(operation, entityId, data) {
    if (operation === 'create') {
      const valuesToEmbed = _.values(get(data, 'type.inviteToken' || {})).join('X');
      return `${randomToken()}X${valuesToEmbed}`;
    } else {
      return messageNotSupported;
    }
  },
  examine(operation, entityId, data) {
    if (operation === 'create') {
      const token = get(data, 'token');
      const tokenRecord = this.get('store').peekAll('token').findBy('token', token);
      if (tokenRecord) {
        const type = get(tokenRecord, 'type');
        const response = {
          type,
        };
        return tokenRecord.get('tokenTargetProxy')
          .then(target => {
            if (target) {
              const modelName = target.constructor.modelName;
              response.type.inviteToken[`${modelName}Name`] = get(target, 'name');

            }
            return response;
          });
      } else {
        return {
          success: false,
          error: { id: 'badToken' },
          data: {},
        };
      }
    } else {
      return messageNotSupported;
    }
  },
};

export default OnedataGraphMock.extend({
  init() {
    this._super(...arguments);
    const _handlers = Object.freeze({
      space: spaceHandlers,
      group: groupHandlers,
      harvester: harvesterHandlers,
      user: userHandlers,
      provider: providerHandlers,
      cluster: clusterHandlers,
      token: tokenHandlers,
    });
    this.set(
      'handlers',
      _.merge({}, this.get('handlers'), _handlers)
    );
  },
});
