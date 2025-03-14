/**
 * A sidebar for data providers.
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ChunkableListModelSidebar from 'onedata-gui-common/components/chunkable-list-model-sidebar';
import { classNames } from '@ember-decorators/component';

@classNames('sidebar-providers')
export default class SidebarProviders extends ChunkableListModelSidebar {
  /**
   * @override
   */
  model = null;

  /**
   * @override
   */
  firstLevelItemIcon = 'provider';

  /**
   * @override
   */
  firstLevelItemComponent = 'sidebar-providers/provider-item';

  /**
   * @override
   */
  sidebarType = 'providers';
}
