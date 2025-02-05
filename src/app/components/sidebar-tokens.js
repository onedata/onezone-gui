/**
 * A sidebar for tokens (extension of `one-sidebar`)
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2019-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VirtualChunksListSidebar from 'onedata-gui-common/components/virtual-chunks-list-sidebar';
import { classNames } from '@ember-decorators/component';

@classNames('sidebar-tokens')
export default class SidebarTokens extends VirtualChunksListSidebar {
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
