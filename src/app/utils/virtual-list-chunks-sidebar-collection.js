/**
 * FIXME: doc
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';

/**
 * @implements {SidebarCollection}
 */
export class VirtualListChunksSidebarCollection {
  /** @type {VirtualListChunksArray} */
  @tracked virtualListChunksArray;

  constructor(virtualListChunksArray) {
    this.virtualListChunksArray = virtualListChunksArray;
  }

  @reads('virtualListChunksArray.chunksArray') chunksArray;

  /**
   * @implements {SidebarCollection}
   */
  @computed('chunksArray.[]')
  get array() {
    return this.chunksArray.toArray();
  }

  /**
   * @implements {SidebarCollection}
   */
  get ids() {
    return this.array.map(record => record.id);
  }

  setFilter(expression) {
    this.virtualListChunksArray.setFilter(expression);
  }
}
