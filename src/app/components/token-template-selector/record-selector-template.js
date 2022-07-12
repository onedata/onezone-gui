/**
 * Token template base component with record selection feature. Allows to construct
 * templates, which require selection of record from a list.
 *
 * @module components/token-template-selector/record-selector-template
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { get, computed, observer, defineProperty } from '@ember/object';
import { tag } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { resolve } from 'rsvp';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import $ from 'jquery';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: tag `components.tokenTemplateSelector.templates.${'templateName'}`,

  /**
   * @type {String}
   */
  i18nGenericPrefix: 'components.tokenTemplateSelector.recordSelectorTemplate.',

  /**
   * @virtual
   * @type {String}
   */
  templateName: undefined,

  /**
   * @virtual
   * @type {String}
   */
  imagePath: undefined,

  /**
   * @virtual optional
   * @type {Array<String>}
   */
  filterDependentKeys: Object.freeze(['name']),

  /**
   * @virtual
   * @type {Function}
   * @param {String} templateName
   * @param {Object} template
   */
  onSelected: notImplementedIgnore,

  /**
   * @type {String}
   */
  activeSlideId: 'intro',

  /**
   * Set by `loadRecordsIfNeeded` method
   * @type {PromiseArray<GraphSingleModel>}
   */
  recordsProxy: undefined,

  /**
   * @type {String}
   */
  filter: '',

  /**
   * Set by `filteredRecordsSetter` observer
   * @type {ComputedProperty<Array<GraphSingleModel>>}
   */
  filteredRecords: undefined,

  filteredRecordsSetter: observer(
    'filterDependentKeys',
    function filteredRecordsSetter() {
      defineProperty(
        this,
        'filteredRecords',
        computed(
          `recordsProxy.@each.{${this.get('filterDependentKeys').join(',')}}`,
          'filter',
          function filteredRecords() {
            const {
              recordsProxy,
              filter,
            } = this.getProperties('recordsProxy', 'filter');

            if (!get(recordsProxy, 'isFulfilled')) {
              return [];
            }

            return recordsProxy.filter(record => this.filterMatcher(record, filter));
          }
        )
      );
    }
  ),

  init() {
    this._super(...arguments);
    this.filteredRecordsSetter();
  },

  /**
   * @virtual
   * @returns {Promise<Array<GraphSingleModel>>}
   */
  fetchRecords() {
    return resolve([]);
  },

  /**
   * @virtual
   * @param {GraphSingleModel} record
   * @returns {Object}
   */
  generateTemplateFromRecord(record) {
    return { record };
  },

  /**
   * @virtual optional
   * @param {GraphSingleModel} record
   * @param {String} filter
   * @returns {boolean}
   */
  filterMatcher(record, filter) {
    if (!filter) {
      return true;
    }
    const normalizedFilter = filter.toLocaleLowerCase();
    const filterDependentKeys = this.get('filterDependentKeys');
    return filterDependentKeys.map(key => get(record, key))
      .compact()
      .map(value => value.toLocaleLowerCase().includes(normalizedFilter))
      .includes(true);
  },

  loadRecordsIfNeeded() {
    if (!this.get('recordsProxy') || this.get('recordsProxy.isRejected')) {
      this.set('recordsProxy', promiseArray(this.fetchRecords()));
    }
  },

  changeToSlide(slideId) {
    this.set('activeSlideId', slideId);
    if (slideId === 'selector') {
      this.loadRecordsIfNeeded();
    }
  },

  actions: {
    onIntroClick(event) {
      const $eventTargetParentSlide = $(event.target).closest('.one-carousel-slide');
      if ($eventTargetParentSlide.data('one-carousel-slide-id') !== 'selector') {
        this.changeToSlide('selector');
      }
    },
    onTemplateBackClick() {
      this.changeToSlide('intro');
    },
    onRecordSelected(record) {
      const {
        onSelected,
        templateName,
      } = this.getProperties('onSelected', 'templateName');

      onSelected(templateName, this.generateTemplateFromRecord(record));
      this.changeToSlide('intro');
    },
  },
});
