/**
 * Calculates next free revision number.
 *
 * @module utils/atm-workflow/get-next-free-revision-number
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import sortRevisionNumbers from 'onezone-gui/utils/atm-workflow/sort-revision-numbers';

export default function getNextFreeRevisionNumber(existingRevisionNumbers) {
  const sortedExistingRevisionNumbers = sortRevisionNumbers(existingRevisionNumbers);
  if (!sortedExistingRevisionNumbers.length) {
    return 1;
  }
  const maxExistingRevisionNumber =
    sortedExistingRevisionNumbers[sortedExistingRevisionNumbers.length - 1];
  return maxExistingRevisionNumber + 1;
}
