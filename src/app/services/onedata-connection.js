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
   * @type {Ember.Computed<string>}
   */
  zoneName: reads('attributes.zoneName'),

  /**
   * Domain name of Onezone
   * @type {Ember.ComputedProperty<string>}
   */
  zoneDomain: reads('attributes.zoneDomain'),

  /**
   * Text shown on the sign-in page in logo
   * @type {Ember.Computed<string>}
   */
  brandSubtitle: reads('attributes.brandSubtitle'),

  /**
   * Max temporary token TTL in seconds
   * @type {Ember.Computed<string>}
   */
  maxTemporaryTokenTtl: reads('attributes.maxTemporaryTokenTtl'),
});

export default environmentExport(config, OnezoneConnection, DevelopmentSymbol);
