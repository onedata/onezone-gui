/**
 * A sticky container for content-spaces-marketplace headers.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

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
