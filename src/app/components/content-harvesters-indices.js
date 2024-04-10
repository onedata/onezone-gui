/**
 * A component that shows harvester indices
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import {
  computed,
  observer,
  get,
  getProperties,
  set,
} from '@ember/object';
import { collect } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/i18n';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import { Promise, reject } from 'rsvp';
import { A } from '@ember/array';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';

export default Component.extend(
  I18n,
  GlobalActions,
  createDataProxyMixin('guiPluginIndicesNames', { type: 'array' }),
  createDataProxyMixin('indices', { type: 'array' }), {
    classNames: ['content-harvesters-indices'],

    harvesterActions: service(),
    harvesterManager: service(),
    i18n: service(),

    /**
     * @override
     */
    i18nPrefix: 'components.contentHarvestersIndices',

    /**
     * @virtual
     * @type {Model.Harvester}
     */
    harvester: undefined,

    /**
     * @type {Models.Index}
     */
    indexToRemove: null,

    /**
     * @type {boolean}
     */
    isRemovingIndex: false,

    /**
     * @type {boolean}
     */
    isCreateIndexFormVisible: false,

    /**
     * @type {Ember.ComputedProperty<PromiseArray>}
     */
    dataProxy: computed(
      'guiPluginIndicesNamesProxy',
      'indicesProxy',
      function dataProxy() {
        const {
          guiPluginIndicesNamesProxy,
          indicesProxy,
        } = this.getProperties('guiPluginIndicesNamesProxy', 'indicesProxy');
        return PromiseArray.create({
          promise: Promise.all([
            guiPluginIndicesNamesProxy,
            indicesProxy,
          ]),
        });
      }
    ),

    /**
     * @type {Ember.ComputedProperty<Action>}
     */
    createAction: computed('isCreateIndexFormVisible', function createAction() {
      return {
        action: () => this.set('isCreateIndexFormVisible', true),
        title: this.t('create'),
        class: 'create-index',
        icon: 'add-filled',
        disabled: this.get('isCreateIndexFormVisible'),
      };
    }),

    /**
     * @type {Ember.ComputedProperty<Array<Action>>}
     */
    globalActions: collect('createAction'),

    /**
     * @override
     * @type {Ember.ComputedProperty<string>}
     */
    globalActionsTitle: computed(function globalActionsTitle() {
      return this.t('harvesterIndices');
    }),

    indicesProxyObserver: observer(
      'indicesProxy.length',
      function indicesProxyObserver() {
        const {
          indicesProxy,
          isCreateIndexFormVisible,
        } = this.getProperties('indicesProxy', 'isCreateIndexFormVisible');
        const {
          isFulfilled,
          length,
        } = getProperties(indicesProxy, 'isFulfilled', 'length');
        if (isFulfilled && !length && !isCreateIndexFormVisible) {
          this.set('isCreateIndexFormVisible', true);
        }
      }
    ),

    /**
     * @returns {Promise}
     */
    fetchGuiPluginIndicesNames() {
      const {
        harvesterManager,
        harvester,
      } = this.getProperties('harvesterManager', 'harvester');
      const guiPluginManifest =
        harvesterManager.getGuiPluginManifest(get(harvester, 'id'));
      return guiPluginManifest
        .then(() => get(guiPluginManifest, 'indices').mapBy('name'))
        .catch(() => []);
    },

    /**
     * @returns {Promise}
     */
    fetchIndices() {
      const harvester = this.get('harvester');
      return get(harvester, 'hasViewPrivilege') !== false ?
        get(harvester, 'indexList').then(list => list ? get(list, 'list') : A()) :
        reject({ id: 'forbidden' });
    },

    actions: {
      createIndex(indexRepresentation) {
        const {
          harvesterActions,
          harvester,
        } = this.getProperties(
          'harvesterActions',
          'harvester'
        );
        set(indexRepresentation, 'guiPluginName', null);
        return harvesterActions.createIndex(harvester, indexRepresentation)
          .then(() => safeExec(this, () => {
            this.set('isCreateIndexFormVisible', false);
          }));
      },
      removeIndex(removeData) {
        const {
          harvesterActions,
          indexToRemove,
        } = this.getProperties('harvesterActions', 'indexToRemove');
        this.set('isRemovingIndex', true);
        return harvesterActions.removeIndex(indexToRemove, removeData)
          .finally(() =>
            safeExec(this, 'setProperties', {
              isRemovingIndex: false,
              indexToRemove: null,
            })
          );
      },
    },
  }
);
