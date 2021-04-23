/**
 * Proxy component for Oneprovider's `content-file-browser`.
 * 
 * @module components/embedded-content-file-browser
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneEmbeddedContainer from 'onezone-gui/components/one-embedded-container';
import layout from 'onezone-gui/templates/components/one-embedded-container';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';

export default OneEmbeddedContainer.extend({
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

  // FIXME: redundancy with embedded-content-file-browser, embedded-content-space-shares
  /**
   * @override implements OneEmbeddedContainer
   */
  iframeId: computed('oneprovider.entityId', function iframeId() {
    const oneproviderId = this.get('oneprovider.entityId');
    return `iframe-oneprovider-${oneproviderId}`;
  }),

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
    // FIXME: redundancy with other components
    getDataUrl({ fileId, selected }) {
      const {
        _location,
        router,
        navigationState,
      } = this.getProperties('_location', 'router', 'navigationState');
      return _location.origin + _location.pathname + router.urlFor(
        'onedata.sidebar.content.aspect',
        'data', {
          queryParams: {
            options: serializeAspectOptions(
              navigationState.mergedAspectOptions({
                dir: fileId,
                selected: (selected instanceof Array) ?
                  selected.join(',') : selected || '',
              })
            ),
          },
        });
    },
    getTransfersUrl({ fileId, tabId }) {
      const {
        _location,
        router,
      } = this.getProperties('_location', 'router');
      return _location.origin + _location.pathname + router.urlFor(
        'onedata.sidebar.content.aspect',
        'transfers', {
          queryParams: {
            options: serializeAspectOptions({
              fileId,
              tab: tabId,
            }),
          },
        }
      );
    },
    getShareUrl({ shareId }) {
      const {
        _location,
        router,
      } = this.getProperties('_location', 'router');
      return _location.origin + _location.pathname + router.urlFor(
        'onedata.sidebar.content.aspect',
        'shares', {
          queryParams: {
            options: serializeAspectOptions({
              shareId,
            }),
          },
        }
      );
    },
  },
});
