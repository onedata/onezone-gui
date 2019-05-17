import Component from '@ember/component';
import { promise, array } from 'ember-awesome-macros';
import { computed, get, getProperties, setProperties } from '@ember/object';
import { A } from '@ember/array';
import { Promise, reject } from 'rsvp';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import WindowResizeHandler from 'onedata-gui-common/mixins/components/window-resize-handler';

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
   * @type {Ember.ComputedProperty<Ember.A>}
   */
  expandedRows: computed(function expandedRows() {
    return A(); 
  }),

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
    const currentUser = this.get('currentUser');
    return currentUser.getCurrentUserRecord()
      .then(user => get(user, 'providerList'))
      .then(providerList => get(providerList, 'list'));
  })),

  /**
   * @type {Ember.ComputedProperty<PromiseArray<models.Cluster>>}
   */
  clustersProxy: promise.array(computed(function clustersProxy() {
    const currentUser = this.get('currentUser');
    return currentUser.getCurrentUserRecord()
      .then(user => get(user, 'clusterList'))
      .then(clusterList => get(clusterList, 'list'));
  })),

  /**
   * @type {Ember.ComputedProperty<PromiseArray<models.Provider>>}
   */
  clusterProvidersProxy: promise.array(computed(
    'clustersProxy.[]',
    function clusterProvidersProxy() {
      const clustersProxy = this.get('clustersProxy');
      if (get(clustersProxy, 'isSettled')) {
        return Promise.all(clustersProxy
          .filterBy('type', 'oneprovider')
          .map(cluster => get(cluster, 'provider'))
        );
      } else {
        return new Promise(() => {});
      }
    }
  )),

  /**
   * @type {Ember.ComputedProperty<PromiseArray>}
   */
  dataLoadingProxy: promise.array(promise.all(
    'indexProgressProxy',
    'spacesProxy',
    'providersProxy',
    'clusterProvidersProxy'
  )),

  /**
   * @type {Ember.ComputedProperty<Array<models.Space>>}
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
        return _.keys(indexStats)
          .map(spaceEntityId => spacesProxy.findBy('entityId', spaceEntityId))
          .without(undefined);
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
    'clusterProvidersProxy.@each.name',
    function providers() {
      const {
        indexProgressProxy,
        providersProxy,
        clusterProvidersProxy,
      } = this.getProperties(
        'indexProgressProxy',
        'providersProxy',
        'clusterProvidersProxy'
      );
      const {
        isFulfilled: indexProxyIsFulfilled,
        indexStats,
      } = getProperties(indexProgressProxy, 'isFulfilled', 'indexStats');
      const providersProxyIsFulfilled = get(providersProxy, 'isFulfilled');
      const clusterProvidersProxyIsFulfilled =
        get(clusterProvidersProxy, 'isFulfilled');
      if (indexProxyIsFulfilled && providersProxyIsFulfilled &&
        clusterProvidersProxyIsFulfilled) {
        const providerIds = _.uniq(_.flatten(_.values(indexStats).map(val => _.keys(val))));
        const providers = [], providerMocks = [];
        providerIds.forEach(providerId => {
          const provider = providersProxy.findBy('entityId', providerId) ||
            clusterProvidersProxy.findBy('entityId', providerId);
          if (provider) {
            providers.push(provider);
          } else {
            providerMocks.push({
              entityId: providerId,
              name: 'Provider#' + providerId.slice(0, 6),
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
        .rejectBy('offline')
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
   *         offline: boolean,
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
                'offline',
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
        .filter(({ progress }) => progress.isAny('offline', false))
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
        meaningfulData = meaningfulData.rejectBy('offline');
      }
      return get(meaningfulData, 'length') > 4;
    }
  ),

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
