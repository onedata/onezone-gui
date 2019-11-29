/**
 * Proxy component for Oneprovider's `content-spaces-transfers`.
 * 
 * @module components/embedded-content-spaces-transfers
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneEmbeddedContainer from 'onezone-gui/components/one-embedded-container';
import layout from 'onezone-gui/templates/components/one-embedded-container';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
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
   * @virtual
   * @type {string}
   */
  spaceEntityId: undefined,

  /**
   * @virtual
   * @type {string}
   */
  fileEntityId: undefined,

  /**
   * @override implements OneEmbeddedContainer
   * @type {string}
   */
  embeddedComponentName: 'content-space-transfers',

  /**
   * @override implements OneEmbeddedContainer
   */
  iframeType: 'oneprovider',

  /**
   * @override implements OneEmbeddedContainer
   */
  iframeInjectedProperties: Object.freeze(['spaceEntityId', 'fileEntityId']),

  /**
   * @override implements OneEmbeddedContainer
   */
  callParentActionNames: Object.freeze(['closeFileTab']),

  /**
   * @override implements OneEmbeddedContainer
   */
  relatedData: reads('oneprovider'),

  /**
   * @override implements OneEmbeddedContainer
   */
  iframeId: computed('oneprovider.entityId', function iframeId() {
    const oneproviderId = this.get('oneprovider.entityId');
    return `iframe-oneprovider-${oneproviderId}`;
  }),

  actions: {
    closeFileTab() {
      console.log('FIXME:', 'close file tab called');
    },
  },
});
