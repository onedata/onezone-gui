/**
 * Interface caveat fields of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { not, equal, raw } from 'ember-awesome-macros';
import RadioField from 'onedata-gui-common/utils/form-component/radio-field';
import { caveatCustomFieldCommonExtension, createCaveatGroup } from './common';

const InterfaceField = RadioField.extend({
  ...caveatCustomFieldCommonExtension,

  /**
   * @override
   */
  name: 'interface',

  /**
   * @override
   */
  defaultValue: 'rest',

  /**
   * @override
   */
  options: Object.freeze([
    { value: 'rest' },
    { value: 'oneclient' },
  ]),
});

export const InterfaceCaveatGroup = createCaveatGroup('interface', {
  isApplicable: not(equal('valuesSource.basic.type', raw('invite'))),
}, [InterfaceField]);
