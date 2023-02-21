/**
 * Content container view of marketplace.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import SpacesMarketplaceViewModel from 'onezone-gui/utils/spaces-marketplace-view-model';

export default Component.extend({
  classNames: ['content-spaces-marketplace'],
  classNameBindings: ['viewModel.showEmptyListView:no-spaces-available'],

  navigationState: service(),

  selectedSpaceId: reads('navigationState.aspectOptions.selectedSpace'),

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
