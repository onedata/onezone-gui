/**
 * Proxy component for Oneprovider's `content-space-datasets`.
 * 
 * @module components/embedded-content-space-datasets
 * @author Jakub Liput
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneproviderEmbeddedContainer from 'onezone-gui/components/oneprovider-embedded-container';
import layout from 'onezone-gui/templates/components/one-embedded-container';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import EmbeddedBrowserCommon from 'onezone-gui/mixins/embedded-browser-common';
import notImplementedWarn from 'onedata-gui-common/utils/not-implemented-warn';

export default OneproviderEmbeddedContainer.extend(EmbeddedBrowserCommon, {
  layout,

  globalNotify: service(),
  router: service(),
  navigationState: service(),

  /**
   * Entity ID of space for which datasets browser is displayed.
   * 
   * **Injected to embedded iframe.**
   * @virtual
   * @type {string}
   */
  spaceId: undefined,

  /**
   * @virtual
   * @type {(dataset: Object) => any}
   */
  onUpdateDatasetData: notImplementedWarn,

  /**
   * @virtual
   * @type {(dataset: Object) => any}
   */
  onUpdateArchiveData: notImplementedWarn,

  /**
   * **Injected to embedded iframe.**
   * @virtual
   * @type {string}
   */
  datasetId: undefined,

  /**
   * **Injected to embedded iframe.**
   * @virtual
   * @type {string}
   */
  archiveId: undefined,

  /**
   * @virtual
   * @type {String}
   */
  viewMode: undefined,

  /**
   * @override
   */
  embeddedBrowserType: 'datasets',

  /**
   * Dataset state tree to show. One of: attached, detached.
   * 
   * **Injected to embedded iframe.**
   * @type {String}
   */
  attachmentState: undefined,

  /**
   * **Injected to embedded iframe.**
   * @type {string}
   */
  dirId: reads('navigationState.aspectOptions.dir'),

  // TODO: VFS-7633 redundancy; create computed util for getting array from aspectOptions
  /**
   * List of dataset entity ids that are selected
   * 
   * **Injected to embedded iframe.**
   * @type {Array<String>}
   */
  selected: computed('navigationState.aspectOptions.selected.[]', {
    get() {
      const rawSelected = this.get('navigationState.aspectOptions.selected');
      return rawSelected && rawSelected.split(',') || [];
    },
    set(key, value) {
      this.get('navigationState').changeRouteAspectOptions({
        selected: value && value.join(',') || null,
      });
      return value;
    },
  }),

  /**
   * @override implements OneEmbeddedContainer
   * @type {string}
   */
  embeddedComponentName: 'content-space-datasets',

  /**
   * @override implements OneEmbeddedContainer
   */
  iframeInjectedProperties: Object.freeze([
    'spaceId',
    'datasetId',
    'archiveId',
    'dirId',
    'selected',
    'attachmentState',
    'viewMode',
  ]),

  /**
   * @override implements OneEmbeddedContainer
   */
  callParentActionNames: Object.freeze([
    'updateDatasetId',
    'updateArchiveId',
    'updateDirId',
    'updateSelected',
    'updateViewMode',
    'updateDatasetData',
    'updateArchiveData',
    'getDataUrl',
    'getDatasetsUrl',
    'getTransfersUrl',
    'getShareUrl',
  ]),

  _location: location,

  actions: {
    updateDatasetId(datasetId) {
      this.get('navigationState').changeRouteAspectOptions({
        dataset: datasetId,
        selected: null,
      });
    },
    updateArchiveId(archiveId) {
      this.get('navigationState').changeRouteAspectOptions({
        archive: archiveId,
        selected: null,
      });
    },
    updateDirId(dirId) {
      this.get('navigationState').changeRouteAspectOptions({
        dir: dirId,
        selected: null,
      });
    },
    updateSelected(selected) {
      this.get('navigationState').changeRouteAspectOptions({
        selected: Array.isArray(selected) ? selected.join(',') : selected || null,
      });
    },
    updateViewMode(viewMode) {
      this.get('navigationState').changeRouteAspectOptions({
        viewMode,
      });
    },

    /**
     * Sets value of dataset property.
     * Due to lack of dataset model in Onezone it is provided by Oneprovider
     * in an iframe.
     * @param {Object} dataset 
     */
    updateDatasetData(dataset) {
      this.get('onUpdateDatasetData')(dataset);
    },

    /**
     * Sets value of archive property.
     * Due to lack of archive model in Onezone it is provided by Oneprovider
     * in an iframe.
     * @param {Object} archive 
     */
    updateArchiveData(archive) {
      this.get('onUpdateArchiveData')(archive);
    },
  },
});
