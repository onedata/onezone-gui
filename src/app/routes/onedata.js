/**
 * Extends appModel to inject current user record,
 * thus the onedata route will be in loading state until we got current user
 * record
 * @module onezone-gui/routes/onedata
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject } from '@ember/service';

import OnedataRoute from 'onedata-gui-common/routes/onedata';

export default OnedataRoute.extend({
  currentUser: inject(),

  model() {
    let currentUser = this.get('currentUser');
    return new Promise((resolve, reject) => {
      let creatingAppModel = this._super(...arguments);
      creatingAppModel.then(appModel => {
        let gettingUser = currentUser.getCurrentUserRecord();
        gettingUser.then(userRecord => {
          appModel.user = userRecord;
          resolve(appModel);
        });
        gettingUser.catch(reject);
      });
      creatingAppModel.catch(reject);
    });
  },
});
