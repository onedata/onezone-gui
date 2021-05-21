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
   * @type {(dataset: Dataset) => any}
   */
  onUpdateDatasetData: notImplementedWarn,

  /**
   * **Injected to embedded iframe.**
   * @virtual
   * @type {string}
   */
  datasetId: undefined,

  /**
   * @virtual
   * @type {String}
   */
  viewMode: undefined,

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
  archiveId: reads('navigationState.aspectOptions.archive'),

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
  selectedIds: computed('navigationState.aspectOptions.selectedIds.[]', {
    get() {
      const rawSelected = this.get('navigationState.aspectOptions.selectedIds');
      return rawSelected && rawSelected.split(',') || [];
    },
    set(key, value) {
      this.get('navigationState').setAspectOptions({
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
    'selectedIds',
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
    'updateSelectedIds',
    'updateViewMode',
    'updateDatasetData',
    'getDataUrl',
    'getDatasetsUrl',
  ]),

  _location: location,

  actions: {
    updateDatasetId(datasetId) {
      this.get('navigationState').setAspectOptions({
        dataset: datasetId,
        selected: null,
      });
    },
    updateArchiveId(archiveId) {
      this.get('navigationState').setAspectOptions({
        archive: archiveId,
        selected: null,
      });
    },
    updateDirId(dirId) {
      this.get('navigationState').setAspectOptions({
        dir: dirId,
        selected: null,
      });
    },
    updateSelectedIds(selected) {
      this.get('navigationState').setAspectOptions({
        selected,
      });
    },
    updateViewMode(viewMode) {
      this.get('navigationState').setAspectOptions({
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
     * @param {Object} options
     * @param {String} options.fileId
     * @param {Array<String>} options.selected
     * @returns {String} URL to selected or opened item in file browser
     */
    getDataUrl(options) {
      return this.getBrowserUrl('data', options);
    },
    /**
     * @param {Object} options
     * @param {String} options.datasetId
     * @param {Array<String>} options.selected
     * @returns {String} URL to selected or opened item in dataset browser
     */
    getDatasetsUrl(options) {
      return this.getBrowserUrl('datasets', options);
    },
  },
});
