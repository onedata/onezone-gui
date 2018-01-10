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
              token: snapshot.id + 'tokenstring',
            },
          },
        };
      default:
        return result;
    } 
  },
});
