/**
 * FIXME: doc; opakowanie na ListModel (model) -> VirtualListFetcher (view model) -> ChunksArray (view) <- VirtualListReloader
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import TokensVirtualListFetcher from './tokens-virtual-list-fetcher';
import VirtualListChunksArray from 'onedata-gui-common/utils/virtual-list-chunks-array';

export default class TokensVirtualListChunksArray extends VirtualListChunksArray {
  /** @override */
  get VirtualListFetcherClass() {
    return TokensVirtualListFetcher;
  }
}
