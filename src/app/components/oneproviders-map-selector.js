/**
 * Renders scalable map with Oneproviders, that allows selection.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, getProperties } from '@ember/object';
import { quotient, raw, sum } from 'ember-awesome-macros';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import clusterizeProviders from 'onedata-gui-common/utils/clusterize-providers-by-coordinates';
import mapPositionForCoordinates from 'onedata-gui-common/utils/map-position-for-coordinates';
import { scheduleOnce } from '@ember/runloop';
import globals from 'onedata-gui-common/utils/globals';

export default Component.extend({
  classNames: ['oneproviders-map-selector'],
  classNameBindings: ['isExpanded:expanded:collapsed'],

  /**
   * @virtual
   * @type {boolean}
   */
  isExpanded: false,

  /**
   * @virtual
   * @type {Array<Models.Provider>}
   */
  oneproviders: undefined,

  /**
   * @virtual
   * @type {Models.Provider}
   */
  selectedOneprovider: undefined,

  /**
   * @virtual
   * @type {Function}
   * @param {Models.Provider} oneprovider
   * @returns {undefined}
   */
  onOneproviderSelected: notImplementedIgnore,

  /**
   * @type {number}
   */
  mapScale: 1,

  /**
   * @type {Object}
   */
  mapInitialState: undefined,

  /**
   * @virtual
   * @type {Ember.ComputedProperty<Function>}
   */
  onToggleExpand: computed(function onToggleExpand() {
    return (...args) => this.fallbackOnToggleExpand(...args);
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  clusteredOneproviders: computed(
    'oneproviders.@each.{latitude,longitude}',
    'mapScale',
    function clusteredOneproviders() {
      const {
        oneproviders,
        mapScale,
      } = this.getProperties('oneproviders', 'mapScale');
      const squareSideLength = 15 / (mapScale || 1);
      return clusterizeProviders(
        oneproviders || [], squareSideLength, squareSideLength
      );
    }
  ),

  /**
   * @type {Ember.ComputedProperty<number>}
   */
  oneproviderCircleScale: sum(raw(1), quotient('mapScale', raw(10))),

  init() {
    this._super(...arguments);

    this.setupMapInitialState();
  },

  setupMapInitialState() {
    const {
      oneproviders,
      mapInitialState,
    } = this.getProperties('oneproviders', 'mapInitialState');
    if (!mapInitialState) {
      const points =
        oneproviders.map(p => getProperties(p, 'latitude', 'longitude'));
      const mapPosition = mapPositionForCoordinates(points);
      this.set('mapInitialState', {
        lat: mapPosition.latitude,
        lng: mapPosition.longitude,
        scale: mapPosition.scale,
      });
    }
  },

  /**
   * Default implementation of onToggleExpand, that just sets `isExpanded`
   * property
   * @param {boolean} expand if true, map will be expanded, otherwise it will
   *   be collapsed
   * @returns {undefined}
   */
  fallbackOnToggleExpand(expand) {
    this.set('isExpanded', expand);
  },

  actions: {
    toggleExpand(expand) {
      const {
        isExpanded,
        onToggleExpand,
      } = this.getProperties('isExpanded', 'onToggleExpand');

      const normalizedExpand = Boolean(expand ?? !isExpanded);

      if (normalizedExpand !== isExpanded) {
        onToggleExpand(normalizedExpand);
      }
    },
    mapViewportChanged({ scale }) {
      this.set('mapScale', scale);
      scheduleOnce('afterRender', this, () =>
        globals.window.dispatchEvent(new Event('oneprovidersSelectorRefresh'))
      );
    },
    onOneproviderSelectedFromPopover(hideCallback, oneprovider) {
      this.get('onOneproviderSelected')(oneprovider);
      hideCallback();
    },
  },
});
