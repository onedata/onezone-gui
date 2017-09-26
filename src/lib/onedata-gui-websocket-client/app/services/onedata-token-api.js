/**
 * Exports a real onedata-token-api service or its mock.
 * @module services/onedata-token-api
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import config from 'ember-get-config';
import { environmentExport } from 'onedata-gui-websocket-client/utils/development-environment';
import ProductionSymbol from 'onedata-gui-websocket-client/services/onedata-token-api';
import DevelopmentSymbol from 'onedata-gui-websocket-client/services/mocks/onedata-token-api';

export default environmentExport(config, ProductionSymbol, DevelopmentSymbol);
