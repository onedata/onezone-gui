/**
 * An abstraction layer for Onedata Sync API Websocket connection properties 
 *
 * @module services/onedata-connection
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';

import Service, { inject } from '@ember/service';

export default Service.extend({
  onedataWebsocket: inject(),

  attributes: reads('onedataWebsocket.connectionAttributes'),

  /**
   * Name of zone instance
   * @type {Ember.Computed<string>}
   */
  zoneName: reads('attributes.zoneName'),

  /**
   * @type {Ember.Computed<Array<string>>}
   */
  idps: reads('attributes.idps'),

  /**
   * Stores list of identity provider ids,
   * which is a list of authorizers that are available on login screen.
   * It's an alias to `idps` attribute.
   * @type {Ember.Computed<Array<string>>}
   */
  identityProviders: reads('idps'),
});
