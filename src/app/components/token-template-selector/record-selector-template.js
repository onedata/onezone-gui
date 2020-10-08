import Component from '@ember/component';
import { get, computed, observer } from '@ember/object';
import { tag } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { resolve } from 'rsvp';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import $ from 'jquery';

function defaultFetchRecord() {
  return resolve([]);
}

function defaultFilterMatcher(record, filter) {
  if (!filter) {
    return true;
  }

  return (get(record, 'name') || '').toLocaleLowerCase().includes(filter);
}

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
   * @virtual
   * @type {String}
   */
  modelIcon: undefined,

  /**
   * @virtual
   * @type {Function}
   * @returns {Promise<Array<GraphSingleModel>>}
   */
  fetchRecords: defaultFetchRecord,

  /**
   * @virtual optional
   * @type {Array<String>}
   */
  filterDependentKeys: Object.freeze(['name']),

  /**
   * @type {Function}
   * @param {GraphSingleModel} record
   * @param {String} filter
   * @returns {boolean}
   */
  filterMatcher: defaultFilterMatcher,

  /**
   * @virtual
   * @type {Function}
   * @param {GraphSingleModel} record
   * @returns {any}
   */
  onRecordSelected: notImplementedIgnore,

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
      this.set(
        'filteredRecords',
        computed(
          `recordsProxy.@each.{${this.get('filterDependentKeys').join(',')}}`,
          'filterMatcher',
          'filter',
          function filteredRecords() {
            const {
              recordsProxy,
              filterMatcher,
              filter,
            } = this.getProperties('recordsProxy', 'filterMatcher', 'filter');

            if (!get(recordsProxy, 'isFulfilled')) {
              return [];
            }

            return recordsProxy.filter(record => filterMatcher(record, filter));
          }
        )
      );
    }
  ),

  init() {
    this._super(...arguments);
    this.filteredRecordsSetter();
  },

  loadRecordsIfNeeded() {
    if (!this.get('recordsProxy') || this.get('recordsProxy.isRejected')) {
      this.set('recordsProxy', promiseArray(this.get('fetchRecords')()));
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
      this.get('onRecordSelected')(record);
      this.changeToSlide('intro');
    },
  },
});
