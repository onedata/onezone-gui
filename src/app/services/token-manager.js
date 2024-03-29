/**
 * Provides data for routes and components associated with tokens tab.
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import { all as allFulfilled } from 'rsvp';
import { get } from '@ember/object';
import {
  tokenInviteTypeToTargetModelMapping,
} from 'onezone-gui/models/token';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { entityType as tokenEntityType } from 'onezone-gui/models/token';
import ignoreForbiddenError from 'onedata-gui-common/utils/ignore-forbidden-error';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';

const TokenManager = Service.extend({
  store: service(),
  currentUser: service(),
  recordManager: service(),
  onedataConnection: service(),
  onedataGraph: service(),
  onedataGraphUtils: service(),
  onedataGraphContext: service(),
  onezoneServer: service(),

  /**
   * Fetches collection of all tokens
   *
   * @returns {Promise<Models.TokenList>} resolves to a record containing
   *   an array of tokens
   */
  getTokens() {
    return this.get('recordManager').getUserRecordList('token');
  },

  /**
   * Returns token with specified gri
   * @param {String} gri
   * @returns {Promise<Models.Token>} token promise
   */
  getRecord(gri) {
    return this.get('recordManager').getRecord('token', gri);
  },

  /**
   * Creates new token
   * @param {Object} tokenPrototype token model prototype
   * @returns {Promise<Models.Token>}
   */
  createToken(tokenPrototype) {
    const currentUserEntityId = this.get('currentUser.userId');
    const additionalData = {};
    // New token prototype object is not compatible with Ember Data token model
    // specification, because create request body differs from the get request body.
    // To send a non-compatible token body, some of the fields must be sent using
    // `additionalData` GraphSync adapter option.
    const compatibleTokenPrototype = _.assign({}, tokenPrototype);
    [
      'privileges',
      'usageLimit',
    ].forEach(fieldName => {
      additionalData[fieldName] = compatibleTokenPrototype[fieldName];
      delete compatibleTokenPrototype[fieldName];
    });
    return this.get('store')
      .createRecord('token', _.merge(compatibleTokenPrototype, {
        _meta: {
          aspect: 'user_named_token',
          aspectId: currentUserEntityId,
          additionalData,
        },
      }))
      .save()
      .then(token => this.reloadList().then(() => token));
  },

  /**
   * @param {String} inviteType
   * @param {String} targetRecordId
   * @returns {Promise<String>}
   */
  createTemporaryInviteToken(inviteType, targetRecordId) {
    const {
      currentUser,
      onedataGraph,
    } = this.getProperties(
      'currentUser',
      'onedataGraph',
    );
    const currentUserEntityId = get(currentUser, 'userId');

    return this.createTemporaryInviteTokenTemplate(inviteType, targetRecordId)
      .then(tokenTemplate =>
        onedataGraph.request({
          gri: gri({
            entityId: null,
            entityType: tokenEntityType,
            aspect: 'user_temporary_token',
            aspectId: currentUserEntityId,
          }),
          operation: 'create',
          data: tokenTemplate,
          subscribe: false,
        })
      );
  },

  /**
   * Resolves to temporary token template (a plain object, which can be used to create
   * token record).
   * @param {String} inviteType
   * @param {String} targetRecordId
   * @returns {Promise<Object>}
   */
  createTemporaryInviteTokenTemplate(inviteType, targetRecordId) {
    const {
      currentUser,
      onedataConnection,
      onezoneServer,
    } = this.getProperties(
      'currentUser',
      'onedataConnection',
      'onezoneServer'
    );

    const currentUserEntityId = get(currentUser, 'userId');
    const normalizedTargetRecordId = inviteType === 'registerOneprovider' ?
      currentUserEntityId : targetRecordId;
    const maxTtl = get(onedataConnection, 'maxTemporaryTokenTtl');
    const inviteTypeSpec = tokenInviteTypeToTargetModelMapping[inviteType];

    return onezoneServer.getServerTime()
      .then(serverTimestamp => ({
        type: {
          inviteToken: {
            inviteType,
            [inviteTypeSpec.idFieldName]: normalizedTargetRecordId,
          },
        },
        caveats: [{
          type: 'time',
          validUntil: serverTimestamp + Math.min(maxTtl, 14 * 24 * 60 * 60),
        }],
      }));
  },

  /**
   * Deletes token
   * @param {string} id token id
   * @returns {Promise}
   */
  deleteToken(id) {
    return this.getRecord(id)
      .then(token => token.destroyRecord())
      .then(destroyResult =>
        this.get('recordManager').reloadUserRecordList('token').then(() => destroyResult)
      );
  },

  /**
   * Gets information about given token
   * @param {String} token
   * @returns {Promise}
   */
  examineToken(token) {
    return this.get('onedataGraph').request({
      gri: gri({
        entityType: tokenEntityType,
        entityId: 'null',
        aspect: 'examine',
        scope: 'public',
      }),
      operation: 'create',
      data: { token },
      subscribe: false,
    });
  },

  /**
   * Verify given invite token
   * @param {String} token
   * @returns {Promise}
   */
  verifyInviteToken(token) {
    return this.get('onedataGraph').request({
      gri: gri({
        entityType: tokenEntityType,
        entityId: 'null',
        aspect: 'verify_invite_token',
        scope: 'public',
      }),
      operation: 'create',
      data: { token },
      subscribe: false,
    });
  },

  /**
   * @param {String} token
   * @param {String} targetModelName
   * @param {String} joiningModelName
   * @param {String} joiningRecordId
   * @returns {Promise<GraphSingleModel>} target record
   */
  consumeInviteToken(token, targetModelName, joiningModelName, joiningRecordId) {
    const {
      store,
      onedataGraphUtils,
      onedataGraphContext,
      recordManager,
    } = this.getProperties(
      'store',
      'onedataGraphUtils',
      'onedataGraphContext',
      'recordManager'
    );
    const adapter = store.adapterFor('user');
    const targetEntityType = adapter.getEntityTypeForModelName(targetModelName);
    const joiningEntityType = adapter.getEntityTypeForModelName(joiningModelName);
    return onedataGraphUtils.joinRelation(
      targetEntityType,
      token, [`as${_.upperFirst(joiningEntityType)}`, joiningRecordId]
    ).then(({ gri: targetGri }) => {
      const targetId = parseGri(targetGri).entityId;
      const targetGriWithAutoScope = gri({
        entityType: targetEntityType,
        entityId: targetId,
        aspect: 'instance',
        scope: 'auto',
      });
      onedataGraphContext.register(targetGriWithAutoScope, gri({
        entityType: joiningEntityType,
        entityId: joiningRecordId,
        aspect: 'instance',
        scope: 'auto',
      }));
      return allFulfilled([
        recordManager.reloadRecordListById(
          joiningModelName,
          joiningRecordId,
          targetModelName
        ).catch(ignoreForbiddenError),
        recordManager.reloadRecordListById(
          targetModelName,
          targetId,
          joiningModelName
        ).catch(ignoreForbiddenError),
        recordManager.reloadUserRecordList(targetModelName),
      ]).then(() =>
        recordManager.getRecord(targetModelName, targetGriWithAutoScope)
        .catch(error => {
          // It is possible in some invite scenarios (like space -> harvester), that
          // user cannot fetch target record after joining, because he did not become
          // a member of a target record. In such situations "forbidden" errors are normal.
          if (error && error.id === 'forbidden') {
            return null;
          }
          throw error;
        })
      );
    });
  },

  /**
   * Reloads token list (if already loaded)
   * @returns {Promise<TokenList>}
   */
  reloadList() {
    return this.get('recordManager').reloadUserRecordList('token');
  },
});

export default TokenManager;
