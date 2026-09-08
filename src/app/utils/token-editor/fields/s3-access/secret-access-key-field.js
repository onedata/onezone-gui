/**
 * Clipboard field with secret access key of the tokens editor.
 *
 * @author Agnieszka Raczek
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import ClipboardField from 'onedata-gui-common/utils/form-component/clipboard-field';
import { computed } from '@ember/object';
import md5 from 'md5';

export const SecretAccessKeyField = ClipboardField.extend({
  /**
   * @override
   */
  name: 'secretAccessKey',

  /**
   * @override
   */
  type: 'textarea',

  /**
   * @override
   */
  textareaRows: 1,

  tokenString: reads('parent.parent.value.basic.tokenString'),

  /**
   * @override
   */
  value: computed('tokenString', 'mode', function value() {
    if (this.mode === 'view' && this.tokenString) {
      return md5('s3-' + this.tokenString);
    }
    return '';
  }),

  /**
   * @override
   */
  isVisible: reads('isInViewMode'),
});
