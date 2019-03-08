/**
 * Extends appModel to inject current user record,
 * thus the onedata route will be in loading state until we got current user
 * record
 * @module onezone-gui/routes/onedata
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import OnedataRoute from 'onedata-gui-common/routes/onedata';
import { Promise } from 'rsvp';
import AuthenticationErrorHandlerMixin from 'onedata-gui-common/mixins/authentication-error-handler';

export default OnedataRoute.extend(AuthenticationErrorHandlerMixin, {
  currentUser: service(),
  globalNotify: service(),

  beforeModel() {
    const redirectUrl = sessionStorage.getItem('redirectUrl');
    if (redirectUrl) {
      sessionStorage.removeItem('redirectUrl');
      return new Promise(() => {
        const authRedirect = sessionStorage.getItem('authRedirect');
        if (authRedirect) {
          sessionStorage.removeItem('authRedirect');
          const urlMatch = redirectUrl.match(/\/(ozp|opp)\/(.*?)\//);
          const clusterId = urlMatch && urlMatch[2];
          if (clusterId) {
            this.transitionTo(
              'onedata.sidebar.content.aspect',
              'clusters',
              clusterId,
              'authentication-error'
            );
            // TODO: better handle for OP redirection loop (which is rare)
          } else {
            throw {
              isOnedataCustomError: true,
              type: 'redirection-loop',
            };
          }
        } else {
          
          // Only redirect url in actual domain is acceptable (to not redirect
          // to some external, possibly malicious pages).
          window.location = window.location.origin + redirectUrl;
        }
      });
    }
  },

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

  setupController(controller) {
    this._super(...arguments);
    const errors = this.consumeAuthenticationError();
    controller.setProperties(errors);
    if (errors.authenticationErrorReason) {
      controller.set('authenticationErrorOpened', true);
    }
  },
});
