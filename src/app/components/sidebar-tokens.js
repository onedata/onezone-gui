/**
 * A sidebar for tokens.
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2019-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ChunkableListModelSidebar from 'onedata-gui-common/components/chunkable-list-model-sidebar';
import { classNames } from '@ember-decorators/component';

@classNames('sidebar-tokens')
export default class SidebarTokens extends ChunkableListModelSidebar {
  /**
   * @override
   */
  firstLevelItemComponent = 'sidebar-tokens/token-item';

  /**
   * @override
   */
  sidebarType = 'tokens';

  /**
   * @override
   */
  advancedFiltersComponent = 'sidebar-tokens/advanced-filters';
}
