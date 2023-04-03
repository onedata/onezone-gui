/**
 * Generates atm workflow schema empty revision.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default function createEmptyRevision() {
  return {
    state: 'draft',
    description: '',
    lanes: [],
    stores: [],
  };
}
