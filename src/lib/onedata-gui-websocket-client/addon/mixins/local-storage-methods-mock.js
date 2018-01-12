/**
 * Mixin with custom local-storage adapter model methods implementation 
 * for mocking purposes.
 *
 * @module mixins/local-storage-methods-mock
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const CLIENT_TOKEN_PREFIX = 'MDAxNWxvY2F00aW9uIG9uZXpvbmUKMDAzYmlkZW500aWZpZX' +
  'IgQ1NPdEp5OEc5R19XdG96b1JMUzhlaDlQSkpJbjk3d3U3bzIwbVU1NkhnMAowMDFhY2lkIHRp' +
  'bWUgPCAxNTQ2OTQ3MjY5CjAwMmZzaWduYXR1cmUgGQBEVOx4J8kMbqR5h801dXEcKvkhDEsZA5' +
  'aDoLmCia01E';

export default Ember.Mixin.create({
  createRecord(store, type, snapshot) {
    const result = this._super(...arguments);
    switch (snapshot.modelName) {
      case 'client-token':
        return {
          data: {
            type: snapshot.modelName,
            id: snapshot.id,
            attributes: {
              token: CLIENT_TOKEN_PREFIX + snapshot.id,
            },
          },
        };
      default:
        return result;
    } 
  },
});
