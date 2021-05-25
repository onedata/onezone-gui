/**
 * Proxy component for Oneprovider's `content-space-shares`.
 * 
 * @module components/embedded-content-space-shares
 * @author Jakub Liput
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneproviderEmbeddedContainer from 'onezone-gui/components/oneprovider-embedded-container';
import layout from 'onezone-gui/templates/components/one-embedded-container';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import EmbeddedContentShareActions from 'onezone-gui/mixins/embedded-content-share-actions';

export default OneproviderEmbeddedContainer.extend(EmbeddedContentShareActions, {
  layout,

  navigationState: service(),
  globalNotify: service(),
  router: service(),

  /**
   * @virtual
   * @type {String}
   */
  spaceId: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  onShowShareList: notImplementedThrow,

  _location: location,

  /**
   * @type {ComputedProperty<string|undefined>}
   */
  shareId: reads('navigationState.aspectOptions.shareId'),

  /**
   * @type {ComputedProperty<string|undefined>}
   */
  dirId: reads('navigationState.aspectOptions.dirId'),

  /**
   * @override
   */
  isPublic: true,

  /**
   * @override implements OneEmbeddedContainer
   * @type {string}
   */
  embeddedComponentName: 'content-space-shares',

  /**
   * @override implements OneEmbeddedContainer
   */
  iframeInjectedProperties: Object.freeze([
    'spaceId',
    'shareId',
    'dirId',
  ]),

  /**
   * @override implements OneEmbeddedContainer
   */
  callParentActionNames: Object.freeze([
    'updateDirId',
    'updateShareId',
    'getShareUrl',
    'getDataUrl',
    'showShareList',
  ]),

  actions: {
    updateShareId(shareId) {
      return this.get('navigationState').setAspectOptions({
        shareId,
      });
    },
    getShareUrl({ shareId, dirId = null } = {}) {
      const {
        _location,
        router,
        navigationState,
      } = this.getProperties('_location', 'router', 'navigationState');
      return _location.origin + _location.pathname + router.urlFor(
        'onedata.sidebar.content.aspect',
        'shares', {
          queryParams: {
            options: serializeAspectOptions(
              navigationState.mergedAspectOptions({ shareId, dirId })
            ),
          },
        }
      );
    },
    showShareList() {
      return this.get('onShowShareList')();
    },
  },
});
