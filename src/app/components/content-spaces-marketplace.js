/**
 * Content container view of marketplace.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';
import SpacesMarketplaceViewModel from 'onezone-gui/utils/spaces-marketplace-view-model';

export default Component.extend({
  classNames: ['content-spaces-marketplace'],
  classNameBindings: ['noSpacesAvailable:no-spaces-available'],

  noSpacesAvailable: reads('viewModel.noSpacesAvailable'),

  /**
   * @type {ComputedProperty<Utils.SpacesMarketplaceViewModel>}
   */
  viewModel: computed(function viewModel() {
    return SpacesMarketplaceViewModel.create({
      ownerSource: this,
      selectedSpaceId: this.selectedSpaceId,
    });
  }),
});
