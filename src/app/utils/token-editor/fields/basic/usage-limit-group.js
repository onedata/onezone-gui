/**
 * Usage limit fields of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { equal, raw } from 'ember-awesome-macros';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import RadioField from 'onedata-gui-common/utils/form-component/radio-field';
import NumberField from 'onedata-gui-common/utils/form-component/number-field';

const UsageLimitTypeField = RadioField.extend({
  /**
   * @override
   */
  name: 'usageLimitType',

  /**
   * @override
   */
  defaultValue: 'infinity',

  /**
   * @override
   */
  options: Object.freeze([{
    value: 'infinity',
  }, {
    value: 'number',
  }]),
});

const UsageLimitNumber = NumberField.extend({
  /**
   * @override
   */
  name: 'usageLimitNumber',

  /**
   * @override
   */
  defaultValue: '',

  /**
   * @override
   */
  gte: 1,

  /**
   * @override
   */
  integer: true,

  /**
   * @override
   */
  isEnabled: equal(
    'valuesSource.basic.inviteDetails.usageLimit.usageLimitType',
    raw('number'),
  ),
});

export const UsageLimitGroup = FormFieldsGroup.extend({
  /**
   * @override
   */
  name: 'usageLimit',

  /**
   * @override
   */
  isVisible: reads('isInEditMode'),

  /**
   * @override
   */
  fields: computed(() => [
    UsageLimitTypeField.create(),
    UsageLimitNumber.create(),
  ]),
});
