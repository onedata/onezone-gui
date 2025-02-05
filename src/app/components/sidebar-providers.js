/**
 * A sidebar for data providers (extension of ``one-sidebar``)
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VirtualChunksListSidebar from 'onedata-gui-common/components/virtual-chunks-list-sidebar';
import { classNames } from '@ember-decorators/component';

@classNames('sidebar-providers')
export default class SidebarProviders extends VirtualChunksListSidebar {
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
