/**
 * Provides data for routes and components associated with user linked accounts.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { default as Service, inject } from '@ember/service';

export default Service.extend({
  currentUser: inject(),

  /**
   * Fetches collection of all linked accounts
   *
   * @returns {Promise<DS.RecordArray<models/LinkedAccountList>>} resolves to
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
