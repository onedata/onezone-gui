/**
 * Injects function for generating development model for onezone-gui
 *
 * @module routes/application
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import OnedataApplicationRoute from 'onedata-gui-common/routes/application';
import DevelopmentModelRouteMixin from 'onedata-gui-websocket-client/mixins/routes/development-model';
import generateDevelopmentModel from 'onezone-gui/utils/generate-development-model';
import clearLocalStorageModel from 'onezone-gui/utils/clear-local-storage-model';

export default OnedataApplicationRoute.extend(DevelopmentModelRouteMixin, {
  globalGuiResources: service(),

  developmentModelConfig: Object.freeze({
    clearOnReload: false,
  }),
  generateDevelopmentModel,
  clearDevelopmentModel: clearLocalStorageModel,

  beforeModel() {
    const superResult = this._super(...arguments);

    const globalGuiResources = this.get('globalGuiResources');
    globalGuiResources.initializeGlobalObject();
    
    return superResult;
  },
});
