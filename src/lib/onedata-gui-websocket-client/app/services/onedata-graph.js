/**
 * Exports a real onedata-graph service or its mock.
 * @module services/onedata-graph
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import config from 'ember-get-config';
import { environmentExport } from 'onedata-gui-websocket-client/utils/development-environment';
import ProductionSymbol from 'onedata-gui-websocket-client/services/onedata-graph';
import DevelopmentSymbol from 'onedata-gui-websocket-client/services/mocks/onedata-graph';

export default environmentExport(config, ProductionSymbol, DevelopmentSymbol);
