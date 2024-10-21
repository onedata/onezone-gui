/**
 * Form group of tokens editor containing all caveat fields.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { TimeCaveatsGroup } from './caveat-sections/time-caveats-group';
import { GeoCaveatsGroup } from './caveat-sections/geo-caveats-group';
import { NetworkCaveatsGroup } from './caveat-sections/network-caveats-group';
import { EndpointCaveatsGroup } from './caveat-sections/endpoint-caveats-group';
import { DataAccessCaveatsGroup } from './caveat-sections/data-access-caveats-group';

export const CaveatsGroup = FormFieldsGroup.extend({
  /**
   * @virtual
   * @type {TokenEditorFieldContext}
   */
  context: undefined,

  /**
   * @override
   */
  name: 'caveats',

  /**
   * @virtual
   */
  fields: computed(function fields() {
    return [
      TimeCaveatsGroup,
      GeoCaveatsGroup,
      NetworkCaveatsGroup,
      EndpointCaveatsGroup,
      DataAccessCaveatsGroup,
    ].map((caveatsGroupClass) => caveatsGroupClass.create({ context: this.context }));
  }),

  /**
   * @type {ComputedProperty<string | undefined>}
   */
  firstGroupWithVisibleCaveatName: computed(
    'fields.@each.{hasVisibleCaveats,name}',
    function firstGroupWithVisibleCaveatName() {
      return this.fields.find((field) => field.hasVisibleCaveats)?.name;
    }
  ),
});
