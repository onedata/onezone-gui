/**
 * View-Model for displaying info about single space item in marketplace.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

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

  name: reads('spaceMarketplaceInfo.name'),
  organizationName: reads('spaceMarketplaceInfo.organizationName'),
  description: reads('spaceMarketplaceInfo.description'),
  tags: reads('spaceMarketplaceInfo.tags'),
  // TODO: VFS-10427 use space-marketplace-info creationTime property in views
  creationTime: reads('spaceMarketplaceInfo.creationTime'),
  totalSupportSize: reads('spaceMarketplaceInfo.totalSupportSize'),
  providerNames: reads('spaceMarketplaceInfo.providerNames'),
  spaceId: reads('spaceMarketplaceInfo.entityId'),

  isAccessGranted: computed(
    'spaceId',
    'viewModel.userSpacesIds',
    function isAccessGranted() {
      return this.viewModel.userSpacesIds.includes(this.spaceId);
    }
  ),
});
