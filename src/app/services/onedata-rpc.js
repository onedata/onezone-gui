/**
 * Exports a real onedata-rpc service or its mock.
 * @module services/onedata-rpc
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import config from 'ember-get-config';
import { environmentExport } from 'onedata-gui-websocket-client/utils/development-environment';
import ProductionSymbol from 'onedata-gui-websocket-client/services/onedata-rpc';
import DevelopmentSymbol from 'onezone-gui/services/mocks/onedata-rpc';

export default environmentExport(config, ProductionSymbol, DevelopmentSymbol);
