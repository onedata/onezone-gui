/**
 * Proxy component for Oneprovider's `content-private-share`.
 *
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
  shareManager: service(),
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
   * @virtual
   * @type {string}
   */
  spaceId: undefined,

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
  isPublic: false,

  /**
   * @override implements OneEmbeddedContainer
   * @type {string}
   */
  embeddedComponentName: 'content-private-share',

  /**
   * @override implements OneEmbeddedContainer
   */
  iframeInjectedProperties: Object.freeze([
    'shareId',
    'spaceId',
    'dirId',
  ]),

  /**
   * @override implements OneEmbeddedContainer
   */
  callParentActionNames: Object.freeze([
    'updateDirId',
    'getDataUrl',
    'getDatasetsUrl',
    'showSharesIndex',
    'reloadShareList',
    // TODO: VFS-11156 This method will be needed to implement shared files links
    // 'getFileGoToUrl',
  ]),

  actions: {
    showSharesIndex() {
      return this.get('router').transitionTo('onedata.sidebar.index', 'shares');
    },
    reloadShareList() {
      return this.get('shareManager')
        .getAllShares()
        .then(allShares => allShares.reload());
    },
  },
});
