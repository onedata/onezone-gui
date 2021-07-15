/**
 * Container for datasets views for single space (with Oneprovider selector)
 * 
 * @module components/content-spaces-datasets
 * @author Jakub Liput
 * @copyright (C) 2019-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed, get, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { or, raw, promise, notEqual, and, bool } from 'ember-awesome-macros';
import { defer } from 'rsvp';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';
import ContentOneproviderContainerBase from './content-oneprovider-container-base';
import { camelize } from '@ember/string';

export default ContentOneproviderContainerBase.extend(I18n, {
  classNames: ['content-spaces-datasets'],

  navigationState: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesDatasets',

  datasetDataMapping: Object.freeze({}),

  archiveDataMapping: Object.freeze({}),

  /**
   * Entity ID of dataset currently opened in datasets browser.
   * 
   * **Injected to embedded iframe.**
   * @type {string}
   */
  datasetId: reads('navigationState.aspectOptions.dataset'),

  /**
   * **Injected to embedded iframe.**
   * @type {string}
   */
  archiveId: reads('navigationState.aspectOptions.archive'),

  /**
   * One of: attached, detached.
   * @type {String}
   */
  attachmentState: reads('navigationState.aspectOptions.attachmentState'),

  /**
   * View mode: 
   * - datasets: default, browse datasets; if `datasetId` is provided, open dataset
   *     children listing of this dataset if available
   * - archives: browse list of archives of a single dataset; `datasetId` is required
   * - files: browse filesystem of archive
   * @type {ComputedProperty<String>}
   */
  viewMode: or('navigationState.aspectOptions.viewMode', raw('datasets')),

  datasetDeferred: computed('datasetId', function datasetDeferred() {
    return defer();
  }),

  archiveDeferred: computed('archiveId', function archiveDeferred() {
    if (!this.get('archiveId')) {
      const deferred = defer();
      deferred.resolve(null);
      return deferred;
    }
    return defer();
  }),

  datasetProxy: promise.object('datasetDeferred.promise'),

  archiveProxy: promise.object('archiveDeferred.promise'),

  dataset: reads('datasetProxy.content'),

  archive: reads('archiveProxy.content'),

  /**
   * @type {ComputedProperty<String>}
   */
  backToDatasetsOptions: computed(
    'navigationState.aspectOptions',
    'dataset.{entityId,rootDir,rootFileType}',
    function backToDatasetsOptions() {
      const dataset = this.get('dataset');
      const options = {
        viewMode: 'datasets',
        archive: null,
        dir: null,
        selected: get(dataset, 'entityId') || null,
        dataset: get(dataset, 'parentId') || null,
      };
      const mergedOptions = this.get('navigationState').mergedAspectOptions(options);
      return serializeAspectOptions(mergedOptions);
    }
  ),

  effAttachmentState: computed('attachmentState', function effAttachmentState() {
    const attachmentState = this.get('attachmentState');
    return this.isValidAttachmentState(attachmentState) ? attachmentState : 'attached';
  }),

  effArchiveDipMode: computed(
    'archive',
    'isArchiveDipAvailable',
    'selectedDipMode',
    function effArchiveDipMode() {
      const {
        archive,
        isArchiveDipAvailable,
        selectedDipMode,
      } = this.getProperties('archive', 'isArchiveDipAvailable', 'selectedDipMode');
      if (!archive) {
        return this.isArchiveDipModeValid(selectedDipMode) ? selectedDipMode : 'aip';
      }
      if (!isArchiveDipAvailable) {
        return 'aip';
      }
      return get(archive, 'relatedAipId') ? 'dip' : 'aip';
    }
  ),

  /**
   * Stores last value of archive data mode selected by user - it can be different than
   * mode used by GUI. One of: aip, dip.
   * See `effArchiveDipMode`.
   * @type {String}
   */
  selectedDipMode: 'aip',

  renderArchiveDipSwitch: bool('archive'),

  archiveDipModeSwitchEnabled: and('archive', 'isArchiveDipAvailable'),

  isArchiveDipAvailable: bool('archive.config.includeDip'),

  showOpenedDatasetHeader: notEqual('viewMode', raw('datasets')),

  tryToResolveDataset: observer(
    'datasetDeferred',
    'datasetDataMapping',
    function tryToResolveDataset() {
      const {
        datasetId,
        datasetDeferred,
        datasetDataMapping,
      } = this.getProperties('datasetId', 'datasetDeferred', 'datasetDataMapping');
      const datasetData = datasetDataMapping[datasetId];
      if (datasetData) {
        datasetDeferred.resolve(datasetData);
      }
    }
  ),

  tryToResolveArchive: observer(
    'archiveDeferred',
    'archiveDataMapping',
    function tryToResolveArchive() {
      const {
        archiveId,
        archiveDeferred,
        archiveDataMapping,
      } = this.getProperties('archiveId', 'archiveDeferred', 'archiveDataMapping');
      const archiveData = archiveDataMapping[archiveId];
      if (archiveData) {
        archiveDeferred.resolve(archiveData);
      }
    }
  ),

  isValidAttachmentState(state) {
    return ['attached', 'detached'].includes(state);
  },

  attachmentStateChanged(attachmentState) {
    this.get('navigationState').changeRouteAspectOptions({
      attachmentState,
      dataset: null,
    });
  },

  archiveDipModeChanged(archiveDipMode) {
    const archive = this.get('archive');
    // do not allow to change mode if archive is not yet loaded
    if (!archive) {
      return;
    }

    const relatedArchiveId = this.getRelatedArchiveId(archiveDipMode);
    // do not allow to change mode if cannot get related archive ID
    if (!relatedArchiveId) {
      return;
    }

    this.set('selectedDipMode', archiveDipMode);
    this.get('navigationState').changeRouteAspectOptions({
      archive: relatedArchiveId,
      dir: null,
    });
  },

  getRelatedArchiveId(archiveDipMode) {
    const archive = this.get('archive');
    if (!archive || !this.isArchiveDipModeValid(archiveDipMode)) {
      return;
    }
    const idKey = camelize(`related-${archiveDipMode}-id`);
    return get(archive, idKey);
  },

  isArchiveDipModeValid(archiveDipMode) {
    return archiveDipMode === 'aip' || archiveDipMode === 'dip';
  },

  actions: {
    attachmentStateChanged(attachmentState) {
      this.attachmentStateChanged(attachmentState);
    },
    archiveDipModeChanged(archiveDipMode) {
      this.archiveDipModeChanged(archiveDipMode);
    },
    updateDatasetData(dataset) {
      const receivedDatasetId = dataset && get(dataset, 'entityId');
      this.set(
        'datasetDataMapping',
        Object.assign({},
          this.get('datasetDataMapping'), {
            [receivedDatasetId]: dataset,
          },
        )
      );
    },
    updateArchiveData(archive) {
      const receivedArchiveId = archive && get(archive, 'entityId');
      this.set(
        'archiveDataMapping',
        Object.assign({},
          this.get('archiveDataMapping'), {
            [receivedArchiveId]: archive,
          },
        )
      );
    },
  },
});
