/**
 * Proxy component for Oneprovider's `content-public-share`.
 *
 * @module components/embedded-content-public-share
 * @author Jakub Liput
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneproviderEmbeddedContainer from 'onezone-gui/components/oneprovider-embedded-container';
import layout from 'onezone-gui/templates/components/one-embedded-container';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import EmbeddedContentShareActions from 'onezone-gui/mixins/embedded-content-share-actions';
import EmbeddedBrowserCommon from 'onezone-gui/mixins/embedded-browser-common';

const mixins = [
  EmbeddedBrowserCommon,
  EmbeddedContentShareActions,
];

export default OneproviderEmbeddedContainer.extend(...mixins, {
  layout,

  navigationState: service(),
  globalNotify: service(),
  router: service(),

  /**
   * @virtual
   * @type {string}
   */
  shareId: undefined,

  /**
   * @virtual
   * @type {string}
   */
  baseUrl: undefined,

  /**
   * @type {ComputedProperty<string|undefined>}
   */
  dirId: reads('navigationState.aspectOptions.dirId'),

  /**
   * @override
   */
  embeddedBrowserType: 'share',

  /**
   * @override
   */
  isPublic: true,

  /**
   * @override implements OneEmbeddedContainer
   * @type {string}
   */
  embeddedComponentName: 'content-public-share',

  /**
   * @override implements OneEmbeddedContainer
   */
  iframeInjectedProperties: Object.freeze([
    'shareId',
    'dirId',
  ]),

  /**
   * @override implements OneEmbeddedContainer
   */
  callParentActionNames: Object.freeze([
    'updateDirId',
  ]),
});
