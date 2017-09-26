/**
 * Injects function for generating development model for onezone-gui
 *
 * @module routes/application
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OnedataApplicationRoute from 'onedata-gui-common/routes/application';
import DevelopmentModelRouteMixin from 'onedata-gui-websocket-client/mixins/routes/development-model';
import generateDevelopmentModel from 'onezone-gui/utils/generate-development-model';

export default OnedataApplicationRoute.extend(DevelopmentModelRouteMixin, {
  generateDevelopmentModel,
});
