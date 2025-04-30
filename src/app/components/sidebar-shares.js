/**
 * A sidebar for shares.
 *
 * @author Jakub Liput
 * @copyright (C) 2019-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ChunksArraySidebar from 'onedata-gui-common/components/chunks-array-sidebar';
import { classNames } from '@ember-decorators/component';
import { inject as service } from '@ember/service';

@classNames('sidebar-shares')
export default class SidebarShares extends ChunksArraySidebar {
  /**
   * Set of chunks array that has been at least used one time by some instance of
   * SidebarShares.
   * @type {Set<SharesChunksArray>}
   */
  static usedChunksArray = new Set();

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
    // the same as $sidebar-item-line-height-double-line in SCSS
    return 54;
  }

  get wasChunksArrayUsed() {
    return SidebarShares.usedChunksArray.has(this.chunksArray);
  }

  markChunksArrayAsUsed() {
    SidebarShares.usedChunksArray.add(this.chunksArray);
  }

  /**
   * @override
   */
  async didInsertElement() {
    await super.didInsertElement(...arguments);
    const shouldReloadArray = this.wasChunksArrayUsed;
    this.markChunksArrayAsUsed();
    if (shouldReloadArray) {
      await this.chunksArray.scheduleReload();
      if (this.isDestroyed) {
        return;
      }
      // check if fetchPrev is needed because reload causes invalidation of start
      await this.chunksArray.startChanged();
    }
  }
}
