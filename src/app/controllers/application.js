/**
 * Handle query params for application route
 *
 * @module controllers/application
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  queryParams: ['redirect_url'],
  redirectUrl: alias('redirect_url'),
});
