/**
 * A serializer that should be used for models that need authHint when finding
 * record.
 *
 * @module serializers/-context-collection
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Serializer from 'onedata-gui-websocket-client/serializers/application';

import { inject } from '@ember/service';

export default Serializer.extend({
  onedataGraphContext: inject(),

  /**
   * @override Serializer#normalize by adding registration of list item context
   *   for further findRecord
   * @param {*} typeClass 
   * @param {*} hash 
   */
  normalize(typeClass, hash) {
    this.registerContextForItems(hash);
    return this._super(typeClass, hash);
  },

  // TODO: globally setting is hazardous, consider:
  /// - get group1 with list of users - user1 will have context of group1
  /// - get group2 with list of users - user1 will have context of group2
  /// - leave group2
  /// - go to group1 and fetch users - user1 will try to be fetched by group2
  // TODO: deregister from onedataGraphContext after each removing in adapter etc.
  /**
   * Registers context ("through what record should we ask for record?")
   * for each of elements of list of this raw record.
   * @param {Object} hash raw object returned from graph
   * @param {Array<string>} hash.list each element is a foreign key (GRI)
   * @returns {undefined}
   */
  registerContextForItems(hash) {
    var collectionList = hash.list;

    if (collectionList) {
      let onedataGraphContext = this.get('onedataGraphContext');
      collectionList.forEach(itemId => {
        onedataGraphContext.register(itemId, hash.gri);
      });
    }
  },
});
