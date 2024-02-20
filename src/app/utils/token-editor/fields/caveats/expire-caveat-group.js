/**
 * Expire caveat fields of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import moment from 'moment';
import DatetimeField from 'onedata-gui-common/utils/form-component/datetime-field';
import { caveatCustomFieldCommonExtension, createCaveatGroup } from './common';

const ExpireField = DatetimeField.extend({
  ...caveatCustomFieldCommonExtension,

  /**
   * @override
   */
  name: 'expire',

  /**
   * @override
   */
  defaultValue: moment().add(1, 'day').endOf('day').toDate(),
});

export const ExpireCaveatGroup = createCaveatGroup('expire', {}, [ExpireField]);
