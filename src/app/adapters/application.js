/**
 * Exports a real onedata-websocket adapter or a development one
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import config from 'ember-get-config';
import { environmentExport } from 'onedata-gui-websocket-client/utils/development-environment';
import ProductionAdapter from 'onedata-gui-websocket-client/adapters/onedata-websocket';
import DevelopmentAdapter from 'onezone-gui/adapters/local-storage';
import { entityType as userEntityType } from 'onezone-gui/models/user';
import { entityType as groupEntityType } from 'onezone-gui/models/group';
import { entityType as spaceEntityType } from 'onezone-gui/models/space';
import { entityType as shareEntityType } from 'onezone-gui/models/share';
import { entityType as harvesterEntityType } from 'onezone-gui/models/harvester';
import { entityType as providerEntityType } from 'onezone-gui/models/provider';
import { entityType as clusterEntityType } from 'onezone-gui/models/cluster';
import { entityType as tokenEntityType } from 'onezone-gui/models/token';
import {
  entityType as atmInventoryEntityType,
} from 'onezone-gui/models/atm-inventory';
import { entityType as atmLambdaEntityType } from 'onezone-gui/models/atm-lambda';
import {
  entityType as atmWorkflowSchemaEntityType,
} from 'onezone-gui/models/atm-workflow-schema';

const OnedataAdapter = environmentExport(config, ProductionAdapter, DevelopmentAdapter);

export const entityTypeToEmberModelNameMap = Object.freeze(new Map([
  [groupEntityType, 'group'],
  [spaceEntityType, 'space'],
  [userEntityType, 'user'],
  [shareEntityType, 'share'],
  [harvesterEntityType, 'harvester'],
  [providerEntityType, 'provider'],
  [clusterEntityType, 'cluster'],
  [tokenEntityType, 'token'],
  [atmInventoryEntityType, 'atm-inventory'],
  [atmLambdaEntityType, 'atm-lambda'],
  [atmWorkflowSchemaEntityType, 'atm-workflow-schema'],
]));

export default OnedataAdapter.extend({
  /**
   * @override
   */
  entityTypeToEmberModelNameMap,
});
