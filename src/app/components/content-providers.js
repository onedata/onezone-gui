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
import { reads } from '@ember/object/computed';
import { inject } from '@ember/service';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import clusterizeProviders from 'onedata-gui-common/utils/clusterize-providers-by-coordinates';
import $ from 'jquery';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import _ from 'lodash';

export default Component.extend({
  classNames: ['content-providers'],

  providerManager: inject(),
  router: inject(),
  guiUtils: inject(),
  navigationState: inject(),

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
   * @type {Object}
   */
  _mapState: undefined,

  /**
   * @type {number}
   */
  _mapCalculatedAreaPadding: 2,

  /**
   * XY coordinates of map drag start.
   * @type {object}
   */
  dragStartXY: Object.freeze({}),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isWhileDraggingMap: computed('dragStartXY', function () {
    const dragStartXY = this.get('dragStartXY');
    return dragStartXY.x !== undefined && dragStartXY.y !== undefined;
  }),

  /**
   * @type {Ember.ComputedProperty<object>}
   */
  _mapDefaultState: computed(
    '_providers.@each.{latitude,longitude}',
    '_mapCalculatedAreaPadding',
    function () {
      const {
        _providers,
        _mapCalculatedAreaPadding,
      } = this.getProperties('_providers', '_mapCalculatedAreaPadding');
      if (!_providers || get(_providers, 'length') === 0) {
        return {
          lat: 0,
          lng: 0,
          scale: 1,
        };
      } else {
        const latitudes = _providers.map(p => get(p, 'latitude'));
        const longitudes = _providers.map(p => get(p, 'longitude'));
        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);
        const areaWidth = (maxLng - minLng) * _mapCalculatedAreaPadding;
        const areaHeight = (maxLat - minLat) * _mapCalculatedAreaPadding;
        const xScale = 360 / areaWidth;
        const yScale = 180 / areaHeight;
        const scale = Math.max(1, Math.min(xScale, yScale));
        return {
          lat: (minLat + maxLat) / 2,
          lng: (minLng + maxLng) / 2,
          scale,
        };
      }
    }
  ),

  /**
   * Map state passed via query params
   * @type {Ember.ComputedProperty<object>}
   */
  _mapInitialState: computed(
    'navigationState.queryParams',
    '_mapDefaultState',
    function () {
      const queryParams = this.get('navigationState.queryParams');
      const mapStateFromQuery = Object.keys(queryParams).reduce((s, key) => {
        if (_.startsWith(key, 'map')) {
          const newKey = key.substring(4);
          s[newKey] = queryParams[key];
        }
        return s;
      }, {});
      if (Object.keys(mapStateFromQuery).length > 0) {
        return mapStateFromQuery;
      } else {
        return this.get('_mapDefaultState');
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty<number>}
   */
  _providerCircleScale: computed('_mapState.scale', function () {
    return 1.4 + this.get('_mapState.scale') / 6;
  }),

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
  _providers: reads('_providersProxy.content'),

  /**
   * Clustered providers
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  _clusteredProviders: computed(
    '_providers',
    '_mapState',
    function _getClusteredProviders() {
      const {
        _providers,
        _mapState,
      } = this.getProperties('_providers', '_mapState');
      const squareSideLength = 15 / (_mapState.scale || 1);
      return clusterizeProviders(_providers || [], squareSideLength, squareSideLength);
    }
  ),

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

  init() {
    this._super(...arguments);
    this.set('_mapState', {
      lat: 0,
      lng: 0,
      scale: 1,
    });
  },

  didInsertElement() {
    this._super(...arguments);
    const {
      _window,
      _windowResizeHandler,
    } = this.getProperties('_window', '_windowResizeHandler');
    $(_window).on('resize', _windowResizeHandler);
    this._windowResized();
    const thisElement = this.$()[0];
    thisElement.addEventListener('mousedown', (event) => {
      safeExec(this, () => {
        this.set('dragStartXY', { x: event.clientX, y: event.clientY });
      });
    }, true);
    thisElement.addEventListener('mouseup', (event) => {
      safeExec(this, () => {
        const dragStartXY = this.get('dragStartXY');
        this.set('dragStartXY', {});
        if (dragStartXY.x === event.clientX && dragStartXY.y === event.clientY) {
          const target = $(event.target);
          if (!this.get('_mobileMode')) {
            const ignoredElements =
              '.provider-place, .jvectormap-zoomin, .jvectormap-zoomout';
            if (!target.is(ignoredElements) &&
              target.parents(ignoredElements).length === 0) {
              const queryMapState = this._getQueryMapState();
              this.get('router').transitionTo(
                'onedata.sidebar.content',
                'providers',
                'not-selected', { queryParams: queryMapState }
              );
            }
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

  /**
   * Generates query-params object with map state, that can be passed to
   * transition.
   * @returns {object}
   */
  _getQueryMapState() {
    return _.mapKeys(this.get('_mapState') || {}, (v, k) => 'map_' + k);
  },

  actions: {
    mapViewportChanged(event) {
      this.set('_mapState', {
        lat: event.lat,
        lng: event.lng,
        scale: event.scale,
      });
    },
    providerSelected(provider) {
      const queryParams = this._getQueryMapState();
      this.get('router').transitionTo(
        'onedata.sidebar.content',
        'providers',
        this.get('guiUtils').getRoutableIdFor(provider), { queryParams }
      );
    },
  },
});
