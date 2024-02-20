/**
 * Time caveats section of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { CaveatsSectionGroup } from './common';
import { ExpireCaveatGroup } from '../caveats/expire-caveat-group';

export const TimeCaveatsGroup = CaveatsSectionGroup.extend({
  /**
   * @override
   */
  name: 'timeCaveats',

  /**
   * @override
   */
  fields: computed(function fields() {
    return [
      ExpireCaveatGroup.create({ context: this.context }),
    ];
  }),
});
