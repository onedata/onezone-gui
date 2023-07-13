/**
 * Proxy component for Oneprovider's `content-space-datasets`.
 *
 * @author Jakub Liput
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneproviderEmbeddedContainer from 'onezone-gui/components/oneprovider-embedded-container';
import layout from 'onezone-gui/templates/components/one-embedded-container';
import { inject as service } from '@ember/service';
import EmbeddedBrowserCommon from 'onezone-gui/mixins/embedded-browser-common';
import notImplementedWarn from 'onedata-gui-common/utils/not-implemented-warn';
import { reads } from '@ember/object/computed';

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
   * **Injected to embedded iframe.**
   * @virtual
   * @type {String}
   */
  dirId: undefined,

  /**
   * List of datasets entity ids that are selected.
   *
   * **Injected to embedded iframe.**
   * @virtual
   * @type {Array<String>}
   */
  selectedDatasets: undefined,

  /**
   * List of archives entity ids that are selected.
   *
   * **Injected to embedded iframe.**
   * @virtual
   * @type {Array<String>}
   */
  selectedArchives: undefined,

  /**
   * List of files entity ids that are selected.
   *
   * **Injected to embedded iframe.**
   * @virtual
   * @type {Array<String>}
   */
  selectedFiles: undefined,

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
    'fileAction',
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
    'updateFileAction',
    'getDataUrl',
    'getDatasetsUrl',
    'getTransfersUrl',
    'getShareUrl',
    'getProvidersUrl',
    'getAccessTokenUrl',
    'getFileGoToUrl',
    'openRestApiModal',
  ]),

  /**
   * @type {ComputedProperty<GoToFileUrlActionHandler.GoToFileActionType>}
   */
  fileAction: reads('navigationState.aspectOptions.fileAction'),

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
