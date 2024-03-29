/**
 * Extends appModel to inject current user record,
 * thus the onedata route will be in loading state until we got current user
 * record
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import OnedataRoute from 'onedata-gui-common/routes/onedata';
import { Promise } from 'rsvp';
import AuthenticationErrorHandlerMixin from 'onedata-gui-common/mixins/authentication-error-handler';
import { get } from '@ember/object';
import { resolve } from 'rsvp';
import DisabledErrorCheckList from 'onedata-gui-common/utils/disabled-error-check-list';
import { onepanelAbbrev, oneproviderAbbrev } from 'onedata-gui-common/utils/onedata-urls';
import globals from 'onedata-gui-common/utils/globals';

export default OnedataRoute.extend(AuthenticationErrorHandlerMixin, {
  currentUser: service(),
  globalNotify: service(),
  appStorage: service(),
  navigationState: service(),

  beforeModel(transition) {
    const superResult = this._super(...arguments);
    if (get(transition, 'isAborted')) {
      return superResult;
    } else {
      return this.handleRedirection().then(() => superResult);
    }

  },

  model() {
    const currentUser = this.get('currentUser');
    return new Promise((resolve, reject) => {
      const creatingAppModel = this._super(...arguments);
      creatingAppModel.then(appModel => {
        const gettingUser = currentUser.getCurrentUserRecord();
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

  handleRedirection() {
    const queryParams = this.get('navigationState.queryParams');
    const redirectUrl = get(queryParams, 'redirect_url');
    if (redirectUrl) {
      delete queryParams.redirect_url;
      return new Promise(() => {
        const authRedirect = globals.sessionStorage.getItem('authRedirect');
        if (authRedirect) {
          globals.sessionStorage.removeItem('authRedirect');
          const urlMatch = redirectUrl.match(
            new RegExp(`/(${oneproviderAbbrev}|${onepanelAbbrev})/(.*?)/`)
          );
          const guiAbbrev = urlMatch && urlMatch[1];
          const clusterId = urlMatch && urlMatch[2];
          if (guiAbbrev === oneproviderAbbrev) {
            this.get('appStorage').setData('oneproviderAuthenticationError', '1');
            return this.transitionTo(
              'onedata.sidebar.index',
              'providers'
            );
          } else if (guiAbbrev === onepanelAbbrev && clusterId) {
            new DisabledErrorCheckList('clusterAuthentication')
              .disableErrorCheckFor(clusterId);
            return this.transitionTo(
              'onedata.sidebar.content.aspect',
              'clusters',
              clusterId,
              'authentication-error'
            );
          } else {
            throw {
              isOnedataCustomError: true,
              type: 'redirection-loop',
            };
          }
        } else {
          // Only redirect url in actual domain is acceptable (to not redirect
          // to some external, possibly malicious pages).
          globals.location.replace(globals.location.origin + redirectUrl);
        }
      });
    } else {
      return resolve();
    }
  },
});
