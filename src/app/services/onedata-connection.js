/**
 * Exports a real onedata-connection service or its mock.
 * @module services/onedata-connection
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import config from 'ember-get-config';
import { environmentExport } from 'onedata-gui-websocket-client/utils/development-environment';
import ProductionSymbol from 'onedata-gui-websocket-client/services/onedata-connection';
import DevelopmentSymbol from 'onezone-gui/services/mocks/onedata-connection';
import { reads } from '@ember/object/computed';

const OnezoneConnection = ProductionSymbol.extend({
  /**
   * Name of zone instance
   * @type {ComputedProperty<String>}
   */
  zoneName: reads('attributes.zoneName'),

  /**
   * Domain name of Onezone
   * @type {ComputedProperty<String>}
   */
  zoneDomain: reads('attributes.zoneDomain'),

  /**
   * Text shown on the sign-in page in logo
   * @type {ComputedProperty<String>}
   */
  brandSubtitle: reads('attributes.brandSubtitle'),

  /**
   * Max temporary token TTL in seconds
   * @type {ComputedProperty<String>}
   */
  maxTemporaryTokenTtl: reads('attributes.maxTemporaryTokenTtl'),

  /**
   * Default location of harvesting backend (e.g. Elasticsearch)
   * @type {ComputedProperty<String>}
   */
  defaultHarvesterEndpoint: reads('attributes.defaultHarvesterEndpoint'),
});

export default environmentExport(config, OnezoneConnection, DevelopmentSymbol);
