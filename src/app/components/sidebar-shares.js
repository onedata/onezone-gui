/**
 * A sidebar for shares.
 *
 * @author Jakub Liput
 * @copyright (C) 2019-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ChunksSidebar from 'onedata-gui-common/components/chunks-sidebar';
import template from 'onedata-gui-common/templates/components/one-sidebar';
import { layout, classNames } from '@ember-decorators/component';
import { inject as service } from '@ember/service';

@layout(template)
@classNames('sidebar-shares')
export default class SidebarShares extends ChunksSidebar {
  @service shareManager;

  /**
   * @override
   */
  model = null;

  /**
   * @override
   */
  firstLevelItemIcon = 'browser-share';

  /**
   * @override
   */
  sidebarType = 'shares';

  /**
   * @override
   */
  firstLevelItemComponent = 'sidebar-shares/share-item';

  /**
   * @override
   */
  get rowHeight() {
    return 54;
  }

  /**
   * @override
   */
  async didInsertElement() {
    await super.didInsertElement(...arguments);
    // TODO: VFS-12506 Try to optimize numer of reloads (not needed on first init)
    this.chunksArray.scheduleReload();
  }
}
