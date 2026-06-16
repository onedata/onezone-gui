/**
 * Returns whether the provided ID matches the search filter.
 * Matching is performed only from the beginning of the ID
 * and starts after the minimum filter length is reached.
 *
 * @author Agnieszka Raczek
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

const minIdSearchLength = 2;

/**
 * @param {string} id
 * @param {string} filter
 * @returns {boolean}
 */
export default function matchIdFilter(id, filter) {
  if (!filter || filter.length < minIdSearchLength) {
    return false;
  }
  return id.toLowerCase().startsWith(filter.toLowerCase());
}
