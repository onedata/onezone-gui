/**
 * Proxy component for Oneprovider's `content-spaces-transfers`.
 *
 * @module components/embedded-content-spaces-transfers
 * @author Jakub Liput
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
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
  globalNotify: service(),
  router: service(),

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
   * @virtual
   * @type {string}
   */
  tab: undefined,

  /**
   * @override implements OneEmbeddedContainer
   * @type {string}
   */
  embeddedComponentName: 'content-space-transfers',

  /**
   * @override implements OneEmbeddedContainer
   */
  iframeInjectedProperties: Object.freeze([
    'spaceEntityId',
    'fileEntityId',
    'tab',
  ]),

  /**
   * @override implements OneEmbeddedContainer
   */
  callParentActionNames: Object.freeze([
    'closeFileTab',
    'resetQueryParams',
    'changeListTab',
    'getDataUrl',
    'getDatasetsUrl',
  ]),

  actions: {
    closeFileTab() {
      return this.get('navigationState').changeRouteAspectOptions({
        tab: 'waiting',
        fileId: null,
      }, true);
    },
    resetQueryParams() {
      return this.get('navigationState').changeRouteAspectOptions({
        tab: null,
        fileId: null,
      });
    },
    changeListTab(tab) {
      return this.get('navigationState').changeRouteAspectOptions({
        tab,
      });
    },
  },
});
