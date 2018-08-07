/**
 * Exports a real onedata-websocket serializer or a development one
 *
 * @module serializers/application
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import config from 'ember-get-config';
import { environmentExport } from 'onedata-gui-websocket-client/utils/development-environment';
import ProductionSymbol from 'onedata-gui-websocket-client/serializers/onedata-websocket';
import DevelopmentSymbol from 'ember-local-storage/serializers/serializer';

export default environmentExport(config, ProductionSymbol, DevelopmentSymbol);
