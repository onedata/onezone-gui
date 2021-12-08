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
   * **Injected to embedded iframe.**
   * @virtual
   * @type {String}
   */
  dirId: undefined,

  /**
   * Seletected item IDs (datasets) for "upper" browser.
   * **Injected to embedded iframe.**
   * @virtual
   * @type {Array<String>}
   */
  selected: undefined,

  /**
   * Seletected item IDs (archives or files) for "bottom" browser.
   * **Injected to embedded iframe.**
   * @virtual
   * @type {Array<String>}
   */
  selectedSecondary: undefined,

  /**
   * Dataset state tree to show. One of: attached, detached.
   *
   * **Injected to embedded iframe.**
   * @type {String}
   */
  attachmentState: undefined,

  /**
   * @override
   */
  embeddedBrowserType: 'datasets',

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
    'selectedSecondary',
    'attachmentState',
    // TODO: VFS-8723 decide if viewMode should be supported for backward compatibility or
    // completely removed
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
    'updateSelectedSecondary',
    // TODO: VFS-8723 decide if viewMode should be supported for backward compatibility or
    // completely removed
    'updateViewMode',
    // TODO: VFS-8723 decide if showing dataset info in onezone-gui header should be
    // supported for backward compatibility or completely removed
    'updateDatasetData',
    // TODO: VFS-8723 decide if storing archive info in onezone-gui header should be
    // supported for backward compatibility or completely removed
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
      // FIXME: breaks backward compat. - selected not cleared for < a24, to decide
      this.get('navigationState').changeRouteAspectOptions({
        archive: archiveId,
        selectedSecondary: null,
      });
    },
    updateDirId(dirId) {
      // FIXME: breaks backward compat. - selected not cleared for < a24, to decide
      this.get('navigationState').changeRouteAspectOptions({
        dir: dirId,
        selectedSecondary: null,
      });
    },
    updateSelected(selected) {
      this.get('navigationState').changeRouteAspectOptions({
        selected: Array.isArray(selected) ? selected.join(',') : selected || null,
      });
    },
    updateSelectedSecondary(selectedSecondary) {
      this.get('navigationState').changeRouteAspectOptions({
        selectedSecondary: Array.isArray(selectedSecondary) ?
          selectedSecondary.join(',') : selectedSecondary || null,
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
