/**
 * A modal that allows to upload/duplicate automation record revision.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { computed, observer, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { promise } from 'ember-awesome-macros';
import { scheduleOnce } from '@ember/runloop';
import { classify } from '@ember/string';

/**
 * @typedef {Object} AtmRecordDumpSource
 * @property {String} name
 * @property {any} dump
 */

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),
  recordManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.applyAtmRecordDumpModal',

  /**
   * @virtual
   * @type {String}
   */
  modalId: undefined,

  /**
   * @virtual
   * @type {Object}
   */
  modalOptions: undefined,

  /**
   * @type {Models.AtmInventory}
   */
  selectedTargetAtmInventory: undefined,

  /**
   * @type {'merge'|'create'}
   */
  selectedOperation: undefined,

  /**
   * Set by `reinitializeTargetAtmRecords`
   * @type {Array<DumpableAtmModel>}
   */
  targetAtmRecords: undefined,

  /**
   * @type {DumpableAtmModel}
   */
  selectedTargetAtmRecord: undefined,

  /**
   * @type {String}
   */
  newAtmRecordName: '',

  /**
   * @type {Boolean}
   */
  isSubmitting: false,

  /**
   * @type {ComputedProperty<DumpableAtmModelName>}
   */
  atmModelName: reads('modalOptions.atmModelName'),

  /**
   * @type {ComputedProperty<'upload'|'duplication'>}
   */
  dumpSourceType: reads('modalOptions.dumpSourceType'),

  /**
   * @type {ComputedProperty<Model.AtmInventory>}
   */
  initialAtmInventory: reads('modalOptions.initialAtmInventory'),

  /**
   * @type {ComputedProperty<ObjectProxy<AtmRecordDumpSource>>}
   */
  dumpSourceProxy: reads('modalOptions.dumpSourceProxy'),

  /**
   * @type {AtmRecordDumpSource}
   */
  dumpSource: reads('dumpSourceProxy.content'),

  /**
   * @type {ComputedProperty<() => void>}
   */
  onReupload: reads('modalOptions.onReupload'),

  /**
   * @type {ComputedProperty<Object>}
   */
  dump: reads('dumpSource.dump'),

  /**
   * @type {ComputedProperty<PromiseArray<Models.AtmInventory>>}
   */
  targetAtmInventoriesProxy: promise.array(computed(
    'dumpSourceType',
    'initialAtmInventory',
    async function targetAtmInventoriesProxy() {
      if (this.dumpSourceType === 'upload') {
        // In "upload" mode only one inventory is allowed, because you upload
        // dump always in some concrete inventory, not globally
        return [this.initialAtmInventory];
      }

      return get(
        await this.recordManager.getUserRecordList('atmInventory'),
        'list'
      );
    })),

  /**
   * @type {ComputedProperty<PromiseArray<DumpableAtmModel>>}
   */
  atmRecordsProxy: promise.array(computed(
    'atmModelName',
    'selectedTargetAtmInventory',
    async function atmRecordsProxy() {
      if (!this.selectedTargetAtmInventory) {
        throw { id: 'notFound' };
      }
      const atmRecordsList =
        await get(this.selectedTargetAtmInventory, `${this.atmModelName}List`);
      return await get(atmRecordsList, 'list');
    }
  )),

  /**
   * @type {ComputedProperty<Object|null>}
   */
  dataToSubmit: computed(
    'dump',
    'selectedTargetAtmInventory',
    'selectedOperation',
    'selectedTargetAtmRecord',
    'newAtmRecordName',
    function dataToSubmit() {
      if (!this.dump) {
        return null;
      }

      const data = {
        atmInventory: this.selectedTargetAtmInventory,
        operation: this.selectedOperation,
        atmRecordDump: this.dump,
      };
      switch (this.selectedOperation) {
        case 'merge':
          if (!this.selectedTargetAtmRecord) {
            return null;
          }
          data.targetAtmRecord = this.selectedTargetAtmRecord;
          break;
        case 'create':
          if (!this.newAtmRecordName) {
            return null;
          }
          data.newAtmRecordName = this.newAtmRecordName;
          break;
        default:
          return null;
      }
      return data;
    }
  ),

  atmRecordsObserver: observer(
    'atmRecordsProxy.@each.{name,originalAtmLambdaId,originalAtmWorkflowSchemaId}',
    function atmRecordsObserver() {
      scheduleOnce('afterRender', this, 'reinitializeTargetAtmRecords');
    }
  ),

  dumpObserver: observer('dump', function dumpObserver() {
    scheduleOnce('afterRender', this, 'reinitializeNewAtmRecordName');
    scheduleOnce('afterRender', this, 'reinitializeTargetAtmRecords');
  }),

  init() {
    this._super(...arguments);
    this.set('selectedTargetAtmInventory', this.initialAtmInventory);
    this.dumpObserver();
  },

  async reinitializeTargetAtmRecords() {
    let atmRecords;
    try {
      atmRecords = await this.atmRecordsProxy;
    } catch (e) {
      atmRecords = [];
    }

    if (this.isDestroyed) {
      return;
    }

    const originalIdFieldName = `original${classify(this.atmModelName)}Id`;
    const originalId = this.dump && get(this.dump, originalIdFieldName);
    const targetAtmRecords = originalId ?
      atmRecords.filterBy(originalIdFieldName, originalId) : [];
    let selectedOperation = undefined;
    if (this.dump) {
      selectedOperation = targetAtmRecords.length ?
        (this.selectedOperation || 'merge') : 'create';
    }
    const selectedTargetAtmRecord =
      targetAtmRecords.includes(this.selectedTargetAtmRecord) ?
      this.selectedTargetAtmRecord : targetAtmRecords.sortBy('name')[0];
    this.setProperties({
      targetAtmRecords,
      selectedOperation,
      selectedTargetAtmRecord,
    });
  },

  reinitializeNewAtmRecordName() {
    const nameFromDump = this.atmModelName === 'atmLambda' ?
      this.get('dump.revision.atmLambdaRevision.name') ??
      this.get('dump.revision.atmLambdaRevision._data.name') :
      this.get('dump.name');
    if (nameFromDump) {
      this.set('newAtmRecordName', nameFromDump);
    }
  },

  actions: {
    targetAtmInventoryChanged(atmInventory) {
      this.set('selectedTargetAtmInventory', atmInventory);
    },
    operationValueChanged(fieldName, value) {
      if (
        ['selectedOperation', 'newAtmRecordName', 'selectedTargetAtmRecord']
        .includes(fieldName)
      ) {
        this.set(fieldName, value);
      }
    },
    async submit(submitCallback) {
      const dataToSubmit = this.get('dataToSubmit');
      if (!dataToSubmit) {
        return;
      }
      this.set('isSubmitting', true);
      try {
        await submitCallback(dataToSubmit);
      } finally {
        safeExec(this, () => this.set('isSubmitting', false));
      }
    },
  },
});
