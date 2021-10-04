/**
 * Calculates next free revision number.
 *
 * @module utils/atm-workflow/get-next-free-revision-number
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default function getNextFreeRevisionNumber(existingRevisionNumbers) {
  const normalizedExistingRevisionNumbers = (existingRevisionNumbers || [])
    .map(value => parseInt(value))
    .filter(value => value > 0);
  if (!normalizedExistingRevisionNumbers.length) {
    return 1;
  }
  const sortedExistingRevisionNumbers =
    normalizedExistingRevisionNumbers.sort((a, b) => b - a);
  const maxExistingRevisionNumber = sortedExistingRevisionNumbers[0];
  return maxExistingRevisionNumber + 1;
}
