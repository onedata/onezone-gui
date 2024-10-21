/**
 * Runs check for problematic browser extenstions on application init.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import BlockingAddonDetector from 'onedata-gui-common/utils/blocking-addon-detector';

export default {
  initialize(applicationInstance) {
    (async () => {
      const blockingAddonDetector = BlockingAddonDetector.create({
        ownerSource: applicationInstance,
      });
      await blockingAddonDetector.runCheck();
      blockingAddonDetector.destroy();
    })();
  },
};
