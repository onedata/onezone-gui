/**
 * A content page for single selected provider
 *
 * @module components/content-provider
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import { inject } from '@ember/service';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import clusterizeProviders from 'onedata-gui-common/utils/clusterize-providers-by-coordinates';
import $ from 'jquery';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend({
  classNames: ['content-providers'],

  providerManager: inject(),
  router: inject(),

  /**
   * Selected (active) provider
   * @virtual
   * @type {Provider}
   */
  selectedProvider: null,

  /**
   * @virtual
   */
  providerList: null,

  /**
   * @type {Ember.ComputedProperty<PromiseObject<DS.RecordArray<Provider>>>>}
   */
  _providersProxy: computed('providerList.list', function () {
    return PromiseObject.create({
      promise: this.get('providerList.list'),
    });
  }),

  /**
   * Array of all prviders
   * @type {Ember.ComputedProperty<DS.RecordArray<Provider>>>}
   */
  _providers: readOnly('_providersProxy.content'),

  /**
   * Clustered providers
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  _clusteredProviders: computed('_providers', function _clusteredProviders() {
    return clusterizeProviders(this.get('_providers') || []);
  }),

  /**
   * If true, page component has the mobile layout
   * @type {boolean}
   */
  _mobileMode: false,

  /**
   * Window resize event handler
   * @type {Ember.ComputedProperty<Function>}
   */
  _windowResizeHandler: computed(function () {
    return () => this._windowResized();
  }),

  /**
   * Window object (for testing purposes only)
   * @type {Window}
   */
  _window: window,

  didInsertElement() {
    this._super(...arguments);
    let {
      _window,
      _windowResizeHandler,
    } = this.getProperties('_window', '_windowResizeHandler');
    $(_window).on('resize', _windowResizeHandler);
    this._windowResized();
    this.$().click((event) => {
      safeExec(this, () => {
        const target = $(event.originalEvent.target);
        if (!this.get('_mobileMode')) {
          if (!target.hasClass('provider-place') &&
            target.parents('.provider-place').length === 0) {
            this.get('router').transitionTo(
              'onedata.sidebar.content',
              'providers',
              'not-selected'
            );
          }
        }
      });
    });
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

  actions: {
    providerChanged(provider) {
      this.get('router').transitionTo(
        'onedata.sidebar.content.aspect',
        'providers',
        get(provider, 'id'),
        'index'
      );
    },
  },
});
