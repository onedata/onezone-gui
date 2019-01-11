/**
 * Injects function for generating development model for onezone-gui
 *
 * @module routes/application
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OnedataApplicationRoute from 'onedata-gui-common/routes/application';
import DevelopmentModelRouteMixin from 'onedata-gui-websocket-client/mixins/routes/development-model';
import generateDevelopmentModel from 'onezone-gui/utils/generate-development-model';
import clearLocalStorageModel from 'onezone-gui/utils/clear-local-storage-model';
import { get, set } from '@ember/object';

export default OnedataApplicationRoute.extend(DevelopmentModelRouteMixin, {
  developmentModelConfig: Object.freeze({
    // FIXME: development mode
    clearOnReload: false,
  }),
  generateDevelopmentModel,
  clearDevelopmentModel: clearLocalStorageModel,

  beforeModel(transition) {
    this._super(...arguments);
    this.set('navigationState.queryParams', get(transition, 'queryParams'));
  },

  // setupController(controller) {
  //   set(controller, 'redirectUrl', this.get('navigationState.queryParams.redirectUrl'));
  // },
});
