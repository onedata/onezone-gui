/**
 * Network caveats section of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { CaveatsSectionGroup } from './common';
import { IpCaveatGroup } from '../caveats/ip-caveat-group';
import { AsnCaveatGroup } from '../caveats/asn-caveat-group';

export const NetworkCaveatsGroup = CaveatsSectionGroup.extend({
  /**
   * @override
   */
  name: 'networkCaveats',

  /**
   * @override
   */
  fields: computed(function fields() {
    return [
      AsnCaveatGroup,
      IpCaveatGroup,
    ].map((caveatGroupClass) => caveatGroupClass.create({ context: this.context }));
  }),
});
