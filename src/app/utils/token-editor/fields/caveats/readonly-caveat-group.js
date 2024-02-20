/**
 * Readonly caveat fields of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { and, equal, raw } from 'ember-awesome-macros';
import StaticTextField from 'onedata-gui-common/utils/form-component/static-text-field';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import { caveatCustomFieldCommonExtension, createCaveatGroup } from './common';

const ReadonlyEnabledTextField = StaticTextField.extend({
  ...caveatCustomFieldCommonExtension,

  /**
   * @override
   */
  name: 'readonlyEnabledText',

  /**
   * @override
   */
  isVisible: and('parent.isCaveatEnabled', 'isInEditMode'),
});

const ReadonlyEnabledToggleField = ToggleField.extend({
  ...caveatCustomFieldCommonExtension,

  /**
   * @override
   */
  name: 'readonlyView',

  /**
   * @override
   */
  isValueless: true,

  /**
   * @override
   */
  isVisible: and('parent.isCaveatEnabled', 'isInViewMode'),

  /**
   * @override
   */
  value: reads('parent.isCaveatEnabled'),
});

export const ReadonlyCaveatGroup = createCaveatGroup('readonly', {
  isApplicable: equal('valuesSource.basic.type', raw('access')),
}, [ReadonlyEnabledTextField, ReadonlyEnabledToggleField]);
