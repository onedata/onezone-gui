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

export default OneEmbeddedContainer.extend({
  layout,

  globalNotify: service(),
  router: service(),

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
  dirEntityId: computed('router', function dirEntityId() {
    // FIXME: find a better way
    const currentUrl = this.get('router').get('currentURL');
    const m = currentUrl.match(/.*options=dir\.(.*)/);
    return m && m[1];
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
  callParentActionNames: Object.freeze(['updateDirEntityId']),

  /**
   * @override implements OneEmbeddedContainer
   */
  iframeId: computed('oneprovider.entityId', function iframeId() {
    const oneproviderId = this.get('oneprovider.entityId');
    return `iframe-oneprovider-${oneproviderId}`;
  }),

  // TODO: if there will be more params, use some utils for changing options hash
  dirChangedObserver: observer('dirEntityId', function dirChangedObserver() {
    const {
      router,
      dirEntityId,
    } = this.getProperties('router', 'dirEntityId');
    router.transitionTo({
      queryParams: {
        options: `dir.${dirEntityId}`,
      },
    });
  }),

  actions: {
    updateDirEntityId(dirEntityId) {
      this.set('dirEntityId', dirEntityId);
    },
  },
});
