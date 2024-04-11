/**
 * Container for datasets views for single space (with Oneprovider selector)
 *
 * @author Jakub Liput
 * @copyright (C) 2019-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import I18n from 'onedata-gui-common/mixins/i18n';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { promise, and, bool } from 'ember-awesome-macros';
import ContentOneproviderContainerBase from './content-oneprovider-container-base';
import { camelize } from '@ember/string';
import computedAspectOptionsArray from 'onedata-gui-common/utils/computed-aspect-options-array';

export default ContentOneproviderContainerBase.extend(I18n, {
  classNames: ['content-spaces-datasets'],

  navigationState: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesDatasets',

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
   * **Injected to embedded iframe.**
   * @type {string}
   */
  dirId: reads('navigationState.aspectOptions.dir'),

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

  datasetProxy: promise.object('datasetDeferred.promise'),

  archiveProxy: promise.object('archiveDeferred.promise'),

  dataset: reads('datasetProxy.content'),

  archive: reads('archiveProxy.content'),

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
      selected: null,
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
  },
});
