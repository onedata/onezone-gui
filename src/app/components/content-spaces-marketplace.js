/**
 * Content container view of the Space Marketplace.
 *
 * @author Jakub Liput
 * @copyright (C) 2022-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { next } from '@ember/runloop';
import SpacesMarketplaceViewModel from 'onezone-gui/utils/spaces-marketplace-view-model';
import globalCssVariablesManager from 'onedata-gui-common/utils/global-css-variables-manager';

/**
 * Spacing between items in px.
 * @type {number}
 */
export const itemSpacing = 20;

globalCssVariablesManager.setVariable(
  'components/content-spaces-marketplace/list',
  '--spaces-marketplace-item-spacing',
  `${itemSpacing}px`,
);

export default Component.extend({
  classNames: ['content-spaces-marketplace'],
  classNameBindings: ['viewModel.showEmptyListView:no-spaces-available'],

  navigationState: service(),
  spaceManager: service(),
  router: service(),

  //#region state

  /**
   * @type {Utils.SpacesMarketplaceViewModel}
   */
  viewModel: undefined,

  //#endregion

  isMarketplaceEnabled: reads('spaceManager.marketplaceConfig.enabled'),

  init() {
    this._super(...arguments);
    if (!this.isMarketplaceEnabled) {
      next(this, () => this.router.transitionTo('index'));
      return;
    }
    this.initViewModel();
  },

  /**
   * This method should be used only one-time to not produce dangling objects.
   * @private
   * @returns {ComputedProperty<Utils.SpacesMarketplaceViewModel>}
   */
  initViewModel() {
    if (this.viewModel) {
      console.warn(
        'ContentSpacesMarketplace#initViewModel: viewModel is already initialized'
      );
      return;
    }
    const viewModel = SpacesMarketplaceViewModel.create({
      ownerSource: this,
      selectedSpaceId: this.navigationState.aspectOptions.selectedSpace,
    });
    this.set('viewModel', viewModel);
  },

  /**
   * @override
   */
  willDestroy() {
    try {
      this.viewModel?.destroy();
    } finally {
      this._super(...arguments);
    }
  },
});
