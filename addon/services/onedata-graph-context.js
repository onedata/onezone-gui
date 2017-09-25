/**
 * Globally stores mapping of records to other records that should be used for
 * authHint
 *
 * Only ids are stored. The `register` method is used automatically by serializer,
 * and `deregister` should be used when record is removed from store (either by
 * conscious `destroyRecord` or when removed from store by push.
 *
 * Glossary:
 * - `requestedGri` is GRI (which is used as a record ID) of record, that needs
 *    using an `authHint` on `findRecord`
 * - `contextGri` is GRI (record ID) of record, that serves as an `authHint` for
 *    finding other record
 *
 * Every `requestedGri` can be theoretically fetched by multiple `contextGri`s,
 * so a list of `contextGri`s is stored for each `requestedGri`.
 * It's indifferent which `contextGri` will be used for fetching `requestedGri`
 * as long as `contextGri` is valid (the record exists, user has permissions to
 * it and it still can be used as an authHint for `requestedGri`).
 *
 * TODO: implement auto remove of contextGris in above situations
 * TODO: remove
 *
 * @module services/onedata-graph-context
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import authHintGet from 'onedata-gui-websocket-client/utils/auth-hint-get';
import _ from 'lodash';

export default Service.extend({
  /**
   * Maps: recordId (String) -> list of internal Id of record that
   * requested it (Array.String)
   * @type {Map}
   */
  findRecordContext: null,

  init() {
    this._super(...arguments);
    this.set('findRecordContext', new Map());
  },

  /**
   * Adds an entry to records mapping (see `findRecordContext` property)
   * @param {string} requestedGri GRI (just record id)
   * @param {string} contextGri GRI (just record id)
   * @returns {undefined}
   */
  register(requestedGri, contextGri) {
    let contexts = this.get('findRecordContext');
    let registeredContexts = contexts.get(requestedGri);
    if (registeredContexts == null) {
      registeredContexts = [];
      contexts.set(requestedGri, registeredContexts);
    }
    registeredContexts.push(contextGri);
  },

  /**
   * Removes GRI from context of all possible requestedGri
   * @param {string} contextGri GRI
   * @returns {undefined}
   */
  deregister(contextGri) {
    let contexts = this.get('findRecordContext');
    contexts.forEach(registeredContexts =>
      _.pull(registeredContexts, contextGri)
    );
  },

  /**
   * Take last registered contextGri for some requestedGri if available
   * @param {String} requestedId
   * @returns {String|undefined} GRI of collection record that holds record
   *   with requestedId; if not registered: returns undefined
   */
  getContext(requestedId) {
    let registeredContexts = this.get('findRecordContext').get(requestedId);
    return registeredContexts && registeredContexts[registeredContexts.length - 1];
  },

  /**
   * Create complete authHint for some requestedId, based on registered context
   * if available.
   * @param {string} requestedId
   * @returns {Array<string>|undefined} [auth hint type, context GRI]
   *   or undefined when there is no auth hint for `requestedId`
   */
  getAuthHint(requestedId) {
    let contextId = this.getContext(requestedId);
    if (contextId) {
      let contextEntityId = contextId.match(/.*\.(.*)\..*/)[1];
      return [authHintGet(contextId), contextEntityId];
    }
  },
});
