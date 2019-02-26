/**
 * A service which provides harvester manipulation functions ready to use for GUI 
 *
 * @module services/harvester-actions
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { computed, get } from '@ember/object';
import { collect } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { next } from '@ember/runloop';
import $ from 'jquery';

export default Service.extend(I18n, {
  router: service(),
  i18n: service(),
  harvesterManager: service(),
  globalNotify: service(),
  guiUtils: service(),

  /**
   * @override
   */
  i18nPrefix: 'services.harvesterActions',

  /**
   * @type {Ember.ComputedProperty<Array<SidebarButtonDefinition>>}
   */
  buttons: collect('btnCreate'),

  /**
   * @type {Ember.ComputedProperty<SidebarButtonDefinition>}
   */
  btnCreate: computed(function btnCreate() {
    const router = this.get('router');
    return {
      icon: 'add-filled',
      title: this.t('btnCreate.title'),
      tip: this.t('btnCreate.hint'),
      class: 'create-harvester-btn',
      action: () => router.transitionTo('onedata.sidebar.content', 'harvesters', 'new'),
    };
  }),

  /**
   * Creates new harvester
   * @param {Object} harvester harvester base object
   * @returns {Promise} A promise, which resolves to new harvester if it has
   * been created successfully.
   */
  createHarvester(harvester) {
    const {
      globalNotify,
      harvesterManager,
      router,
      guiUtils,
    } = this.getProperties(
      'globalNotify',
      'harvesterManager',
      'router',
      'guiUtils'
    );
    return harvesterManager.createRecord(harvester)
      .then(harvester => {
        globalNotify.success(this.t('harvesterCreateSuccess'));
        next(() =>
          router.transitionTo(
            'onedata.sidebar.content.aspect',
            'harvesters',
            guiUtils.getRoutableIdFor(harvester),
            'index',
          ).then(() => {
            const sidebarContainer = $('.col-sidebar');
            $('.col-sidebar').scrollTop(sidebarContainer[0].scrollHeight -
              sidebarContainer[0].clientHeight);
          })
        );
        return harvester;
      }).catch(error => {
        globalNotify.backendError(this.t('harvesterCreating'), error);
        throw error;
      });
  },

  /**
   * Removes space form harvester
   * @param {Model.Harvester} harvester 
   * @param {Model.Space} space
   * @returns {Promise}
   */
  removeSpaceFromHarvester(harvester, space) {
    const {
      harvesterManager,
      globalNotify,
    } = this.getProperties('harvesterManager', 'globalNotify');
    return harvesterManager.removeSpaceFromHarvester(
      get(harvester, 'entityId'),
      get(space, 'entityId')
    ).then(() => {
      globalNotify.success(this.t('removeSpaceFromHarvesterSuccess', {
        harvesterName: get(harvester, 'name'),
        spaceName: get(space, 'name'),
      }));
    }).catch(error => {
      globalNotify.backendError(this.t('removingSpaceFromHarvester'), error);
      throw error;
    });
  },

  /**
   * Adds space to harvester
   * @param {Model.Harvester} harvester 
   * @param {Model.Space} space
   * @return {Promise}
   */
  addSpaceToHarvester(harvester, space) {
    const {
      harvesterManager,
      globalNotify,
    } = this.getProperties('harvesterManager', 'globalNotify');
    return harvesterManager.addSpaceToHarvester(
      get(harvester, 'entityId'),
      get(space, 'entityId')
    ).then(() => {
      globalNotify.success(this.t('addSpaceToHarvesterSuccess', {
        harvesterName: get(harvester, 'name'),
        spaceName: get(space, 'name'),
      }));
    }).catch(error => {
      globalNotify.backendError(this.t('addingSpaceToHarvester'), error);
      throw error;
    });
  },
});
