/**
 * Content container view of marketplace.
 *
 * @author Jakub Liput
 * @copyright (C) 2022-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import SpacesMarketplaceViewModel from 'onezone-gui/utils/spaces-marketplace-view-model';

export default Component.extend({
  classNames: ['content-spaces-marketplace'],
  classNameBindings: ['viewModel.showEmptyListView:no-spaces-available'],

  navigationState: service(),

  //#region state

  /**
   * @type {Utils.SpacesMarketplaceViewModel}
   */
  viewModel: undefined,

  //#endregion

  init() {
    this._super(...arguments);
    this.set('viewModel', this.createViewModel());
  },

  /**
   * @returns {ComputedProperty<Utils.SpacesMarketplaceViewModel>}
   */
  createViewModel() {
    return SpacesMarketplaceViewModel.create({
      ownerSource: this,
      selectedSpaceId: this.navigationState.aspectOptions.selectedSpace,
    });
  },
});
