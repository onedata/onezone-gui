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
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { caveatCustomFieldCommonExtension, createCaveatGroup } from './common';
import { Mutex } from 'async-mutex';

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
   * Due to some complicated/buggy code, the `spacesProxySetter` can be invoked multiple
   * times when it is not needed and invoked heavy operation of fetching all spaces. This
   * property holds the last `value` value, which can be compared by observer to prevent
   * multiple invocations.
   *
   * This problem could be fixed by rewriting observers to computed
   * properties, but it needs a lot of work.
   * @type {any}
   */
  spacesProxySetterValue: undefined,

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
          spacesProxy: promiseArray(resolve(spaceEntries)),
          spacesProxyIsForMode: 'view',
        });
      } else if (!this.spacesProxy || this.spacesProxyIsForMode === 'view') {
        if (this.spacesProxySetterValue === this.value) {
          console.warn(
            'PathCaveatGroup: spacesProxySetter tried to fetch spaces more than once for the same value, skipping'
          );
          return;
        }
        this.set('spacesProxySetterValue', this.value);
        const spacesPromise = (async () => {
          const spaceList = await this.recordManager.getUserRecordList('space');
          const list = await spaceList.list;
          return RecordOptionsArrayProxy.create({ records: list });
        })();
        this.setProperties({
          spacesProxy: promiseArray(spacesPromise),
          spacesProxyIsForMode: 'edit',
        });
      }
    }
  ),

  init() {
    this._super(...arguments);
    this.spacesProxySetter();
    this.set('spacesProxyMutex', new Mutex());
  },
}, [LoadingPathSpacesField, PathField]);
