/**
 * Usage count field of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import StaticTextField from 'onedata-gui-common/utils/form-component/static-text-field';

export const UsageCountField = StaticTextField.extend({
  /**
   * @override
   */
  name: 'usageCount',

  /**
   * @override
   */
  isVisible: reads('isInViewMode'),
});
