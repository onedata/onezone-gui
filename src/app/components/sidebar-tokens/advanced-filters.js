/**
 * An advanced filters component for tokens sidebar. Provides filtering by token
 * type and target.
 *
 * @author  Michał Borzęcki, Jakub Liput
 * @copyright (C) 2019-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { computed, observer, get } from '@ember/object';
import { equal, raw } from 'ember-awesome-macros';
import { scheduleOnce } from '@ember/runloop';
import recordIcon from 'onedata-gui-common/utils/record-icon';
import _ from 'lodash';
import { all as allFulFilled, resolve } from 'rsvp';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';

/**
 * @typedef {'all'|'access'|'identity'|'invite'} TokenTypeFilter
 */

/**
 * @typedef {Object} TokensSidebarAdvancedFilter
 * @property {TokenTypeFilter} type
 * @property {string} targetModelName 'space'|'group'|...
 * @property {Ember.Model|null} targetRecord null|Models.*; null means all records
 */

export default Component.extend(I18n, {
  classNames: ['advanced-filters', 'advanced-token-filters'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.sidebarTokens.advancedFilters',

  /**
   * @virtual
   * @type {Function}
   * @param {TokensSidebarAdvancedFilter} filtersState
   * @returns {undefined}
   */
  onChange: notImplementedIgnore,

  /**
   * @virtual
   * @type {Array<Models.Token>}
   */
  collection: undefined,

  /**
   * @type {TokenTypeFilter}
   */
  selectedType: 'all',

  /**
   * @type {Object}
   */
  selectedTargetModelOption: undefined,

  /**
   * @type {Object}
   */
  selectedTargetRecordOption: undefined,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isTargetFilterVisible: equal('selectedType', raw('invite')),

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  allModelOption: computed(function allModelOption() {
    return {
      modelName: 'all',
      modelNameTranslation: this.t('targetFilter.model.options.all'),
      icon: '',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  allRecordOption: computed(function allRecordOption() {
    return {
      record: null,
      name: this.t('targetFilter.record.options.all'),
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Array<{modelName: string, name: string, icon: string}>>}
   */
  targetModelOptions: computed(
    'allModelOption',
    'collection.@each.targetModelName',
    function targetModelOptions() {
      const {
        collection,
        allModelOption,
      } = this;
      if (collection) {
        const modelNames = collection.mapBy('targetModelName').compact().uniq();
        const modelOptions = modelNames.map(modelName => ({
          modelName,
          modelNameTranslation: this.t(
            `targetFilter.model.options.${modelName}`
          ).string,
          icon: recordIcon(modelName),
        })).sortBy('modelNameTranslation');

        return [allModelOption, ...modelOptions];
      }
    }
  ),

  tokensFullLoadProxy: computed('collection', function tokensFullLoadProxy() {
    const promise = allFulFilled(this.collection.map(record =>
      record.loadRequiredRelations()
    ));
    return promiseObject(promise);
  }),

  targetRecordOptionsLoaderProxy: computed(
    'selectedTargetModelOption',
    'tokensFullLoadProxy',
    'allModelOption',
    function targetRecordOptionsLoaderProxy() {
      if (this.selectedTargetModelOption === this.allModelOption) {
        return promiseObject(resolve());
      } else {
        return this.tokensFullLoadProxy;
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Array<{record: Model, name: string}>>}
   */
  targetRecordOptions: computed(
    'allRecordOption',
    'allModelOption',
    'selectedTargetModelOption',
    'collection.@each.tokenTarget',
    function targetRecordOptions() {
      const {
        allRecordOption,
        allModelOption,
        selectedTargetModelOption,
        collection,
      } = this;

      if (selectedTargetModelOption === allModelOption) {
        return [allRecordOption];
      } else {
        // FIXME: wstawić proxy, które będzie ładować relacje Tokena
        // to proxy będzie ChunkableListModel i będzie zawierać progress
        // progress będzie można pokazać zamiast dropdowna z targetRecordOptions
        // jeśli tylko progress nie będzie 100
        // będzie działać nawet jak ktoś zmieni selectedTargetModelName
        let recordOptions = collection;
        const selectedTargetModelName = selectedTargetModelOption.modelName;
        recordOptions = recordOptions.filter(token =>
          token.targetModelName === selectedTargetModelName
        );
        recordOptions = recordOptions.filter(token => token.tokenTarget);
        recordOptions = _.uniqBy(recordOptions, token => token.tokenTarget);
        recordOptions = recordOptions.map(token => ({
          record: token.tokenTarget,
          name: token.tokenTarget.name,
        }));
        recordOptions = _.sortBy(recordOptions, 'name');
        return [allRecordOption, ...recordOptions];
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isTargetRecordDisabled: equal('selectedTargetModelOption', 'allModelOption'),

  effSelectedTargetRecordOption: computed(
    'targetRecordOptionsLoaderProxy.isFulfilled',
    'targetRecordOptions',
    'selectedTargetRecordOption',
    'allRecordOption',
    function effSelectedTargetRecordOption() {
      // Until the loader is not resolved, user should not be able to change target
      // record, so it is probably "all" option.
      if (!this.targetRecordOptionsLoaderProxy.isFulfilled) {
        return this.allRecordOption;
      }
      const selectedRecord = this.selectedTargetRecordOption.record;
      return this.targetRecordOptions.find(it => it.record === selectedRecord) ??
        this.allRecordOption;
    }
  ),

  targetModelOptionsObserver: observer(
    'targetModelOptions',
    function targetModelOptionsObserver() {
      const {
        targetModelOptions,
        selectedTargetModelOption,
        allModelOption,
      } = this;

      const selectedModel = selectedTargetModelOption.modelName;
      if (!targetModelOptions.map(it => it.modelName).includes(selectedModel)) {
        this.set('selectedTargetModelOption', allModelOption);
      }
    }
  ),

  filtersStateObserver: observer(
    'selectedType',
    'selectedTargetModelOption',
    'effSelectedTargetRecordOption',
    function filtersStateObserver() {
      scheduleOnce('afterRender', this, 'notifyChange');
    }
  ),

  init() {
    this._super(...arguments);

    this.setProperties({
      selectedTargetModelOption: this.allModelOption,
      selectedTargetRecordOption: this.allRecordOption,
    });

    this.notifyChange();
  },

  notifyChange() {
    const {
      selectedType,
      selectedTargetModelOption,
      effSelectedTargetRecordOption,
      onChange,
    } = this;

    onChange({
      type: selectedType,
      targetModelName: selectedTargetModelOption.modelName,
      targetRecord: effSelectedTargetRecordOption.record,
    });
  },

  actions: {
    typeChanged(type) {
      this.set('selectedType', type);
    },
    targetModelChanged(targetModelOption) {
      this.set('selectedTargetModelOption', targetModelOption);
    },
    targetRecordChanged(targetRecordOption) {
      this.set('selectedTargetRecordOption', targetRecordOption);
    },
  },
});
