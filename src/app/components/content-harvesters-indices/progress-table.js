/**
 * A component that shows progress of harvesting for given index.
 *
 * @module components/content-harvesters-indices/progress-table
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { promise, array, subtract } from 'ember-awesome-macros';
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
  isTableCollapsed: false,
  
  /**
   * @type {number}
   */
  breakpoint: 1200,

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
   * @type {Ember.ComputedProperty<Ember.A>}
   */
  expandedRows: computed(function expandedRows() {
    return A(); 
  }),

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
    'harvester',
    function harvesterSpacesProxy() {
      const harvester = this.get('harvester');
      return get(harvester, 'hasViewPrivilege') !== false ?
        get(harvester, 'spaceList').then(sl => sl ? get(sl, 'list') : A()) :
        reject({ id: 'forbidden' });
    }
  )),

  /**
   * @type {Ember.ComputedProperty<PromiseArray<models.Provider>>}
   */
  providersProxy: promise.array(computed(function providersProxy() {
    const harvester = this.get('harvester');
    return get(harvester, 'hasViewPrivilege') !== false ?
      get(harvester, 'effProviderList').then(sl => sl ? get(sl, 'list') : A()) :
      reject({ id: 'forbidden' });
  })),

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
  spaces: array.sort(computed(
    'indexProgressProxy.indexStats',
    'spacesProxy.@each.name',
    function spaces() {
      const {
        indexProgressProxy,
        spacesProxy,
      } = this.getProperties('indexProgressProxy', 'spacesProxy');
      const {
        isFulfilled: indexProxyIsFulfilled,
        indexStats,
      } = getProperties(indexProgressProxy, 'isFulfilled', 'indexStats');
      const spacesProxyIsFulfilled = get(spacesProxy, 'isFulfilled');
      if (indexProxyIsFulfilled && spacesProxyIsFulfilled) {
        const spaceEntityIds = _.keys(indexStats);
        const spaces = [], spaceMocks = [];
        spaceEntityIds.forEach(spaceEntityId => {
          const space = spacesProxy.findBy('entityId', spaceEntityId);
          if (space) {
            spaces.push(space);
          } else {
            spaceMocks.push({
              entityId: spaceEntityId,
              name: 'Space#' + spaceEntityId.slice(0, 6) + ' (' + this.tt('notAccessible') + ')',
            });
          }
        });
        return spaces.sortBy('name').concat(spaceMocks.sortBy('name'));
      } else {
        return [];
      }
    }
  ), ['name:asc']),

  /**
   * @type {Ember.ComputedProperty<Array<models.Provider|Object>>}
   */
  providers: computed(
    'indexProgressProxy.indexStats',
    'providersProxy.@each.name',
    function providers() {
      const {
        indexProgressProxy,
        providersProxy,
      } = this.getProperties(
        'indexProgressProxy',
        'providersProxy'
      );
      const {
        isFulfilled: indexProxyIsFulfilled,
        indexStats,
      } = getProperties(indexProgressProxy, 'isFulfilled', 'indexStats');
      const providersProxyIsFulfilled = get(providersProxy, 'isFulfilled');
      if (indexProxyIsFulfilled && providersProxyIsFulfilled) {
        const providerIds = _.uniq(_.flatten(_.values(indexStats).map(val => _.keys(val))));
        const providers = [], providerMocks = [];
        providerIds.forEach(providerId => {
          const provider = providersProxy.findBy('entityId', providerId);
          if (provider) {
            providers.push(provider);
          } else {
            providerMocks.push({
              entityId: providerId,
              name: 'Provider#' + providerId.slice(0, 6) + ' (' + this.tt('notAccessible') + ')',
            });
          }
        });
        return providers.sortBy('name').concat(providerMocks.sortBy('name'));
      } else {
        return [];
      }
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
        .rejectBy('archival')
        .mapBy('provider')
        .uniq();
    return providers.filter(provider => activeProviders.includes(provider));
  }),

  /**
   * @type {Ember.ComputedProperty<null>}
   */
  basicTableSetupTrigger: computed(
    'spaces',
    'providers',
    'activeProgressData',
    'showOnlyActive',
    function basicTableSetupTrigger() {
      return {};
    }
  ),

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
      return get(meaningfulData, 'length') > 4;
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

  /**
   * @override
   */
  onWindowResize() {
    const {
      _window,
      breakpoint,
    } = this.getProperties('_window', 'breakpoint');
    safeExec(this, () => {
      this.set('isTableCollapsed', get(_window, 'innerWidth') <= breakpoint);
    });
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
      this.$('.activity-indicator').removeClass('pulse-green');
      next(() => {
        safeExec(this, () => this.$('.activity-indicator').addClass('pulse-green'));
      });
    }
  },

  actions: {
    rowHeaderClick(space) {
      const expandedRows = this.get('expandedRows');
      if (expandedRows.includes(space)) {
        expandedRows.removeObject(space);
      } else {
        expandedRows.addObject(space);
      }
    },
    showArchivalChanged(showArchival) {
      this.set('showOnlyActive', !showArchival);
    },
  },
});
