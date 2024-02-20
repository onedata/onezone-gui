/**
 * Path caveat fields of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import { observer, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { equal, raw, and, not } from 'ember-awesome-macros';
import { resolve } from 'rsvp';
import FormFieldsCollectionGroup from 'onedata-gui-common/utils/form-component/form-fields-collection-group';
import recordIcon from 'onedata-gui-common/utils/record-icon';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import SiblingLoadingField from 'onedata-gui-common/utils/form-component/sibling-loading-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import RecordOptionsArrayProxy from 'onedata-gui-common/utils/record-options-array-proxy';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { caveatCustomFieldCommonExtension, createCaveatGroup } from './common';

const LoadingPathSpacesField = SiblingLoadingField.extend({
  ...caveatCustomFieldCommonExtension,

  /**
   * @override
   */
  name: 'loadingPathSpaces',

  /**
   * @override
   */
  addColonToLabel: false,

  /**
   * @override
   */
  siblingName: 'path',

  /**
   * @override
   */
  loadingProxy: reads('parent.spacesProxy'),

  /**
   * @override
   */
  isVisible: and('parent.isCaveatEnabled', not('isFulfilled')),
});

const PathSpaceField = DropdownField.extend({
  /**
   * @override
   */
  name: 'pathSpace',

  /**
   * @override
   */
  areValidationClassesEnabled: false,

  /**
   * @override
   */
  options: reads('parent.parent.spaces'),

  /**
   * @override
   */
  defaultValue: reads('options.firstObject.value'),
});

const PathStringField = TextField.extend({
  /**
   * @override
   */
  name: 'pathString',

  /**
   * @override
   */
  defaultValue: '',

  /**
   * @override
   */
  isOptional: true,

  /**
   * @override
   */
  regex: /^(\/[^/]+)*\/?$/,
});

const PathField = FormFieldsCollectionGroup.extend({
  ...caveatCustomFieldCommonExtension,

  /**
   * @override
   */
  name: 'path',

  /**
   * @override
   */
  isVisible: and(
    'parent.isCaveatEnabled',
    'parent.spacesProxy.isFulfilled'
  ),

  /**
   * @type {PromiseArray<FieldOption> | undefined}
   */
  spaces: reads('parent.spacesProxy.content'),

  /**
   * @override
   */
  fieldFactoryMethod(uniqueFieldValueName) {
    const nestedFieldMode = this.mode !== 'view' ? 'edit' : 'view';
    return FormFieldsGroup.create({
      name: 'pathEntry',
      valueName: uniqueFieldValueName,
      areValidationClassesEnabled: true,
      fields: [
        PathSpaceField.create({
          mode: nestedFieldMode,
        }),
        PathStringField.create({
          mode: nestedFieldMode,
        }),
      ],
    });
  },
});

export const PathCaveatGroup = createCaveatGroup('path', {
  recordManager: service(),

  /**
   * @type {'view' | 'edit' | undefined}
   */
  spacesProxyIsForMode: undefined,

  /**
   * @type {PromiseArray<FieldOption> | undefined}
   */
  spacesProxy: undefined,

  /**
   * @override
   */
  isApplicable: equal('valuesSource.basic.type', raw('access')),

  spacesProxySetter: observer(
    'isCaveatEnabled',
    'isInViewMode',
    'value',
    function spacesProxySetter() {
      if (!this.isCaveatEnabled) {
        return;
      }

      if (this.isInViewMode) {
        const spaceEntries = this.value?.path ?
          Object.keys(this.value.path).without('__fieldsValueNames')
          .map(key => {
            const record = this.value.path[key]?.pathSpace ?? {};
            return {
              value: record,
              label: get(record, 'name') || `ID: ${get(record, 'entityId')}`,
              icon: recordIcon(record),
            };
          }) : [];
        this.setProperties({
          spacesProxy: PromiseArray.create({
            promise: resolve(spaceEntries),
          }),
          spacesProxyIsForMode: 'view',
        });
      } else if (!this.spacesProxy || this.spacesProxyIsForMode === 'view') {
        this.setProperties({
          spacesProxy: PromiseArray.create({
            promise: this.recordManager.getUserRecordList('space')
              .then((recordsList) => get(recordsList, 'list'))
              .then((records) => RecordOptionsArrayProxy.create({ records })),
          }),
          spacesProxyIsForMode: 'edit',
        });
      }
    }
  ),

  init() {
    this._super(...arguments);
    this.spacesProxySetter();
  },
}, [LoadingPathSpacesField, PathField]);
