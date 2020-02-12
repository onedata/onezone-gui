/**
 * Provides data for routes and components associated with tokens tab.
 *
 * @module services/token-manager
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import { resolve, allSettled } from 'rsvp';
import { get } from '@ember/object';

const TokenManager = Service.extend({
  store: service(),
  currentUser: service(),
  i18n: service(),

  /**
   * Fetches collection of all tokens
   * 
   * @return {Promise<DS.RecordArray<Models.Token>>} resolves to an array of tokens
   */
  getTokens() {
    return this.get('currentUser')
      .getCurrentUserRecord()
      .then(user => user.get('tokenList'))
      .then(tokenList => tokenList.get('list')
        .then(list => allSettled(list.map(token => get(token, 'tokenTargetProxy'))))
        .then(() => tokenList)
      );
  },

  /**
   * Returns token with specified id
   * @param {string} id
   * @param {boolean} backgroundReload
   * @return {Promise<Models.Token>} token promise
   */
  getRecord(id, backgroundReload = true) {
    return this.get('store').findRecord('token', id, { backgroundReload });
  },

  /**
   * Creates new token
   * @param {Object} tokenPrototype token model prototype
   * @returns {Promise<Models.Token>}
   */
  createToken(tokenPrototype) {
    const currestUserEntityId = this.get('currentUser.userId');
    const additionalData = {};
    const compatibleTokenPrototype = _.assign({}, tokenPrototype);
    [
      'privileges',
    ].forEach(fieldName => {
      additionalData[fieldName] = compatibleTokenPrototype[fieldName];
      delete compatibleTokenPrototype[fieldName];
    });
    return this.get('store')
      .createRecord('token', _.merge(compatibleTokenPrototype, {
        _meta: {
          aspect: 'user_named_token',
          aspectId: currestUserEntityId,
          additionalData,
        },
      }))
      .save()
      .then(token => this.reloadList().then(() => token));
  },

  /**
   * Deletes token
   * @param {string} id token id
   * @returns {Promise}
   */
  deleteToken(id) {
    return this.getRecord(id)
      .then(token => token.destroyRecord()
        .then(destroyResult => {
          this.get('currentUser')
            .getCurrentUserRecord()
            .then(user => user.belongsTo('tokenList').reload())
            .then(() => destroyResult);
        })
      );
  },

  /**
   * Reloads token list
   * @returns {Promise<TokenList>}
   */
  reloadList() {
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => user.belongsTo('tokenList').reload(true));
  },

  /**
   * Reloads token list only if it has been already fetched
   * @returns {Promise<Models.TokenList|null>}
   */
  reloadListIfAlreadyFetched() {
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => {
        const tokenListRelation = user.belongsTo('tokenList');
        if (tokenListRelation.value() !== null) {
          return tokenListRelation.reload(true);
        } else {
          return resolve(null);
        }
      });
  },
});

export default TokenManager;
