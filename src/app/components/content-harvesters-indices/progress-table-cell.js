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
import { reads } from '@ember/object/computed';

export default Component.extend(I18n, {
  tagName: 'td',
  classNames: ['progress-table-cell'],

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
   *   lastUpdate?: number,
   *   error?: string,
   * }
   * `
   */
  progress: undefined,

  /**
   * @type {Ember.ComputedProperty<models.Space>}
   */
  space: reads('progress.space'),

  /**
   * @type {Ember.ComputedProperty<models.Provider>}
   */
  provider: reads('progress.space'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isSupported: reads('progress.isSupported'),

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
          return 100;
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
   * @type {Ember.ComputedProperty<string>}
   */
  progressDotClassNames: computed(
    'isSupported',
    'percent',
    function valueClass() {
      const {
        isSupported,
        percent,
      } = this.getProperties('isSupported', 'percent');

      const classes = ['progress-dot'];
      if (isSupported) {
        classes.push(percent < 100 ? 'warning' : 'success');
      } else {
        classes.push('not-supported');
      }
      return classes.join(' ');
    }
  ),
});
