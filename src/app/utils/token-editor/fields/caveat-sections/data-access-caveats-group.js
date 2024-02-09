/**
 * Data access caveats section of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { CaveatsSectionGroup } from './common';
import { ReadonlyCaveatGroup } from '../caveats/readonly-caveat-group';
import { PathCaveatGroup } from '../caveats/path-caveat-group';
import { ObjectIdCaveatGroup } from '../caveats/object-id-caveat-group';

export const DataAccessCaveatsGroup = CaveatsSectionGroup.extend({
  /**
   * @override
   */
  name: 'dataAccessCaveats',

  /**
   * @override
   */
  fields: computed(function fields() {
    return [
      ReadonlyCaveatGroup,
      PathCaveatGroup,
      ObjectIdCaveatGroup,
    ].map((caveatGroupClass) => caveatGroupClass.create({ context: this.context }));
  }),
});
