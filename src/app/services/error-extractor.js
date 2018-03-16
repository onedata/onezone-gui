/**
 * A service that provides method to extract onezone-specific error messages
 * from passed backend errors.
 * 
 * @module services/error-extractor
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ErrorExtractor from 'onedata-gui-common/services/error-extractor';
import getErrorDetails from 'onedata-gui-websocket-client/utils/get-error-description';

export default ErrorExtractor.extend({
  /**
   * @override
   */
  extractorFunction: getErrorDetails,
});
