/**
 * Endpoint caveats section of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { CaveatsSectionGroup } from './common';
import { ConsumerCaveatGroup } from '../caveats/consumer-caveat-group';
import { ServiceCaveatGroup } from '../caveats/service-caveat-group';
import { InterfaceCaveatGroup } from '../caveats/interface-caveat-group';

export const EndpointCaveatsGroup = CaveatsSectionGroup.extend({
  /**
   * @override
   */
  name: 'endpointCaveats',

  /**
   * @override
   */
  fields: computed(function fields() {
    return [
      ConsumerCaveatGroup,
      ServiceCaveatGroup,
      InterfaceCaveatGroup,
    ].map((caveatGroupClass) => caveatGroupClass.create({ context: this.context }));
  }),
});
