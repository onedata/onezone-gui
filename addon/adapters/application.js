/**
 * Exports a real onedata-websocket adapter or a development one
 * @module adapters/application
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import config from 'ember-get-config';
import { environmentExport } from 'onedata-gui-websocket-client/utils/development-environment';
import ProductionAdapter from 'onedata-gui-websocket-client/adapters/onedata-websocket';
import DevelopmentAdapter from 'onedata-gui-websocket-client/adapters/local-storage';

export default environmentExport(config, ProductionAdapter, DevelopmentAdapter);
