/**
 * ChunkableListModel implementation for tokens - uses special fetcher class.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import TokensChunkableListModelFetcher from './tokens-chunkable-list-model-fetcher';
import ChunkableListModel from 'onezone-gui/utils/chunkable-list-model';

export default class TokensChunkableListModel extends ChunkableListModel {
  /** @override */
  get ChunkableListModelFetcherClass() {
    return TokensChunkableListModelFetcher;
  }
}
