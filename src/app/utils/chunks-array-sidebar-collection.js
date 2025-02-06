/**
 * Implementation of SidebarCollection (abstraction layer of collection for sidebar)
 * that works on top of ReplacingChunksArray.
 *
 * It is suitable for models that have support for infinite scroll in backend.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';

/**
 * @implements {SidebarCollection}
 */
export class ChunksArraySidebarCollection {
  /** @type {ReplacingChunksArray} */
  #chunksArray;

  /** @type {ReplacingChunksArray} */
  get chunksArray() {
    return this.#chunksArray;
  }

  /**
   * @param {ReplacingChunksArray} chunksArray
   */
  constructor(chunksArray) {
    /** @type {ReplacingChunksArray} */
    this.#chunksArray = chunksArray;
  }

  @computed('chunksArray.[]')
  get array() {
    return this.chunksArray.toArray();
  }

  @computed('array.@each.id')
  get ids() {
    return this.array.map(record => record.id);
  }
}
