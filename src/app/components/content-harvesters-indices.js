/**
 * A component that shows harvester indices
 *
 * @module components/content-harvesters-indices
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { collect } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import { Promise } from 'rsvp';

export default Component.extend(I18n, GlobalActions, {
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
   * @type {Ember.ComputedProperty<PromiseArray<string>>}
   */
  guiPluginIndicesNamesProxy: computed(
    'harvester',
    function guiPluginIndicesNamesProxy() {
      const {
        harvesterManager,
        harvester,
      } = this.getProperties('harvesterManager', 'harvester');
      return PromiseArray.create({
        promise: harvesterManager.getGuiPluginManifest(get(harvester, 'id'))
          .then(result => {
            const indices = get(result, 'onedata.indices');
            if (Array.isArray(indices)) {
              return indices.filter(index =>
                index && typeof get(index, 'name') === 'string'
              ).uniqBy('name').mapBy('name');
            } else {
              return [];
            }
          }).catch(() => []),
      });
    }
  ),

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
   * @type {Ember.ComputedProperty<PromiseArray<Model.Index>>}
   */
  indicesProxy: computed('harvester', function spacesProxy() {
    const harvester = this.get('harvester');
    return PromiseArray.create({
      promise: get(harvester, 'indexList').then(list => get(list, 'list')),
    });
  }),

  /**
   * @override 
   * @type {Ember.ComputedProperty<string>}
   */
  globalActionsTitle: computed(function globalActionsTitle() {
    return this.t('harvesterIndices');
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  removeIndexAction: computed(function removeSpaceAction() {
    return {
      action: index => this.set('indexToRemove', index),
      title: this.t('removeThisIndex'),
      class: 'remove-index',
      icon: 'close',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  indexActions: collect('removeIndexAction'),

  actions: {
    removeIndex() {
      const {
        harvesterActions,
        indexToRemove,
      } = this.getProperties('harvesterActions', 'indexToRemove');
      this.set('isRemovingIndex', true);
      return harvesterActions.removeIndex(indexToRemove)
        .finally(() =>
          safeExec(this, 'setProperties', {
            isRemovingIndex: false,
            indexToRemove: null,
          })
        );
    },
  },
});
