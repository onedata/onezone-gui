/**
 * Exposes onezone gui resources to global scope (using Window object)
 * 
 * @module services/global-gui-resources
 * @author Michal Borzecki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { set, getProperties } from '@ember/object';
import { resolve } from 'rsvp';

export default Service.extend({
  dataDiscoveryResources: service(),
  currentUser: service(),

  /**
   * @type {string}
   */
  windowPropertyName: 'onezoneGuiResources',

  /**
   * Global object reference (where exposed resources are stored). Set by
   * `initializeGlobalObject` method.
   * @type {Object}
   */
  globalObject: undefined,

  /**
   * @type {Window}
   */
  _window: window,

  /**
   * @type {Location}
   */
  _location: location,

  /**
   * Creates global object and attaches it to the Window object
   * @returns {Object} global object
   */
  initializeGlobalObject() {
    const {
      _window,
      windowPropertyName,
    } = this.getProperties('_window', 'windowPropertyName');

    const globalObject = this.set('globalObject', {});
    _window[windowPropertyName] = globalObject;
    
    // here goes all global data definition
    this.attachDataDiscoveryResources();
    
    return globalObject;
  },

  /**
   * Attaches data discovery resources to the global object
   * @returns {undefined}
   */
  attachDataDiscoveryResources() {
    const {
      dataDiscoveryResources,
      globalObject,
    } = this.getProperties('dataDiscoveryResources', 'globalObject');

    set(globalObject, 'dataDiscovery', {
      esRequest: (...args) => dataDiscoveryResources.esRequest(...args),
      configRequest: (...args) => dataDiscoveryResources.configRequest(...args),
      viewModeRequest: () => dataDiscoveryResources.viewModeRequest(),
      userRequest: () => this.getCurrentUser(),
      onezoneUrlRequest: () => this.getOnezoneUrl(),
    });
  },

  /**
   * Returns object containing info about current user. If there is no active
   * session, promise will resolve to null.
   * @returns {Promise<Object>}
   */
  getCurrentUser() {
    const currentUser = this.get('currentUser');
    return currentUser.getCurrentUserRecord().then(
      user => {
        const {
          entityId,
          name,
          alias,
        } = getProperties(user, 'entityId', 'name', 'alias');
        // Info about user should be restricted to few field to protect private,
        // internal data of Onedata
        return {
          id: entityId,
          name,
          alias,
        };
      },
      () => null,
    );
  },

  /**
   * Returns url to Onezone
   * @returns {Promise<string>}
   */
  getOnezoneUrl() {
    const _location = this.get('_location');
    const {
      origin,
      pathname,
    } = getProperties(_location, 'origin', 'pathname');

    const url = origin + pathname;
    return resolve(url);
  },
});
