/**
 * FIXME: doc; opakowanie na ListModel (model) -> ChunkableListModelFetcher (view model) -> ChunksArray (view) <- ChunkableListModelReloader
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import TokensChunkableListModelFetcher from './tokens-chunkable-list-model-fetcher';
import ChunkableListModel from 'onedata-gui-common/utils/chunkable-list-model';

export default class TokensVirtualListChunksArray extends ChunkableListModel {
  /** @override */
  get ChunkableListModelFetcherClass() {
    return TokensChunkableListModelFetcher;
  }
}
