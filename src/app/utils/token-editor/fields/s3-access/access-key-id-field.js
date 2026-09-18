/**
 * Clipboard field with access key ID of the tokens editor.
 *
 * @author Agnieszka Raczek
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import ClipboardField from 'onedata-gui-common/utils/form-component/clipboard-field';
import { computed } from '@ember/object';

export const AccessKeyIdField = ClipboardField.extend({
  /**
   * @override
   */
  name: 'accessKeyId',

  /**
   * @override
   */
  type: 'textarea',

  tokenString: reads('parent.parent.value.basic.tokenString'),

  /**
   * @override
   */
  value: computed('tokenString', 'mode', function value() {
    return this.isInViewMode ? this.tokenString : '';
  }),

  /**
   * @override
   */
  isVisible: reads('isInViewMode'),
});
