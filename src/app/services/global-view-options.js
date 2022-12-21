/**
 * Implementation of `global-view-options` for `onezone-gui`.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import GlobalViewOptionsBase from 'onedata-gui-common/services/global-view-options';

export default GlobalViewOptionsBase.extend({
  /**
   * @override
   */
  staticViewOptions: Object.freeze({
    spaces: {
      configuration: {
        className: 'full-height fill-flex-using-column fill-flex-limited',
      },
    },
  }),
});
