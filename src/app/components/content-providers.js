/**
 * A content page for single selected provider
 *
 * @module components/content-provider
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import { inject } from '@ember/service';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Component.extend({
  classNames: ['content-providers'],

  providerManager: inject(),

  /**
   * Selected (active) provider
   * @virtual
   * @type {Provider}
   */
  selectedProvider: null,

  /**
   * Proxy with an array of all provider
   * @type {PromiseObject<DS.RecordArray<Provider>>}
   */
  _providersProxy: null,

  /**
   * Array of all prviders
   * @type {DS.RecordArray<Provider>>}
   */
  _providers: readOnly('_providersProxy.content'),

  /**
   * If true, page component has the mobile layout
   * @type {boolean}
   */
  _mobileMode: false,

  /**
   * Window resize event handler
   * @type {ComputedProperty<Function>}
   */
  _windowResizeHandler: computed(function () {
    return () => this._windowResized();
  }),

  /**
   * Window object (for testing purposes only)
   * @type {Window}
   */
  _window: window,

  init() {
    this._super(...arguments);
    this.set('_providersProxy', PromiseObject.create({
      promise: this.get('providerManager').getProviders(),
    }));
  },

  didInsertElement() {
    this._super(...arguments);
    let {
      _window,
      _windowResizeHandler,
    } = this.getProperties('_window', '_windowResizeHandler');
    $(_window).on('resize', _windowResizeHandler);
    this._windowResized();
  },

  willDestroyElement() {
    try {
      let {
        _window,
        _windowResizeHandler,
      } = this.getProperties('_window', '_windowResizeHandler');
      $(_window).off('resize', _windowResizeHandler);
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * Checks if the browser window has mobile width or not
   * @returns {undefined}
   */
  _windowResized() {
    this.set('_mobileMode', window.innerWidth < 768);
  },
});
