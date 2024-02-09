/**
 * Geographical caveats section of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { CaveatsSectionGroup } from './common';
import { RegionCaveatGroup } from '../caveats/region-caveat-group';
import { CountryCaveatGroup } from '../caveats/country-caveat-group';

export const GeoCaveatsGroup = CaveatsSectionGroup.extend({
  /**
   * @override
   */
  name: 'geoCaveats',

  /**
   * @override
   */
  fields: computed(function fields() {
    return [
      RegionCaveatGroup,
      CountryCaveatGroup,
    ].map((caveatGroupClass) => caveatGroupClass.create({ context: this.context }));
  }),
});
