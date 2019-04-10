import Component from '@ember/component';
import { promise, array } from 'ember-awesome-macros';
import { computed, get, getProperties } from '@ember/object';
import { A } from '@ember/array';
import { Promise, reject } from 'rsvp';
import { inject as service } from '@ember/service';
import { debounce, scheduleOnce } from '@ember/runloop';
import _ from 'lodash';
import $ from 'jquery';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(I18n, {
  classNames: ['content-harvesters-indices-progress-table'],

  currentUser: service(),
  i18n: service(),

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
   * @type {Window}
   */
  _window: window,

  /**
   * Window resize handler.
   * @type {Function}
   */
  windowResizeHandler: computed(function windowResizeHandler() {
    return () => {
      debounce(this, this.windowResized, 100);
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Ember.A>}
   */
  expandedRows: computed(function expandedRows() {
    return A(); 
  }),

  /**
   * @type {Ember.ComputedProperty<PromiseObject<models.IndexProgress>>}
   */
  indexProgressProxy: promise.object(computed(
    'index',
    function indexProgressProxy() {
      const index = this.get('index');
      return get(index, 'progress');
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
    'indexProgressProxy.indexProgress',
    'spacesProxy.@each.name',
    function spaces() {
      const {
        indexProgressProxy,
        spacesProxy,
      } = this.getProperties('indexProgressProxy', 'spacesProxy');
      const {
        isFulfilled: indexProxyIsFulfilled,
        indexProgress,
      } = getProperties(indexProgressProxy, 'isFulfilled', 'indexProgress');
      const spacesProxyIsFulfilled = get(spacesProxy, 'isFulfilled');
      if (indexProxyIsFulfilled && spacesProxyIsFulfilled) {
        return _.keys(indexProgress)
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
    'indexProgressProxy.indexProgress',
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
        indexProgress,
      } = getProperties(indexProgressProxy, 'isFulfilled', 'indexProgress');
      const providersProxyIsFulfilled = get(providersProxy, 'isFulfilled');
      const clusterProvidersProxyIsFulfilled =
        get(clusterProvidersProxy, 'isFulfilled');
      if (indexProxyIsFulfilled && providersProxyIsFulfilled &&
        clusterProvidersProxyIsFulfilled) {
        const providerIds = _.uniq(_.flatten(_.values(indexProgress).map(val => _.keys(val))));
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
   * Progress data ready to render. Format:
   * [
   *   {
   *     space: models.Space,
   *     progress: {
   *       provider: models.Provider|{ name: string, entityId: string },
   *       isSupported: boolean, // is space supported by that provider
   *       percent: undefined|number, // int 0-100
   *       valueClass: undefined|string, // one of 'danger', 'warning', 'success'
   *     },
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
        const indexProgress = get(indexProgressProxy, 'indexProgress');
        return spaces.map(space => ({
          space,
          progress: providers.map(provider => {
            const data = get(indexProgress, get(space, 'entityId'));
            const providerEntityId = get(provider, 'entityId');
            const isSupported = _.keys(data).includes(providerEntityId);
            let percent, valueClass;
            if (isSupported) {
              const providerProgress = get(data, providerEntityId);
              percent = Math.floor((100 * providerProgress.objectAt(0)) /
                providerProgress.objectAt(1));
              percent = Math.min(100, Math.abs(percent));
              if (percent < 50) {
                valueClass = 'danger';
              } else if (percent < 100) {
                valueClass = 'warning';
              } else {
                valueClass = 'success';
              }
            }
            return {
              provider,
              isSupported,
              percent,
              valueClass,
            };
          }),
        }));
      } else {
        return [];
      }
    }
  ),

  didInsertElement() {
    this._super(...arguments);
    const {
      _window,
      windowResizeHandler,
    } = this.getProperties('_window', 'windowResizeHandler');
    $(_window).on('resize', windowResizeHandler);
    scheduleOnce('afterRender', this, 'windowResized');
  },

  willDestroyElement() {
    try {
      const {
        _window,
        windowResizeHandler,
      } = this.getProperties('_window', 'windowResizeHandler');
      $(_window).off('resize', windowResizeHandler);
    } finally {
      this._super(...arguments);
    }
  },

  windowResized() {
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
  },
});
