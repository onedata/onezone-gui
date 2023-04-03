/**
 * Exports a real onedata-graph service or its mock.
 *
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import config from 'ember-get-config';
import { environmentExport } from 'onedata-gui-websocket-client/utils/development-environment';
import ProductionSymbol from 'onedata-gui-websocket-client/services/onedata-graph';
import DevelopmentSymbol from 'onezone-gui/services/mocks/onedata-graph';

export default environmentExport(config, ProductionSymbol, DevelopmentSymbol);
