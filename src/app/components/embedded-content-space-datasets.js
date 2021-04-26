/**
 * Proxy component for Oneprovider's `content-file-browser`.
 * 
 * @module components/embedded-content-file-browser
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneproviderEmbeddedContainer from 'onezone-gui/components/oneprovider-embedded-container';
import layout from 'onezone-gui/templates/components/one-embedded-container';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export default OneproviderEmbeddedContainer.extend({
  layout,

  globalNotify: service(),
  router: service(),
  navigationState: service(),

  /**
   * @virtual
   * @type {Models.Provider}
   */
  oneprovider: undefined,

  /**
   * Entity ID of `space` record that is space of directory displayed in files
   * browser.
   * 
   * **Injected to embedded iframe.**
   * @type {string}
   */
  spaceId: undefined,

  /**
   * Entity ID of dataset currently opened in datasets browser.
   * 
   * **Injected to embedded iframe.**
   * @type {string}
   */
  datasetId: reads('navigationState.aspectOptions.dataset'),

  // FIXME: redundancy; create computed util for getting array from aspectOptions
  // create computed property for navigation state lists
  /**
   * List of dataset entity ids that are selected
   * 
   * **Injected to embedded iframe.**
   * @type {Array<String>}
   */
  selectedDatasetsIds: computed('navigationState.aspectOptions.selectedDatasetsIds.[]', {
    get() {
      const rawSelected = this.get('navigationState.aspectOptions.selectedDatasetsIds');
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
  iframeType: 'oneprovider',

  /**
   * @override implements OneEmbeddedContainer
   */
  relatedData: reads('oneprovider'),

  /**
   * @override implements OneEmbeddedContainer
   */
  iframeInjectedProperties: Object.freeze([
    'spaceId',
    'datasetId',
    'selectedDatasetsIds',
  ]),

  /**
   * @override implements OneEmbeddedContainer
   */
  callParentActionNames: Object.freeze([
    'updateDatasetId',
    'updateSelectedDatasetsIds',
    'getDataUrl',
  ]),

  _location: location,

  actions: {
    updateDatasetId(datasetId) {
      this.get('navigationState').setAspectOptions({
        dataset: datasetId,
        selected: null,
      });
    },
    updateSelectedDatasetsIds(selected) {
      this.set('selectedDatasetsIds', selected);
    },
  },
});
