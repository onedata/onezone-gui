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

export default Service.extend({
  dataDiscoveryResources: service(),

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

    globalObject.dataDiscovery = {
      esRequest: (...args) => dataDiscoveryResources.esRequest(...args),
      configRequest: (...args) => dataDiscoveryResources.configRequest(...args),
    };
  },
});
