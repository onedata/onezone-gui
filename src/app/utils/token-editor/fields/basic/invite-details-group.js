/**
 * Invite details fields of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { raw, equal } from 'ember-awesome-macros';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { InviteTypeField } from './invite-type-field';
import { InviteTargetDetailsGroup } from './invite-target-details-group';
import { UsageLimitGroup } from './usage-limit-group';
import { UsageCountField } from './usage-count-field';

export const InviteDetailsGroup = FormFieldsGroup.extend({
  /**
   * @virtual
   * @type {TokenEditorFieldContext}
   */
  context: undefined,

  /**
   * @override
   */
  name: 'inviteDetails',

  /**
   * @override
   */
  isVisible: equal('valuesSource.basic.type', raw('invite')),

  /**
   * @override
   */
  fields: computed(function fields() {
    return [
      InviteTypeField,
      InviteTargetDetailsGroup,
      UsageLimitGroup,
      UsageCountField,
    ].map((FieldClass) => FieldClass.create({ context: this.context }));
  }),
});
