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
   * @type {string}
   */
  spaceEntityId: undefined,

  /**
   * Entity ID of `file` record that is the directory displayed in files
   * browser.
   * @type {string}
   */
  dirEntityId: reads('navigationState.aspectOptions.dir'),

  /**
   * List of file entity ids that are selected
   * @type {Array<String>}
   */
  selected: computed('navigationState.aspectOptions.selected.[]', {
    get() {
      const rawSelected = this.get('navigationState.aspectOptions.selected');
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
  embeddedComponentName: 'content-file-browser',

  /**
   * @override implements OneEmbeddedContainer
   */
  iframeType: 'oneprovider',

  _location: location,

  /**
   * @override implements OneEmbeddedContainer
   */
  relatedData: reads('oneprovider'),

  /**
   * @override implements OneEmbeddedContainer
   */
  iframeInjectedProperties: Object.freeze(['spaceEntityId', 'dirEntityId', 'selected']),

  /**
   * @override implements OneEmbeddedContainer
   */
  callParentActionNames: Object.freeze([
    'updateDirEntityId',
    'updateSelected',
    'getDataUrl',
    'getTransfersUrl',
    'getShareUrl',
  ]),

  /**
   * @override implements OneEmbeddedContainer
   */
  iframeId: computed('oneprovider.entityId', function iframeId() {
    const oneproviderId = this.get('oneprovider.entityId');
    return `iframe-oneprovider-${oneproviderId}`;
  }),

  actions: {
    updateDirEntityId(dirEntityId) {
      this.get('navigationState').setAspectOptions({ dir: dirEntityId, selected: null });
    },
    updateSelected(selected) {
      this.set('selected', selected);
    },
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
