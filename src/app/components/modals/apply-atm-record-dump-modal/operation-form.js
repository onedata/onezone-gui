/**
 * Allows to choose the way in which dump will be applied.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { computed, get, getProperties } from '@ember/object';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import {
  tag,
  eq,
  raw,
  not,
  and,
  bool,
  getBy,
} from 'ember-awesome-macros';
import getNextFreeRevisionNumber from 'onedata-gui-common/utils/revisions/get-next-free-revision-number';

export default Component.extend(I18n, {
  tagName: 'form',
  classNames: ['operation-form', 'form-component', 'form-horizontal'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.applyAtmRecordDumpModal.operationForm',

  /**
   * @virtual
   * @type {DumpableAtmModelName}
   */
  atmModelName: undefined,

  /**
   * @virtual
   * @type {Object}
   */
  dump: undefined,

  /**
   * @virtual
   * @type {'upload'|'duplication'}
   */
  dumpSourceType: undefined,

  /**
   * @virtual
   * @type {'merge'|'create'}
   */
  selectedOperation: undefined,

  /**
   * @virtual
   * @type {Array<DumpableAtmModel>}
   */
  targetAtmRecords: undefined,

  /**
   * @virtual
   * @type {DumpableAtmModel}
   */
  selectedTargetAtmRecord: undefined,

  /**
   * @virtual
   * @type {String}
   */
  newAtmRecordName: undefined,

  /**
   * @virtual
   * @type {(fieldName: string, value: any) => void}
   */
  onValueChange: undefined,

  /**
   * @virtual
   * @type {Boolean}
   */
  isDisabled: false,

  /**
   * @type {ComputedProperty<RevisionNumber>}
   */
  revisionNumber: reads('dump.revision.originalRevisionNumber'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isMergeDisabled: not('targetAtmRecords.length'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isRevisionConflictWarningVisible: and(
    eq('selectedOperation', raw('merge')),
    bool(getBy('selectedTargetAtmRecord.revisionRegistry', 'revisionNumber'))
  ),

  /**
   * @type {ComputedProperty<RevisionNumber>}
   */
  nextFreeRevisionNumber: computed(
    'selectedTargetAtmRecord.revisionRegistry',
    function nextFreeRevisionNumber() {
      return getNextFreeRevisionNumber(
        Object.keys(this.get('selectedTargetAtmRecord.revisionRegistry') || {})
      );
    }
  ),

  /**
   * @type {ComputedProperty<Array<Object>>}
   */
  operationsRadioOptions: computed(
    'atmModelName',
    'isMergeDisabled',
    function operationsRadioOptions() {
      return [{
        name: 'merge',
        value: 'merge',
        label: this.t(`operations.merge.label.${this.atmModelName}`),
        disabled: this.isMergeDisabled,
      }, {
        name: 'create',
        value: 'create',
        label: this.t(`operations.create.label.${this.atmModelName}`),
      }];
    }
  ),

  /**
   * @type {ComputedProperty<Object>}
   */
  formValues: computed(
    'selectedTargetAtmRecord',
    'newAtmRecordName',
    function formValues() {
      return {
        targetAtmRecord: this.selectedTargetAtmRecord,
        newAtmRecordName: this.newAtmRecordName,
      };
    }
  ),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed(function fields() {
    const component = this;
    return FormFieldsRootGroup
      .extend({
        i18nPrefix: tag`${'component.i18nPrefix'}.fields.${'component.atmModelName'}`,
        valuesSource: reads('component.formValues'),
        onValueChange(value, field) {
          field.markAsModified();
          const {
            notifyChangeName,
            name,
          } = getProperties(field, 'notifyChangeName', 'name');
          component.notifyAboutChange(notifyChangeName || name, value);
        },
        isEnabled: not('component.isDisabled'),
      })
      .create({
        component,
        ownerSource: this,
        fields: [
          this.targetAtmRecordField,
          this.newAtmRecordNameField,
        ],
      });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.DropdownField>}
   */
  targetAtmRecordField: computed(function targetAtmRecordField() {
    return DropdownField.extend({
      options: computed('component.targetAtmRecords', function options() {
        const atmRecords = this.get('component.targetAtmRecords') || [];
        return atmRecords.map((record) => ({
          label: get(record, 'name') || get(record, 'latestRevision.name'),
          value: record,
        })).sortBy('label');
      }),
      isEnabled: eq('component.selectedOperation', raw('merge')),
    }).create({
      component: this,
      name: 'targetAtmRecord',
      notifyChangeName: 'selectedTargetAtmRecord',
      classes: 'form-group-sm',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.TextField>}
   */
  newAtmRecordNameField: computed(function newAtmRecordNameField() {
    return TextField.extend({
      isEnabled: eq('component.selectedOperation', raw('create')),
    }).create({
      component: this,
      name: 'newAtmRecordName',
      classes: 'form-group-sm',
    });
  }),

  init() {
    this._super(...arguments);
    this.fields;
  },

  /**
   * @override
   */
  submit(event) {
    this._super(...arguments);
    event.preventDefault();
  },

  notifyAboutChange(fieldName, newValue) {
    this.onValueChange?.(fieldName, newValue);
  },

  actions: {
    selectedOperationChange(newOperation) {
      this.notifyAboutChange('selectedOperation', newOperation);
    },
  },
});
