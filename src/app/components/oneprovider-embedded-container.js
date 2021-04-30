/**
 * One-embedded-container used for embedded Oneprovider GUI parts.
 * 
 * @module components/oneprovider-embedded-container
 * @author Jakub Liput
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneEmbeddedContainer from 'onezone-gui/components/one-embedded-container';
import { tag } from 'ember-awesome-macros';
import { reads } from '@ember/object/computed';

export default OneEmbeddedContainer.extend({
  /**
   * @virtual
   * @type {Models.Provider}
   */
  oneprovider: undefined,

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
  iframeId: tag `iframe-oneprovider-${'oneprovider.entityId'}`,
});
