/**
 * Proxy component for Oneprovider's `content-space-config`.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneproviderEmbeddedContainer from 'onezone-gui/components/oneprovider-embedded-container';
import layout from 'onezone-gui/templates/components/one-embedded-container';
import { inject as service } from '@ember/service';
import EmbeddedBrowserCommon from 'onezone-gui/mixins/embedded-browser-common';

const mixins = [
  EmbeddedBrowserCommon,
];

export default OneproviderEmbeddedContainer.extend(...mixins, {
  layout,

  navigationState: service(),

  /**
   * Entity ID of `space` record that is a space, where configuration 
   * are going to be managed.
   * @virtual
   * @type {string}
   */
  spaceEntityId: undefined,

  /**
   * @override implements OneEmbeddedContainer
   * @type {string}
   */
  embeddedComponentName: 'content-space-config',

  /**
   * @override implements OneEmbeddedContainer
   */
  iframeInjectedProperties: Object.freeze([
    'spaceEntityId',
  ]),
});
