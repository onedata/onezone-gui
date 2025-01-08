/**
 * A sidebar for data providers (extension of ``one-sidebar``)
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneSidebar from 'onedata-gui-common/components/one-sidebar';
import template from 'onedata-gui-common/templates/components/one-sidebar';
import { classNames, layout } from '@ember-decorators/component';

@layout(template)
@classNames('sidebar-providers')
export default class SidebarProviders extends OneSidebar {
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
