/**
 * Token string field of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import ClipboardField from 'onedata-gui-common/utils/form-component/clipboard-field';

export const TokenStringField = ClipboardField.extend({
  /**
   * @override
   */
  name: 'tokenString',

  /**
   * @override
   */
  type: 'textarea',

  /**
   * @override
   */
  defaultValue: '',

  /**
   * @override
   */
  isVisible: reads('isInViewMode'),
});
