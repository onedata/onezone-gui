/**
 * Definitions common for all caveat section fields of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { not, and, equal, raw, conditional } from 'ember-awesome-macros';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';

export const CaveatsSectionGroup = FormFieldsGroup.extend({
  /**
   * @virtual
   * @type {TokenEditorFieldContext}
   */
  context: undefined,

  /**
   * @override
   */
  classes: conditional('hasTopSeparator', raw('has-top-separator'), raw('')),

  /**
   * @override
   */
  isVisible: reads('hasVisibleCaveats'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  hasVisibleCaveats: computed(
    'fields.@each.isVisible',
    function hasVisibleCaveats() {
      return this.fields.any((field) => field.isVisible);
    }
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  hasTopSeparator: and(
    'hasVisibleCaveats',
    not(equal('name', 'parent.firstGroupWithVisibleCaveatName'))
  ),
});
