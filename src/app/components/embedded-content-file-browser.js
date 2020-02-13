/**
 * Proxy component for Oneprovider's `content-file-browser`.
 * 
 * @module components/embedded-content-file-browser
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneEmbeddedContainer from 'onezone-gui/components/one-embedded-container';
import layout from 'onezone-gui/templates/components/one-embedded-container';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
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
  iframeInjectedProperties: Object.freeze(['spaceEntityId', 'dirEntityId']),

  /**
   * @override implements OneEmbeddedContainer
   */
  callParentActionNames: Object.freeze([
    'updateDirEntityId',
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

  dirChangedObserver: observer('dirEntityId', function dirChangedObserver() {
    const {
      navigationState,
      dirEntityId,
    } = this.getProperties('navigationState', 'dirEntityId');
    navigationState.setAspectOptions({ dir: dirEntityId });
  }),

  actions: {
    updateDirEntityId(dirEntityId) {
      this.set('dirEntityId', dirEntityId);
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
