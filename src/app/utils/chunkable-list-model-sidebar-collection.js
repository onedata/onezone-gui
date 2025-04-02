/**
 * Implementation of SidebarCollection (abstraction layer of collection for sidebar) that
 * works on top of ChunkableListModel.
 *
 * It is suitable for models that are list by list models (eg. spaceList).
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
export class ChunkableListModelSidebarCollection {
  /** @type {ChunkableListModel} */
  @tracked
  chunkableListModel;

  constructor(chunkableListModel) {
    this.chunkableListModel = chunkableListModel;
  }

  @reads('chunkableListModel.listModel')
  listModel;

  @reads('chunkableListModel.chunksArray')
  chunksArray;

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
  @computed('array.@each.id')
  get ids() {
    return this.array.map(record => record.id);
  }

  @computed('fullArray.@each.id')
  get allIds() {
    return this.fullArray.map(record => record.id);
  }

  @computed('listModel.list.content.[]')
  get fullArray() {
    return this.chunkableListModel.listModel.list.content?.toArray() ?? [];
  }

  @computed(
    'fullArray',
    'chunkableListModel.chunkableListModelFetcher.{filterExpression,filterAdvanced}'
  )
  get filteredFullArray() {
    return this.chunkableListModel.chunkableListModelFetcher.filterItems(this.fullArray);
  }

  /**
   * @type {ProgressTracker|null}
   */
  get progressTracker() {
    return this.chunkableListModel.progressTracker;
  }

  setFilter({ expression, advanced }) {
    this.chunkableListModel.setFilter({ expression, advanced });
  }
}

export default ChunkableListModelSidebarCollection;
