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
import computedAspectOptionsArray from 'onedata-gui-common/utils/computed-aspect-options-array';

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
   * List of datasets entity ids that are selected.
   *
   * **Injected to embedded iframe.**
   * @type {Array<String>}
   */
  selectedDatasets: computedAspectOptionsArray('selectedDatasets'),

  /**
   * List of archives entity ids that are selected.
   *
   * **Injected to embedded iframe.**
   * @type {Array<String>}
   */
  selectedArchives: computedAspectOptionsArray('selectedArchives'),

  /**
   * List of files entity ids that are selected.
   *
   * **Injected to embedded iframe.**
   * @type {Array<String>}
   */
  selectedFiles: computedAspectOptionsArray('selectedFiles'),

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
    'selectedDatasets',
    'selectedArchives',
    'selectedFiles',
    'attachmentState',
  ]),

  /**
   * @override implements OneEmbeddedContainer
   */
  callParentActionNames: Object.freeze([
    'updateDatasetId',
    'updateArchiveId',
    'updateDirId',
    'updateSelectedDatasets',
    'updateSelectedArchives',
    'updateSelectedFiles',
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
        selectedDatasets: null,
      });
    },
    updateArchiveId(archiveId) {
      this.get('navigationState').changeRouteAspectOptions({
        archive: archiveId,
        selectedArchives: null,
        selectedFiles: null,
      });
    },
    updateDirId(dirId) {
      this.get('navigationState').changeRouteAspectOptions({
        dir: dirId,
        selectedFiles: null,
      });
    },
    updateSelectedDatasets(selected) {
      this.set('selectedDatasets', selected);
    },
    updateSelectedArchives(selected) {
      this.set('selectedArchives', selected);
    },
    updateSelectedFiles(selected) {
      this.set('selectedFiles', selected);
    },
  },
});
