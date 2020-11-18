/**
 * A component that is used internally by progress-table to visualise actual
 * harvesting progress for specified index, space and provider.
 *
 * @module components/content-harvesters-indices/progress-table-cell
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { computed, getProperties } from '@ember/object';
import { reads, not } from '@ember/object/computed';
import moment from 'moment';
import { tag } from 'ember-awesome-macros';

export default Component.extend(I18n, {
  tagName: 'td',
  classNames: ['progress-table-cell'],
  classNameBindings: ['isActive:active:inactive'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentHarvestersIndices.progressTableCell',

  /**
   * @virtual
   * @type {Object}
   *
   * Object in format:
   * `
   * {
   *   provider: models.Provider,
   *   space: models.Space,
   *   isSupported: boolean,
   *   currentSeq?: number,
   *   maxSeq?: number,
   *   archival: boolean,
   *   lastUpdate?: number,
   *   error?: string,
   * }
   * `
   */
  progress: undefined,

  /**
   * @type {boolean}
   *
   * If true, popover with additional info will be visible
   */
  isMoreInfoVisible: false,

  /**
   * Must have method "hide"
   * @type {Object}
   */
  popoverApi: undefined,

  /**
   * @type {Ember.ComputedProperty<models.Space>}
   */
  space: reads('progress.space'),

  /**
   * @type {Ember.ComputedProperty<models.Provider>}
   */
  provider: reads('progress.provider'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isSupported: reads('progress.isSupported'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isActive: not('progress.archival'),

  /**
   * @type {Ember.ComputedProperty<number>}
   *
   * Integer between 0 and 100 calculated using currentSeq and maxSeq
   */
  percent: computed(
    'isSupported',
    'progress.{currentSeq,maxSeq}',
    function percent() {
      const {
        isSupported,
        progress,
      } = this.getProperties('isSupported', 'progress');
      if (isSupported) {
        const {
          currentSeq,
          maxSeq,
        } = getProperties(progress, 'currentSeq', 'maxSeq');
        if (maxSeq === 0) {
          return 0;
        } else {
          const percent = Math.floor(Math.abs(currentSeq / maxSeq) * 100);
          // abs and min functions in case of incorrect max and current values
          return Math.min(100, percent);
        }
      } else {
        return 0;
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty<string|undefined>}
   *
   * Last index update time converted from unix timestamp to readable format
   */
  lastUpdate: computed('progress.lastUpdate', function lastUpdate() {
    const lastUpdateTimestamp = this.get('progress.lastUpdate');
    if (lastUpdateTimestamp) {
      return moment.unix(lastUpdateTimestamp).format('YYYY-MM-DD, HH:mm:ss');
    }
  }),

  /**
   * @type {Ember.ComputedProperty<string|undefined>}
   */
  error: reads('progress.error'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  progressChartClassNames: computed(
    'isSupported',
    'percent',
    'error',
    'progressChartIdClass',
    function valueClass() {
      const {
        isSupported,
        percent,
        error,
        progressChartIdClass,
      } = this.getProperties('isSupported', 'percent', 'error', 'progressChartIdClass');

      const classes = ['progress-chart', progressChartIdClass];
      if (isSupported) {
        if (error) {
          classes.push('danger');
        } else {
          classes.push(percent < 100 ? 'warning' : 'success');
        }
      } else {
        classes.push('not-supported');
      }
      return classes.join(' ');
    }
  ),

  /**
   * @type {ComputedProperty<String>}
   */
  moreInfoTriggerClass: tag `more-info-trigger-${'elementId'}`,

  /**
   * @type {ComputedProperty<String>}
   */
  progressChartIdClass: tag `progress-chart-${'elementId'}`,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  chartDasharray: computed('percent', function chartDasharray() {
    const percent = this.get('percent');
    const circleCoord = percent * Math.PI;
    const maxCircleCoord = 100 * Math.PI;
    return `${circleCoord} ${maxCircleCoord - circleCoord}`;
  }),

  /**
   * @type {Ember.ComputedProperty<Function>}
   */
  parentScrollEventListener: computed(function parentScrollEventListener() {
    return () => {
      const popoverApi = this.get('popoverApi');
      if (popoverApi) {
        popoverApi.hide();
      }
    };
  }),

  didInsertElement() {
    this._super(...arguments);

    const perfectScrollbar = this.$().closest('.perfect-scrollbar-element')[0];
    if (perfectScrollbar) {
      perfectScrollbar
        .addEventListener('scroll', this.get('parentScrollEventListener'));
    }
  },

  willDestroyElement() {
    this._super(...arguments);

    const perfectScrollbar = this.$().closest('.perfect-scrollbar-element')[0];
    if (perfectScrollbar) {
      perfectScrollbar
        .removeEventListener('scroll', this.get('parentScrollEventListener'));
    }
  },

  actions: {
    toggleMoreInfo(isVisible) {
      if (isVisible !== this.get('isMoreInfoVisible')) {
        this.set('isMoreInfoVisible', isVisible);
      }
    },
    registerPopoverApi(api) {
      this.set('popoverApi', api);
    },
  },
});
