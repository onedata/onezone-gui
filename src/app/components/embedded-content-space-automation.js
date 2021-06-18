/**
 * Proxy component for Oneprovider's `content-spaces-automation`.
 *
 * @module components/embedded-content-spaces-automation
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneproviderEmbeddedContainer from 'onezone-gui/components/oneprovider-embedded-container';
import layout from 'onezone-gui/templates/components/one-embedded-container';
import { inject as service } from '@ember/service';

export default OneproviderEmbeddedContainer.extend({
  layout,

  navigationState: service(),
  globalNotify: service(),
  router: service(),

  /**
   * Entity ID of `space` record that is a space, where workflow are going
   * to be managed.
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
  iframeInjectedProperties: Object.freeze([
    'spaceEntityId',
  ]),

  /**
   * @override implements OneEmbeddedContainer
   */
  callParentActionNames: Object.freeze([]),
});
