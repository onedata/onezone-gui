/**
 * Provides data for routes and components assoctiated with user linked accounts.
 *
 * @module services/linked-account-manager
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { default as Service, inject } from '@ember/service';

export default Service.extend({
  currentUser: inject(),

  /**
   * Fetches collection of all linked accounts
   * 
   * @return {Promise<DS.RecordArray<models/LinkedAccountList>>} resolves to
   * an array of linked accounts
   */
  getLinkedAccounts() {
    return this.get('currentUser').getCurrentUserRecord().then((user) =>
      user.get('linkedAccountList').then((linkedAccountList) =>
        linkedAccountList.get('list').then(() => linkedAccountList)
      )
    );
  },
});
