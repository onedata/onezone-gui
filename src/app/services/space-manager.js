/**
 * Provides data for routes and components assoctiated with spaces tab
 *
 * @module services/space-manager
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject } from '@ember/service';
import { get } from '@ember/object';

export default Service.extend({
  store: inject(),
  currentUser: inject(),

  /**
   * Fetches collection of all spaces
   * 
   * @return {Promise<DS.RecordArray<Space>>} resolves to an array of providers
   */
  getSpaces() {
    return this.get('currentUser')
      .getCurrentUserRecord()
      .then(user => user.get('spaceList'));
  },

  /**
   * Returns provider with specified id
   * @param {string} id
   * @return {Promise<Provider>} space promise
   */
  getRecord(id) {
    return this.get('store').findRecord('space', id);
  },

  createRecord({ name }) {
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => {
        return this.get('store').createRecord('space', {
            name,
            _meta: {
              authHint: ['asUser', get(user, 'entityId')],
            },
          })
          .save()
          .then(space => user.belongsTo('spaceList').reload(true)
            .then(() => space)
          );
      });
  },
});
