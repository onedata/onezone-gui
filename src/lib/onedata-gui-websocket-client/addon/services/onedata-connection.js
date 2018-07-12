/**
 * An abstraction layer for Onedata Sync API Websocket connection properties 
 *
 * @module services/onedata-connection
 * @author Jakub Liput, Michal Borzecki
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
   * @type {Ember.ComputedProperty<string>}
   */
  serviceVersion: reads('attributes.serviceVersion'),

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

  /**
   * @type {Ember.Computed<Array<string>>}
   */
  brandSubtitle: reads('attributes.brandSubtitle'),

  /**
   * @type {Ember.Computed<Array<string>>}
   */
  loginNotification: reads('attributes.loginNotification'),
});
