/**
 * ObjectId caveat fields of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { equal, raw } from 'ember-awesome-macros';
import FormFieldsCollectionGroup from 'onedata-gui-common/utils/form-component/form-fields-collection-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import { caveatCustomFieldCommonExtension, createCaveatGroup } from './common';

const ObjectIdField = FormFieldsCollectionGroup.extend({
  ...caveatCustomFieldCommonExtension,

  /**
   * @override
   */
  name: 'objectId',

  /**
   * @override
   */
  fieldFactoryMethod(uniqueFieldValueName) {
    return TextField.create({
      name: 'objectIdEntry',
      valueName: uniqueFieldValueName,
      mode: this.mode !== 'view' ? 'edit' : 'view',
    });
  },
});

export const ObjectIdCaveatGroup = createCaveatGroup('objectId', {
  isApplicable: equal('valuesSource.basic.type', raw('access')),
}, [ObjectIdField]);
