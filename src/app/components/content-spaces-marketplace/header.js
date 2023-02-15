// FIXME: jsdoc

import Component from '@ember/component';
import { and, not } from 'ember-awesome-macros';

export default Component.extend({
  classNames: ['spaces-marketplace-header'],

  /**
   * @type {Utils.SpacesMarketplaceViewModel}
   */
  viewModel: undefined,

  isFilterHeaderShown: and(
    'viewModel.entriesInitialLoad.isSettled',
    not('viewModel.showEmptyListView')
  ),
});
