/**
 * FIXME: doc
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * @implements {SidebarCollection}
 */
export class ChunksArraySidebarCollection {
  @tracked chunksArray;

  constructor(chunksArray) {
    this.chunksArray = chunksArray;
  }

  @computed('chunksArray.[]')
  get array() {
    return this.chunksArray.toArray();
  }

  get ids() {
    return this.array.map(record => record.id);
  }
}
