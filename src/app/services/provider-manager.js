/**
 * Provides data for routes and components assoctiated with providers tab
 *
 * @module services/provider-manager
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

const {
  A,
  Service,
  inject: { service },
  RSVP: { Promise },
  Object: EmberObject,
} = Ember;

export default Service.extend({
  // TODO to implement using onedata-websocket services

  store: service(),

  /**
   * Fetch collection of onepanel ClusterStorage
   * 
   * @param {string} id
   * @return {ObjectPromiseProxy} resolves ArrayProxy of SpaceDetails promise proxies
   */
  getProviders() {
    return PromiseArray.create({
      promise: Promise.resolve(
        A([
          this.getRecord('p1'),
          this.getRecord('p2'),
          this.getRecord('p3'),
        ])
      ),
    });
  },

  /**
   * @param {string} id
   * @return {ObjectPromiseProxy} resolves ClusterStorage ObjectProxy
   */
  getRecord(id) {
    return PromiseObject.create({
      promise: Promise.resolve(
        EmberObject.create({
          id,
          name: `Example Pro (${id})`,
        })
      ),
    });
    // FIXME use store.findRecord
  },

});
