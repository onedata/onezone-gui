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
import { get, getProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import { listMarketplaceAspect } from 'onezone-gui/services/space-manager';

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
  api_samples() {
    return {
      rest: {
        samples: [{
          swaggerOperationId: 'get_space',
          requiresAuthorization: true,
          placeholders: {},
          path: '/space/spaceid',
          name: 'Get space details',
          description: 'Return space details.',
          method: 'GET',
          data: null,
          followRedirects: false,
          headers: {},
        }, {
          swaggerOperationId: 'list_space_users',
          requiresAuthorization: true,
          placeholders: {},
          path: '/space/spaceid/users',
          name: 'List space users',
          description: 'Returns the list of users.',
          method: 'GET',
          data: null,
          followRedirects: false,
          headers: {},
        }, {
          swaggerOperationId: 'list_space_privileges',
          requiresAuthorization: true,
          placeholders: {},
          path: '/spaces/privileges',
          name: 'List all space privileges',
          description: 'Returns the list of all avaailable space privileges.',
          method: 'GET',
          data: null,
          followRedirects: false,
          headers: {},
        }],
        apiRoot: 'https://dev-onezone.default.svc.cluster.local/api/v3/onezone',
      },
    };
  },
  [listMarketplaceAspect](operation, entityId, data) {
    const store = this.store;
    if (operation !== 'create') {
      throw messageNotSupported;
    }
    const emptyResponse = Object.freeze({
      list: [],
      isLast: true,
    });
    const {
      index,
      limit,
    } = data;
    // NOTE: this mock is basic
    // - it resolves marketplace spaces data no matter, if their spaces are currently
    //   advertised or not
    // - currently it supports only listing from beginning (null index)
    if (index) {
      return emptyResponse;
    }
    if (!store.developmentModel) {
      console.warn(
        `To use mock of onedataGraph space ${listMarketplaceAspect} you need to turn on \`clearOnReload\` for developmentModel.`
      );
      return emptyResponse;
    }
    const marketplaceInfos = store.developmentModel
      .entityRecords['spaceMarketplaceInfo'];
    return {
      list: marketplaceInfos.slice(0, limit).map(info => ({
        spaceId: get(info, 'entityId'),
        index: get(info, 'index'),
      })),
      isLast: true,
    };
  },
  // example URL to use in mocked app (space-0 is first mocked spaceId)
  // http://localhost:4200/#/onedata?action_name=confirmJoinSpaceRequest&action_spaceId=space-0&action_requestId=fb50b5c1e09b3910e89ab35327671e19ch18d4-a2647bf5
  membership_requester_info(operation) {
    if (operation !== 'get') {
      throw messageNotSupported;
    }
    return {
      userId: 'requesting_user_id',
      fullName: 'John Doe',
      username: 'joe',
      contactEmail: 'joe@example.com',
    };
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
          name: 'Elasticsearch',
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

const atmInventoryHandlers = {
  privileges(operation) {
    if (operation === 'get') {
      return {
        member: ['atm_inventory_view'],
      };
    } else {
      throw messageNotSupported;
    }
  },
};

const atmWorkflowSchemaHandlers = {
  dump(operation, entityId, { includeRevision }) {
    if (operation === 'create') {
      const atmWorkflowSchema = this.get('recordManager')
        .getLoadedRecordById('atmWorkflowSchema', entityId);
      const {
        name,
        summary,
        revisionRegistry,
      } = getProperties(atmWorkflowSchema, 'name', 'summary', 'revisionRegistry');
      return {
        schemaFormatVersion: 2,
        name,
        summary,
        revision: {
          schemaFormatVersion: 2,
          atmWorkflowSchemaRevision: revisionRegistry[includeRevision],
          originalRevisionNumber: includeRevision,
          supplementaryAtmLambdas: {},
        },
        originalAtmWorkflowSchemaId: entityId,
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
          error: { id: 'badValueToken' },
          data: {},
        };
      }
    } else {
      return messageNotSupported;
    }
  },
  verify_invite_token(operation, entityId, data) {
    if (operation === 'create') {
      const token = get(data, 'token');
      const tokenRecord = this.get('store').peekAll('token').findBy('token', token);
      if (tokenRecord.get('revoked')) {
        return {
          success: false,
          error: { id: 'tokenRevoked' },
          data: {},
        };
      } else if (tokenRecord.get('caveats').length > 0) {
        return {
          success: false,
          error: {
            id: 'tokenCaveatUnverified',
            details: {
              caveat: tokenRecord.get('caveats')[0],
            },
          },
          data: {},
        };
      } else {
        return {
          success: true,
          data: {},
        };
      }
    } else {
      return messageNotSupported;
    }
  },
};

export default OnedataGraphMock.extend({
  recordManager: service(),
  store: service(),

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
      atm_inventory: atmInventoryHandlers,
      atm_workflow_schema: atmWorkflowSchemaHandlers,
    });
    this.set(
      'handlers',
      _.merge({}, this.get('handlers'), _handlers)
    );
  },
});
