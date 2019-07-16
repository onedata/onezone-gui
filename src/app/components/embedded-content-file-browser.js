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
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export default OneEmbeddedContainer.extend({
  layout,

  globalNotify: service(),

  /**
   * @virtual
   * @type {Models.Provider}
   */
  oneprovider: undefined,

  /**
   * TODO: to decide if using entity or record id
   * ID of `file` record of directory to show in files browser.
   * It can be changed from Onezone GUI to change dir displayed
   * in Oneprovider's iframe.
   * @type {string}
   */
  fileId: undefined,

  /**
   * TODO: to decide if using entity or record id
   * ID of `space` record that is space of directory displayed in files
   * browser.
   * @type {string}
   */
  spaceId: undefined,

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
  iframeInjectedProperties: Object.freeze(['fileId', 'spaceId']),

  /**
   * @override implements OneEmbeddedContainer
   */
  callParentActionNames: Object.freeze(['sayHello']),

  /**
   * @override implements OneEmbeddedContainer
   */
  iframeId: computed('oneprovider.entityId', function iframeId() {
    const oneproviderId = this.get('oneprovider.entityId');
    return `iframe-oneprovider-${oneproviderId}`;
  }),

  actions: {
    // TODO: integration testing code, to remove when content-file-browser
    // of Oneprovider GUI will be ready
    sayHello() {
      this.get('globalNotify').info('hello');
    },
  },
});
