/**
 * Clipboard field with secret access key of the tokens editor.
 *
 * @author Agnieszka Raczek
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import ClipboardSecretField from 'onedata-gui-common/utils/form-component/clipboard-secret-field';
import { computed } from '@ember/object';
import md5 from 'md5';

export const SecretAccessKeyField = ClipboardSecretField.extend({
  /**
   * @override
   */
  name: 'secretAccessKey',

  /**
   * @override
   */
  textareaRows: 1,

  tokenString: reads('parent.parent.value.basic.tokenString'),

  /**
   * @override
   */
  value: computed('tokenString', 'mode', function value() {
    if (this.isInViewMode && this.tokenString) {
      return md5('s3-' + this.tokenString);
    }
    return '';
  }),

  /**
   * @override
   */
  isVisible: reads('isInViewMode'),
});
