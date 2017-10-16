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

  selectedProvider: null,

  _providersProxy: null,

  _providers: readOnly('_providersProxy.content'),

  _mobileMode: false,

  /**
   * Window resize event handler
   * @type {ComputedProperty<Function>}
   */
  _windowResizeHandler: computed(function () {
    return () => this._windowResized();
  }),

  _window: window,

  init() {
    this._super(...arguments);
    this.set('_providersProxy', PromiseObject.create({
      promise: this.get('providerManager').getProviders(),
    }));
    // this.get('_providersProxy').then((d) => console.log(d.objectAt(0).get('spaceList').get('list')));
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
