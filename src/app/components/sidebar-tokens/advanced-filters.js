/**
 * An advanced filters component for tokens sidebar. Provides filtering by token
 * type and target.
 *
 * @module components/sidebar-tokens/advanced-filters
 * @author  Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { computed, observer, get } from '@ember/object';
import { equal, raw } from 'ember-awesome-macros';
import { scheduleOnce } from '@ember/runloop';
import recordIcon from 'onedata-gui-common/utils/record-icon';

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
   * @param {Object} filtersState object:
   *   ```
   *   {
   *     type: 'all'|'access'|'identity'|'invite',
   *     targetModelName: 'space'|'group'|...
   *     targetRecord: null|Models.* // null means all records
   *   }
   *   ```
   * @returns {undefined}
   */
  onChange: notImplementedIgnore,

  /**
   * @virtual
   * @type {Array<Models.Token>}
   */
  collection: undefined,

  /**
   * @type {string}
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
      } = this.getProperties('collection', 'allModelOption');
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
      } = this.getProperties(
        'allRecordOption',
        'allModelOption',
        'selectedTargetModelOption',
        'collection'
      );

      if (selectedTargetModelOption === allModelOption) {
        return [allRecordOption];
      } else {
        const recordOptions = collection
          .filterBy('targetModelName', get(selectedTargetModelOption, 'modelName'))
          .filterBy('tokenTarget')
          .uniqBy('tokenTarget')
          .map(record => ({
            record: get(record, 'tokenTarget'),
            name: get(record, 'tokenTarget.name'),
          }))
          .sortBy('name');
        return [allRecordOption, ...recordOptions];
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isTargetRecordDisabled: equal('selectedTargetModelOption', 'allModelOption'),

  targetModelOptionsObserver: observer(
    'targetModelOptions',
    function targetModelOptionsObserver() {
      const {
        targetModelOptions,
        selectedTargetModelOption,
        allModelOption,
      } = this.getProperties(
        'targetModelOptions',
        'selectedTargetModelOption',
        'allModelOption'
      );

      const selectedModel = get(selectedTargetModelOption, 'modelName');
      if (!targetModelOptions.mapBy('modelName').includes(selectedModel)) {
        this.set('selectedTargetModelOption', allModelOption);
      }
    }
  ),

  targetRecordOptionsObserver: observer(
    'targetRecordOptions',
    function targetRecordOptionsObserver() {
      const {
        targetRecordOptions,
        selectedTargetRecordOption,
        allRecordOption,
      } = this.getProperties(
        'targetRecordOptions',
        'selectedTargetRecordOption',
        'allRecordOption'
      );

      const selectedRecord = get(selectedTargetRecordOption, 'record');
      if (!targetRecordOptions.mapBy('record').includes(selectedRecord)) {
        this.set('selectedTargetRecordOption', allRecordOption);
      }
    }
  ),

  filtersStateObserver: observer(
    'selectedType',
    'selectedTargetModelOption',
    'selectedTargetRecordOption',
    function filtersStateObserver() {
      scheduleOnce('afterRender', this, 'notifyChange');
    }
  ),

  init() {
    this._super(...arguments);

    const {
      allModelOption,
      allRecordOption,
    } = this.getProperties('allModelOption', 'allRecordOption');

    this.setProperties({
      selectedTargetModelOption: allModelOption,
      selectedTargetRecordOption: allRecordOption,
    });

    this.notifyChange();
  },

  notifyChange() {
    const {
      selectedType,
      selectedTargetModelOption,
      selectedTargetRecordOption,
      onChange,
    } = this.getProperties(
      'selectedType',
      'selectedTargetModelOption',
      'selectedTargetRecordOption',
      'onChange'
    );

    onChange({
      type: selectedType,
      targetModelName: selectedTargetModelOption.modelName,
      targetRecord: get(selectedTargetRecordOption, 'record'),
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
