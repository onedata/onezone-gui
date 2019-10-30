/**
 * Dedicated adapter for token-list model.
 *
 * @module components/adapters/token-list
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ApplicationAdapter from 'onedata-gui-websocket-client/adapters/application';

export default ApplicationAdapter.extend({
  /**
   * @override
   */
  subscribe: false,
});
