/**
 * Adds query options handler
 *
 * @module controllers/public/shares
 * @author Michał Borzęcki
 * @copyright (C) 2020-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Controller from '@ember/controller';
import AspectOptionsHandler from 'onedata-gui-common/mixins/controllers/aspect-options-handler';

export default Controller.extend(AspectOptionsHandler, {
  queryParams: ['options'],
});
