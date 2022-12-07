/**
 * A content page for single selected provider
 *
 * @module components/content-providers
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import {
  computed,
  observer,
  get,
  getProperties,
} from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import clusterizeProviders from 'onedata-gui-common/utils/clusterize-providers-by-coordinates';
import mapPositionForCoordinates from 'onedata-gui-common/utils/map-position-for-coordinates';
import { scheduleOnce } from '@ember/runloop';
import $ from 'jquery';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import _ from 'lodash';
import { Promise } from 'rsvp';
import getVisitOneproviderUrl from 'onedata-gui-common/utils/get-visit-oneprovider-url';

export default Component.extend({
  classNames: ['content-providers'],

  providerManager: service(),
  router: service(),
  guiUtils: service(),
  navigationState: service(),
  alertService: service('alert'),
  appStorage: service(),

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
   * @type {boolean}
   */
  defaultMapStateGenerated: false,

  /**
   * @type {boolean}
   */
  _mapDefaultState: Object.freeze({
    lat: 0,
    lng: 0,
    scale: 1,
  }),

  /**
   * If true, page component has the mobile layout
   * @type {boolean}
   */
  _mobileMode: false,

  /**
   * Window object (for testing purposes only)
   * @type {Window}
   */
  _window: window,

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
    return 2 + this.get('_mapState.scale') / 3;
  }),

  /**
   * @type {Ember.ComputedProperty<PromiseObject<DS.RecordArray<Provider>>>>}
   */
  _providersProxy: reads('providerList.list'),

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
    '_providers.@each.{latitude,longitude}',
    '_mapState',
    function _getClusteredProviders() {
      const {
        _providers,
        _mapState,
      } = this.getProperties('_providers', '_mapState');
      const squareSideLength = 15 / (_mapState.scale || 1);
      scheduleOnce('afterRender', this, () =>
        this.get('_window').dispatchEvent(new Event('providerPlaceRefresh'))
      );
      return clusterizeProviders(_providers || [], squareSideLength,
        squareSideLength);
    }
  ),

  /**
   * Window resize event handler
   * @type {Ember.ComputedProperty<Function>}
   */
  _windowResizeHandler: computed(function () {
    return () => this._windowResized();
  }),

  mapDefaultStateObserver: observer(
    '_mapCalculatedAreaPadding',
    '_providersProxy.{isFulfilled,content.@each.latitude,content.@each.longitude}',
    function mapDefaultStateObserver() {
      const {
        _mapCalculatedAreaPadding,
        _providersProxy,
        defaultMapStateGenerated,
      } = this.getProperties(
        '_mapCalculatedAreaPadding',
        '_providersProxy',
        'defaultMapStateGenerated',
      );
      if (!defaultMapStateGenerated && get(_providersProxy, 'isFulfilled')) {
        const providers = get(_providersProxy, 'content');
        if (get(providers, 'length') > 0) {
          const points =
            providers.map(p => getProperties(p, 'latitude', 'longitude'));
          const mapPosition =
            mapPositionForCoordinates(points, _mapCalculatedAreaPadding);
          this.set('_mapDefaultState', {
            lat: mapPosition.latitude,
            lng: mapPosition.longitude,
            scale: mapPosition.scale,
          });
        }
        this.set('defaultMapStateGenerated', true);
      }
    }
  ),

  init() {
    this._super(...arguments);
    this.set('_mapState', {
      lat: 0,
      lng: 0,
      scale: 1,
    });
    this.mapDefaultStateObserver();
  },

  didInsertElement() {
    this._super(...arguments);
    const {
      element,
      _window,
      _windowResizeHandler,
    } = this.getProperties('element', '_window', '_windowResizeHandler');
    this.checkOneproviderAuthenticationError();
    $(_window).on('resize', _windowResizeHandler);
    this._windowResized();
    element.addEventListener('mousedown', (event) => {
      safeExec(this, () => {
        this.set('dragStartXY', { x: event.clientX, y: event.clientY });
      });
    }, true);
    element.addEventListener('mouseup', (event) => {
      safeExec(this, () => {
        const dragStartXY = this.get('dragStartXY');
        this.set('dragStartXY', {});
        if (dragStartXY.x === event.clientX && dragStartXY.y === event.clientY) {
          if (!this.get('_mobileMode')) {
            const ignoredElements =
              '.provider-place, .jvectormap-zoomin, .jvectormap-zoomout';
            if (!event.target.closest(ignoredElements)) {
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
      const {
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

  checkOneproviderAuthenticationError() {
    const appStorage = this.get('appStorage');
    if (appStorage.getData('oneproviderAuthenticationError')) {
      appStorage.removeData('oneproviderAuthenticationError');
      const {
        i18n,
        alertService,
      } = this.getProperties('i18n', 'alertService');
      alertService.error(null, {
        componentName: 'alerts/oneprovider-authentication-error',
        header: i18n.t('components.alerts.oneproviderAuthenticationError.header'),
      });
    }
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
    goToProvider(provider) {
      if (get(provider, 'online') === true) {
        const {
          router,
          guiUtils,
          _window,
        } = this.getProperties(
          'router',
          'guiUtils',
          '_window'
        );
        return get(provider, 'spaceList')
          .then(spaceList => get(spaceList, 'list'))
          .then(list => get(list, 'firstObject'))
          .then(space => {
            return get(provider, 'versionProxy').then(providerVersion => {
              const oneproviderUrl = getVisitOneproviderUrl({
                router,
                guiUtils,
                provider,
                providerVersion,
                space,
              });
              return new Promise(() => _window.open(oneproviderUrl, '_self'));
            });
          });
      }
    },
  },
});
