/**
 * A component that shows progress of harvesting for given index.
 *
 * @module components/content-harvesters-indices/progress-table
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { promise, subtract } from 'ember-awesome-macros';
import { computed, observer, get, getProperties, setProperties } from '@ember/object';
import { A } from '@ember/array';
import { reject } from 'rsvp';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import WindowResizeHandler from 'onedata-gui-common/mixins/components/window-resize-handler';
import moment from 'moment';
import { scheduleOnce, next } from '@ember/runloop';
import $ from 'jquery';

export default Component.extend(I18n, WindowResizeHandler, {
  classNames: ['content-harvesters-indices-progress-table'],

  currentUser: service(),
  i18n: service(),
  media: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentHarvestersIndices.progressTable',

  /**
   * @virtual
   * @type {models.Harvester}
   */
  harvester: undefined,

  /**
   * @virtual
   * @type {models.Index}
   */
  index: undefined,

  /**
   * @type {boolean}
   */
  showOnlyActive: true,

  /**
   * @type {number}
   */
  currentSeqSum: null,

  /**
   * @type {number}
   */
  previousSeqSum: null,

  /**
   * @type {boolean}
   */
  isTableScrolledTop: false,

  /**
   * @type {boolean}
   */
  isTableScrolledBottom: false,

  /**
   * @type {boolean}
   */
  isTableScrolledLeft: false,

  /**
   * @type {boolean}
   */
  isTableScrolledRight: false,

  /**
   * @type {Ember.ComputedProperty<number>}
   */
  changesCounter: subtract('currentSeqSum', 'previousSeqSum'),

  /**
   * @type {Ember.ComputedProperty<PromiseObject<models.IndexStat>>}
   */
  indexProgressProxy: promise.object(computed(
    'index',
    function indexProgressProxy() {
      const index = this.get('index');
      return index.getStats();
    }
  )),

  /**
   * @type {Ember.ComputedProperty<PromiseArray<models.Space>>}
   */
  spacesProxy: promise.array(computed(
    'harvester.{hasViewPrivilege,spaceList.list}',
    function spacesProxy() {
      const harvester = this.get('harvester');
      return get(harvester, 'hasViewPrivilege') !== false ?
        get(harvester, 'spaceList').then(sl => sl ? get(sl, 'list') : A()) :
        reject({ id: 'forbidden' });
    }
  )),

  /**
   * @type {Ember.ComputedProperty<PromiseArray<models.Provider>>}
   */
  providersProxy: promise.array(computed(
    'harvester.{hasViewPrivilege,effProviderList.list}',
    function providersProxy() {
      const harvester = this.get('harvester');
      return get(harvester, 'hasViewPrivilege') !== false ?
        get(harvester, 'effProviderList').then(sl => sl ? get(sl, 'list') : A()) :
        reject({ id: 'forbidden' });
    }
  )),

  /**
   * @type {Ember.ComputedProperty<PromiseArray>}
   */
  dataLoadingProxy: promise.array(promise.all(
    'indexProgressProxy',
    'spacesProxy',
    'providersProxy'
  )),

  /**
   * @type {Ember.ComputedProperty<Array<models.Space|Object>>}
   */
  spaces: computed(
    'indexProgressProxy.indexStats',
    'spacesProxy.@each.name',
    function spaces() {
      return this.getStatsDescriptionRecords(
        'spacesProxy',
        'Space',
        indexStats => _.keys(indexStats)
      );
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Array<models.Provider|Object>>}
   */
  providers: computed(
    'indexProgressProxy.indexStats',
    'providersProxy.@each.name',
    function providers() {
      return this.getStatsDescriptionRecords(
        'providersProxy',
        'Provider',
        indexStats => _.uniq(
          _.flatten(
            _.values(indexStats).map(val => _.keys(val))
          )
        )
      );
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Array<models.Provider>>}
   */
  activeProgressProviders: computed('progressData', function activeProgressProviders() {
    const {
      providers,
      progressData,
    } = this.getProperties('providers', 'progressData');

    const activeProviders =
      _.flatten(progressData.map(({ progress }) => progress))
      .filter(progress => !get(progress, 'archival') && get(progress, 'isSupported'))
      .mapBy('provider')
      .uniq();
    return providers.filter(provider => activeProviders.includes(provider));
  }),

  /**
   * Progress data ready to render. Format:
   * [
   *   {
   *     space: models.Space,
   *     progress: [
   *       {
   *         space: models.Space,
   *         provider: models.Provider|{ name: string, entityId: string },
   *         isSupported: boolean, // is space supported by that provider
   *         currentSeq: number,
   *         maxSeq: number,
   *         archival: boolean,
   *         lastUpdate: number,
   *         error: string|null
   *       },
   *       {...},
   *       ...
   *     ]
   *   },
   *   {...},
   *   ...
   * ]
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  progressData: computed(
    'dataLoadingProxy.isFulfilled',
    'indexProgressProxy.content',
    'spaces.[]',
    'providers.[]',
    function progressData() {
      const isDataLoaded = this.get('dataLoadingProxy.isFulfilled');
      if (isDataLoaded) {
        const {
          indexProgressProxy,
          spaces,
          providers,
        } = this.getProperties('indexProgressProxy', 'spaces', 'providers');
        const indexStats = get(indexProgressProxy, 'indexStats');
        return spaces.map(space => ({
          space,
          progress: providers.map(provider => {
            const data = get(indexStats, get(space, 'entityId'));
            const providerEntityId = get(provider, 'entityId');
            const isSupported = _.keys(data).includes(providerEntityId);

            const progress = {
              isSupported,
              provider,
              space,
            };
            if (isSupported) {
              const providerData = get(data, providerEntityId);
              setProperties(progress, getProperties(
                providerData,
                'currentSeq',
                'maxSeq',
                'archival',
                'lastUpdate',
                'error'
              ));
            }
            return progress;
          }),
        }));
      } else {
        return [];
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty<string|null>}
   */
  lastUpdateTime: computed('progressData', function lastUpdateTime() {
    const progressData = this.get('progressData');
    let lastUpdate = 0;
    progressData.forEach(({ progress }) =>
      progress
      .filter(({ lastUpdate }) => lastUpdate)
      .mapBy('lastUpdate')
      .forEach(lu => {
        if (lu > lastUpdate) {
          lastUpdate = lu;
        }
      })
    );
    if (lastUpdate) {
      lastUpdate = moment.unix(lastUpdate);
      if (lastUpdate.isSame(moment(), 'day')) {
        return lastUpdate.format('HH:mm:ss');
      } else {
        return lastUpdate.format('YYYY-MM-DD, HH:mm:ss');
      }
    } else {
      return null;
    }
  }),

  /**
   * Progress data narrowed to active entities.
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  activeProgressData: computed(
    'activeProgressProviders',
    function activeProgressData() {
      const {
        progressData,
        activeProgressProviders,
      } = this.getProperties('progressData', 'activeProgressProviders');
      return progressData
        .filter(({ progress }) => progress.isAny('archival', false))
        .map(spaceProgress => {
          const progress = get(spaceProgress, 'progress')
            .filter(({ provider }) => activeProgressProviders.includes(provider));
          return Object.assign({}, spaceProgress, { progress });
        });
    }
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  useTableLayout: computed(
    'progressData',
    'activeProgressData',
    'showOnlyActive',
    function useTableLayout() {
      const {
        progressData,
        activeProgressData,
        showOnlyActive,
      } = this.getProperties(
        'progressData',
        'activeProgressData',
        'showOnlyActive'
      );
      const data = showOnlyActive ? activeProgressData : progressData;
      let meaningfulData =
        _.flatten(data.mapBy('progress'))
        .filterBy('isSupported');
      if (showOnlyActive) {
        meaningfulData = meaningfulData.rejectBy('archival');
      }

      const meaningfulCellsCount = get(meaningfulData, 'length');
      // At least 5 non-empty cells and minimum 2 spaces and 2 providers. Having a
      // table with only one row or one column does not have any sense.
      // > 15 to deal with a finite height of a collapsible-list item
      return (meaningfulCellsCount > 4 &&
        meaningfulData.mapBy('space').uniq().length > 1 &&
        meaningfulData.mapBy('provider').uniq().length > 1) || meaningfulCellsCount > 15;
    }
  ),

  progressDataObserver: observer('progressData', function progressDataObserver() {
    scheduleOnce('afterRender', this, 'recalculateChanges');
  }),

  willDestroyElement() {
    try {
      const indexProgressProxy = this.get('indexProgressProxy');
      const {
        content: indexProgress,
        isFulfilled: isIndexProgressProxyFulfilled,
      } = getProperties(indexProgressProxy, 'content', 'isFulfilled');
      if (isIndexProgressProxyFulfilled) {
        indexProgress.unloadRecord();
      }
    } finally {
      this._super(...arguments);
    }
  },

  didRender() {
    this._super(...arguments);

    this.recalculateTableLayout();
  },

  /**
   * @override
   */
  onWindowResize() {
    this.recalculateTableLayout();
  },

  /**
   * @param {string} proxyName 
   * @param {string} recordTypeName 
   * @param {Function} extractIdsFun 
   * @returns {Array<Object>}
   */
  getStatsDescriptionRecords(proxyName, recordTypeName, extractIdsFun) {
    const indexProgressProxy = this.get('indexProgressProxy');
    const recordsProxy = this.get(proxyName);
    const {
      isFulfilled: indexProxyIsFulfilled,
      indexStats,
    } = getProperties(indexProgressProxy, 'isFulfilled', 'indexStats');
    const recordsProxyIsFulfilled = get(recordsProxy, 'isFulfilled');
    if (indexProxyIsFulfilled && recordsProxyIsFulfilled) {
      const recordIds = extractIdsFun(indexStats);
      const records = [];
      const recordMocks = [];
      recordIds.forEach(recordId => {
        const record = recordsProxy.findBy('entityId', recordId);
        if (record) {
          records.push(record);
        } else {
          recordMocks.push({
            entityId: recordId,
            name: `${recordTypeName}#${recordId.slice(0, 6)} (${this.tt('notAccessible')})`,
          });
        }
      });
      return records.sortBy('name').concat(recordMocks.sortBy('name'));
    } else {
      return [];
    }
  },

  recalculateChanges() {
    const {
      progressData,
      currentSeqSum,
    } = this.getProperties('progressData', 'currentSeqSum');
    let sum = 0;
    progressData.forEach(({ progress }) =>
      progress
      .filter(({ currentSeq }) => typeof currentSeq === 'number')
      .mapBy('currentSeq')
      .forEach(currentSeq => {
        sum += currentSeq;
      })
    );
    this.setProperties({
      currentSeqSum: sum,
      previousSeqSum: currentSeqSum,
    });
    if (this.get('element')) {
      this.$('.activity-indicator').removeClass('pulse-mint');
      next(() => {
        safeExec(this, () => this.$('.activity-indicator').addClass('pulse-mint'));
      });
    }
  },

  recalculateTableLayout() {
    const {
      element,
      useTableLayout,
    } = this.getProperties('element', 'useTableLayout');

    if (!element || !useTableLayout) {
      this.setProperties({
        isTableScrolledTop: false,
        isTableScrolledBottom: false,
        isTableScrolledLeft: false,
        isTableScrolledRight: false,
      });
      return;
    }

    const $ps = this.$('.ps');
    const scrollLeftOffset = $ps.scrollLeft();
    const scrollTopOffset = $ps.scrollTop();
    const $constantRowLabels = this.$('.row-label.constant-row-label');
    const $floatingRowLabels = this.$('.row-label.floating-row-label');
    const $constantColumnLabels = this.$('.constant-column-labels .table-cell');
    const $floatingColumnLabelsRow = this.$('.floating-column-labels');
    const $floatingColumnLabels = $floatingColumnLabelsRow.find('.table-cell');
    const $rightShadowOverlay = this.$('.right-shadow-overlay');

    $constantRowLabels.each(function each(index) {
      $floatingRowLabels.eq(index).css({
        height: `${parseFloat($(this).css('height'))}px`,
      });
    });
    $floatingRowLabels.css({
      left: `${scrollLeftOffset}px`,
      width: $constantRowLabels.css('width'),
      visibility: 'visible',
    });

    $constantColumnLabels.each(function each(index) {
      $floatingColumnLabels.eq(index).css({
        width: `${parseFloat($(this).css('width'))}px`,
      });
    });
    $floatingColumnLabels.css({
      height: $constantColumnLabels.css('height'),
      visibility: 'visible',
    });
    $floatingColumnLabelsRow.css({
      top: `${scrollTopOffset}px`,
    });
    $rightShadowOverlay.css({
      height: $constantColumnLabels.css('height'),
    });
  },

  actions: {
    scroll() {
      this.recalculateTableLayout();
    },
    tableTopEdgeScroll(reachedEdge) {
      this.set('isTableScrolledTop', reachedEdge);
    },
    tableBottomEdgeScroll(reachedEdge) {
      this.set('isTableScrolledBottom', reachedEdge);
    },
    tableLeftEdgeScroll(reachedEdge) {
      this.set('isTableScrolledLeft', reachedEdge);
    },
    tableRightEdgeScroll(reachedEdge) {
      this.set('isTableScrolledRight', reachedEdge);
    },
    showArchivalChanged(showArchival) {
      this.set('showOnlyActive', !showArchival);
    },
  },
});
