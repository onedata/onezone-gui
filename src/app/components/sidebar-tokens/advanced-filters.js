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
import { computed } from '@ember/object';
import { equal, raw } from 'ember-awesome-macros';
import { scheduleOnce } from '@ember/runloop';
import { asyncObserver } from 'onedata-gui-common/utils/observer';
import recordIcon from 'onedata-gui-common/utils/record-icon';
import _ from 'lodash';
import { resolve, all as allFulfilled } from 'rsvp';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { defaultSeparator } from 'onedata-gui-common/components/name-conflict';
import addConflictLabels from 'onedata-gui-common/utils/add-conflict-labels';
import BatchRecordsLoader from 'onezone-gui/utils/batch-records-loader';

/**
 * @typedef {'group'|'space'|'user'|'cluster'|'harvester'|'atmInventory'} TokenTargetModelName
 */

/**
 * @typedef {'all'|'access'|'identity'|'invite'} TokenTypeFilter
 */

/**
 * @typedef {Object} TargetModelOption
 * @property {TokenTargetModelName} modelName
 * @property {string} modelNameTranslation
 * @property {OneIconName} icon
 */

/**
 * @typedef {Object} TokensSidebarAdvancedFilter
 * @property {TokenTypeFilter} type
 * @property {TokenTargetModelName} targetModelName
 * @property {Ember.Model|null} targetRecord null|Models.*; null means all records
 */

export default Component.extend(I18n, {
  classNames: ['advanced-filters', 'advanced-token-filters'],

  i18n: service(),
  batchRequestRegistry: service(),

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
   * Stores BatchRecordsLoaders suitable for TargetRecordOptions. For example, when user
   * selects "space" target record option, then we start loading spaces referenced by
   * tokens using batch requests. It may last long, so if user changes target record
   * option, then we should not forget object with loading state, but create new loader
   * for example for "group" type. These two loaders are working indepedently, paralelly.
   * When user goes back to "space" type, then he will see the loader progress stored
   * previously.
   * @type {Map<TargetRecordOption, BatchRecordsLoader>}
   */
  targetRecordsLoaders: undefined,

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
   * @type {ProgressTracker}
   */
  progressTracker: undefined,

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
   * @type {Ember.ComputedProperty<Array<TargetModelOption>>}
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

  /**
   * Promise proxy that resolves when invite target records for current context are
   * fetched and have assigned conflict labels.
   * @type {ComputedProperty<PromiseObject<undefined>>}
   */
  targetRecordOptionsLoaderProxy: computed(
    'collection',
    'selectedTargetModelOption',
    'allModelOption',
    'type',
    function targetRecordOptionsLoaderProxy() {
      if (
        this.type !== 'invite' ||
        this.selectedTargetModelOption === this.allModelOption
      ) {
        return promiseObject(resolve());
      } else {
        const batchRecordsLoader =
          this.getBatchTargetRecordsLoader(this.selectedTargetModelOption);
        return promiseObject((async () => {
          const targetRecords = await batchRecordsLoader.getPromise();
          addConflictLabels(targetRecords, 'name', 'entityId');
        })());
      }
    }
  ),

  /**
   * Progress tracker suitable to use in the current context of invite token filter.
   * It is null if there is no batch loader in use in the current context.
   * @type {ComputedProperty<ProgressTracker|null>}
   */
  inviteProgressTracker: computed(
    'collection',
    'selectedTargetModelOption',
    'allModelOption',
    'type',
    function inviteProgressTracker() {
      if (
        this.type !== 'invite' ||
        this.selectedTargetModelOption === this.allModelOption
      ) {
        return null;
      } else {
        return this.getBatchTargetRecordsLoader(this.selectedTargetModelOption)
          .progressTracker;
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
        let recordOptions = collection;
        const selectedTargetModelName = selectedTargetModelOption.modelName;
        recordOptions = recordOptions.filter(token =>
          token.targetModelName === selectedTargetModelName
        );
        recordOptions = recordOptions.filter(token => token.tokenTarget);
        recordOptions = _.uniqBy(recordOptions, token => token.tokenTarget);
        recordOptions = recordOptions.map(token => {
          const tokenTargetName = token.tokenTarget.name;
          const conflictLabel = token.tokenTarget.conflictLabel;
          return {
            record: token.tokenTarget,
            name: conflictLabel ?
              `${tokenTargetName}${defaultSeparator}${conflictLabel}` : tokenTargetName,
          };
        });
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

  targetRecordSearchField: computed(function targetRecordSearchField() {
    return this.effSelectedTargetRecordOption.record ? 'name' : '';
  }),

  targetModelOptionsObserver: asyncObserver(
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

  filtersStateObserver: asyncObserver(
    'selectedType',
    'selectedTargetModelOption',
    'effSelectedTargetRecordOption',
    function filtersStateObserver() {
      scheduleOnce('afterRender', this, 'tryNotifyChange');
    }
  ),

  init() {
    this._super(...arguments);

    this.setProperties({
      selectedTargetModelOption: this.allModelOption,
      selectedTargetRecordOption: this.allRecordOption,
      targetRecordsLoaders: new Map(),
    });

    this.filtersStateObserver();
  },

  tryNotifyChange() {
    const {
      selectedType,
      selectedTargetModelOption,
      effSelectedTargetRecordOption,
      onChange,
    } = this;
    const currentChangeset = {
      type: selectedType,
      targetModelName: selectedTargetModelOption.modelName,
      targetRecord: effSelectedTargetRecordOption.record,
    };
    onChange(currentChangeset);
  },

  /**
   * @param {TargetModelOption} targetModelOption
   * @returns {BatchRecordsLoader}
   */
  createBatchTargetRecordsLoader(targetModelOption) {
    const {
      batchRequestRegistry,
      collection,
    } = this;
    const targetModelName = targetModelOption.modelName;
    const itemsGris = this.collection
      .filter(token => token.targetModelName === targetModelName)
      .map(token => token.getTargetModelGri())
      .filter(Boolean);
    const listResolver = async () => {
      const list = await allFulfilled(collection
        .filter(token =>
          token.targetRecordId && token.targetModelName === targetModelName
        )
        .map(token => token.loadRequiredRelations())
      );
      return _.uniq(list);
    };

    const batchRecordsLoader = new BatchRecordsLoader({
      batchRequestRegistry,
      itemsGris,
      listResolver,
    });
    batchRecordsLoader.getPromise();
    return batchRecordsLoader;
  },

  /**
   * @param {TargetModelOption} targetModelOption
   * @returns {BatchRecordsLoader}
   */
  getBatchTargetRecordsLoader(targetModelOption) {
    if (!this.targetRecordsLoaders.has(targetModelOption)) {
      this.targetRecordsLoaders.set(
        targetModelOption,
        this.createBatchTargetRecordsLoader(targetModelOption)
      );
    }
    return this.targetRecordsLoaders.get(targetModelOption);
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
