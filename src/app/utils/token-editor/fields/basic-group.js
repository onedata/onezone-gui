/**
 * Definitions common for all fields of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { NameField } from './basic/name-field';
import { RevokedField } from './basic/revoked-field';
import { TokenStringField } from './basic/token-string-field';
import { TypeField } from './basic/type-field';
import { InviteDetailsGroup } from './basic/invite-details-group';

export const BasicGroup = FormFieldsGroup.extend({
  /**
   * @virtual
   * @type {TokenEditorFieldContext}
   */
  context: undefined,

  /**
   * @override
   */
  name: 'basic',

  /**
   * @virtual
   */
  fields: computed(function fields() {
    return [
      NameField,
      RevokedField,
      TokenStringField,
      TypeField,
      InviteDetailsGroup,
    ].map((caveatsGroupClass) => caveatsGroupClass.create({
      context: this.context,
    }));
  }),
});
