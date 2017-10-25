/**
 * Exports a real `session-store:onedata-websocket` or a development one
 *
 * @module session-stores/application
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import config from 'ember-get-config';
import { environmentExport } from 'onedata-gui-websocket-client/utils/development-environment';
import ProductionSymbol from 'onedata-gui-websocket-client/session-stores/onedata-websocket';
import DevelopmentSymbol from 'onedata-gui-websocket-client/session-stores/mocks/onedata-websocket';

export default environmentExport(config, ProductionSymbol, DevelopmentSymbol);
