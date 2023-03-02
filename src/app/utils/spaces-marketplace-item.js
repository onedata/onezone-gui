/**
 * View-Model for displaying info about single space item in marketplace.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { promise } from 'ember-awesome-macros';

export default EmberObject.extend({
  /**
   * @virtual
   * @type {Models.SpaceMarketplaceInfo}
   */
  spaceMarketplaceInfo: undefined,

  /**
   * @virtual
   * @type {Utils.SpacesMarketplaceViewModel}
   */
  viewModel: undefined,

  /**
   * Index for infinite scroll.
   * @type {string}
   */
  index: reads('spaceMarketplaceInfo.index'),

  name: reads('spaceMarketplaceInfo.name'),
  organizationName: reads('spaceMarketplaceInfo.organizationName'),
  description: reads('spaceMarketplaceInfo.description'),
  tags: reads('spaceMarketplaceInfo.tags'),
  creationTime: reads('spaceMarketplaceInfo.creationTime'),
  totalSupportSize: reads('spaceMarketplaceInfo.totalSupportSize'),
  providerNames: reads('spaceMarketplaceInfo.providerNames'),
  spaceId: reads('spaceMarketplaceInfo.entityId'),

  /**
   * Implements id property used by `Utils.InfiniteScroll.ScrollHandler`.
   * @type {ComputedProperty<string>}
   */
  id: reads('spaceId'),

  /**
   * @type {ComputedProperty<boolean|null>}
   */
  isAccessGranted: reads('isAccessGrantedProxy.content'),

  isAccessGrantedProxy: promise.object(computed(
    'spaceId',
    'viewModel.userSpacesIdsProxy',
    async function isAccessGrantedProxy() {
      const userSpacesIds = await this.viewModel.userSpacesIdsProxy;
      return userSpacesIds.includes(this.spaceId);
    }
  )),
});
