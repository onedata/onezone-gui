/**
 * Container for datasets views for single space (with Oneprovider selector)
 * 
 * @module components/content-spaces-datasets
 * @author Jakub Liput
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed, get, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { or, raw, promise } from 'ember-awesome-macros';
import { defer } from 'rsvp';

export default Component.extend(I18n, {
  classNames: [
    'oneprovider-view-container',
    'content-spaces-datasets',
    'absolute-flex-content',
    'no-pointer-events',
  ],

  navigationState: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesDatasets',

  /**
   * @type {string}
   */
  oneproviderId: reads('navigationState.aspectOptions.oneproviderId'),

  /**
   * Entity ID of dataset currently opened in datasets browser.
   * 
   * **Injected to embedded iframe.**
   * @type {string}
   */
  datasetId: reads('navigationState.aspectOptions.dataset'),

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
   * @type {ComputedProperty<String>}
   */
  viewMode: or('navigationState.aspectOptions.viewMode', raw('datasets')),

  datasetDeferred: computed('datasetId', function datasetDeferred() {
    return defer();
  }),

  datasetProxy: promise.object('datasetDeferred.promise'),

  effAttachmentState: computed('attachmentState', function effAttachmentState() {
    const attachmentState = this.get('attachmentState');
    return this.isValidAttachmentState(attachmentState) ? attachmentState : 'attached';
  }),

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

  isValidAttachmentState(state) {
    return ['attached', 'detached'].includes(state);
  },

  attachmentStateChanged(attachmentState) {
    this.get('navigationState').setAspectOptions({
      attachmentState,
      dataset: null,
    });
  },

  actions: {
    oneproviderIdChanged(oneproviderId) {
      this.get('navigationState').setAspectOptions({
        oneproviderId,
      });
    },
    attachmentStateChanged(attachmentState) {
      this.attachmentStateChanged(attachmentState);
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
  },
});
