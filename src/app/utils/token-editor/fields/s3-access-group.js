/**
 * Form group of tokens editor containing all s3 access fields.
 *
 * @author Agnieszka Raczek
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { AccessKeyIdField } from './s3-access/access-key-id-field';
import { SecretAccessKeyField } from './s3-access/secret-access-key-field';

export const S3AccessGroup = FormFieldsGroup.extend({
  /**
   * @virtual
   * @type {TokenEditorFieldContext}
   */
  context: undefined,

  /**
   * @override
   */
  name: 's3Access',

  /**
   * @virtual
   */
  fields: computed(function fields() {
    return [
      AccessKeyIdField,
      SecretAccessKeyField,
    ].map((caveatsGroupClass) => caveatsGroupClass.create({ context: this.context }));
  }),
});
