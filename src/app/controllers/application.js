/**
 * Handle query params for application route
 *
 * @module controllers/application
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['redirectUrl'],
  redirectUrl: null,
});
