/**
 * Invite type field of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import { tokenInviteTypeOptions } from './common';

export const InviteTypeField = DropdownField.extend({
  /**
   * @override
   */
  name: 'inviteType',

  /**
   * @override
   */
  showSearch: false,

  /**
   * @override
   */
  defaultValue: tokenInviteTypeOptions[0].value,

  /**
   * @override
   */
  classes: computed('value', function classes() {
    const targetModelName = tokenInviteTypeOptions
      .find(({ value }) => value === this.value)?.targetModelName;
    return targetModelName ? 'needs-target-model' : '';
  }),

  /**
   * @override
   */
  options: computed('isInEditMode', function options() {
    return this.isInEditMode ?
      tokenInviteTypeOptions :
      tokenInviteTypeOptions.map((option) => ({ ...option, icon: undefined }));
  }),
});
