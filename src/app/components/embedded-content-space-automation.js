/**
 * Proxy component for Oneprovider's `content-spaces-automation`.
 *
 * @module components/embedded-content-spaces-automation
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneEmbeddedContainer from 'onezone-gui/components/one-embedded-container';
import layout from 'onezone-gui/templates/components/one-embedded-container';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export default OneEmbeddedContainer.extend({
  layout,

  navigationState: service(),
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
   * @override implements OneEmbeddedContainer
   * @type {string}
   */
  embeddedComponentName: 'content-space-automation',

  /**
   * @override implements OneEmbeddedContainer
   */
  iframeType: 'oneprovider',

  /**
   * @override implements OneEmbeddedContainer
   */
  iframeInjectedProperties: Object.freeze([
    'spaceEntityId',
  ]),

  /**
   * @override implements OneEmbeddedContainer
   */
  callParentActionNames: Object.freeze([]),

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
});
