/**
 * Token type field of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import RadioField from 'onedata-gui-common/utils/form-component/radio-field';

export const TypeField = RadioField.extend({
  /**
   * @override
   */
  name: 'type',

  /**
   * @override
   */
  options: Object.freeze([
    { value: 'access' },
    { value: 'identity' },
    { value: 'invite' },
  ]),

  /**
   * @override
   */
  defaultValue: 'access',
});
