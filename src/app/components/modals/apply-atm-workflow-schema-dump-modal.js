/**
 * A modal that allows to upload/duplicate workflow schema revision into specific
 * workflow.
 *
 * @module components/modals/apply-atm-workflow-schema-dump
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { computed, observer, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { promise } from 'ember-awesome-macros';
import { scheduleOnce } from '@ember/runloop';

/**
 * @typedef {Object} AtmWorkflowSchemaDumpSource
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
  i18nPrefix: 'components.modals.applyAtmWorkflowSchemaDumpModal',

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
   * Set by `reinitializeTargetWorkflows`
   * @type {Array<Models.AtmWorkflowSchema>}
   */
  targetWorkflows: undefined,

  /**
   * @type {Models.AtmWorkflowSchema}
   */
  selectedTargetWorkflow: undefined,

  /**
   * @type {String}
   */
  newWorkflowName: '',

  /**
   * @type {Boolean}
   */
  isSubmitting: false,

  /**
   * @type {ComputedProperty<'upload'|'duplication'>}
   */
  dumpSourceType: reads('modalOptions.dumpSourceType'),

  /**
   * @type {ComputedProperty<Model.AtmInventory>}
   */
  initialAtmInventory: reads('modalOptions.initialAtmInventory'),

  /**
   * @type {ComputedProperty<ObjectProxy<AtmWorkflowSchemaDumpSource>>}
   */
  dumpSourceProxy: reads('modalOptions.dumpSourceProxy'),

  /**
   * @type {AtmWorkflowSchemaDumpSource}
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
      const {
        dumpSourceType,
        initialAtmInventory,
      } = this.getProperties('dumpSourceType', 'initialAtmInventory');
      if (dumpSourceType === 'upload') {
        // In "upload" mode only one inventory is allowed, because you upload
        // dump always in some concrete inventory, not globally
        return [initialAtmInventory];
      }

      return get(
        await this.get('recordManager').getUserRecordList('atmInventory'),
        'list'
      );
    })),

  /**
   * @type {ComputedProperty<PromiseArray<Models.AtmWorkflowSchema>>}
   */
  atmWorkflowSchemasProxy: promise.array(
    computed('selectedTargetAtmInventory', async function atmWorkflowSchemasProxy() {
      const selectedTargetAtmInventory = this.get('selectedTargetAtmInventory');
      if (!selectedTargetAtmInventory) {
        throw { id: 'notFound' };
      }
      const atmWorkflowSchemaList =
        await get(selectedTargetAtmInventory, 'atmWorkflowSchemaList');
      return await get(atmWorkflowSchemaList, 'list');
    })
  ),

  /**
   * @type {ComputedProperty<Object|null>}
   */
  dataToSubmit: computed(
    'dump',
    'selectedTargetAtmInventory',
    'selectedOperation',
    'selectedTargetWorkflow',
    'newWorkflowName',
    function dataToSubmit() {
      const {
        dump,
        selectedTargetAtmInventory,
        selectedOperation,
        selectedTargetWorkflow,
        newWorkflowName,
      } = this.getProperties(
        'dump',
        'selectedTargetAtmInventory',
        'selectedOperation',
        'selectedTargetWorkflow',
        'newWorkflowName'
      );
      if (!dump) {
        return null;
      }

      const data = {
        atmInventory: selectedTargetAtmInventory,
        operation: selectedOperation,
        atmWorkflowSchemaDump: dump,
      };
      switch (selectedOperation) {
        case 'merge':
          if (!selectedTargetWorkflow) {
            return null;
          }
          data.targetAtmWorkflowSchema = selectedTargetWorkflow;
          break;
        case 'create':
          if (!newWorkflowName) {
            return null;
          }
          data.newAtmWorkflowSchemaName = newWorkflowName;
          break;
        default:
          return null;
      }
      return data;
    }
  ),

  atmWorkflowSchemasObserver: observer(
    'atmWorkflowSchemasProxy.@each.{name,originalAtmWorkflowSchemaId}',
    function atmWorkflowSchemasObserver() {
      scheduleOnce('afterRender', this, 'reinitializeTargetWorkflows');
    }
  ),

  dumpObserver: observer('dump', function dumpObserver() {
    scheduleOnce('afterRender', this, 'reinitializeNewWorkflowName');
    scheduleOnce('afterRender', this, 'reinitializeTargetWorkflows');
  }),

  init() {
    this._super(...arguments);
    this.set('selectedTargetAtmInventory', this.get('initialAtmInventory'));
    this.dumpObserver();
  },

  async reinitializeTargetWorkflows() {
    let atmWorkflowSchemas;
    try {
      atmWorkflowSchemas = await this.get('atmWorkflowSchemasProxy');
    } catch (e) {
      atmWorkflowSchemas = [];
    }

    if (this.get('isDestroyed')) {
      return;
    }

    const {
      dump,
      selectedOperation: prevSelectedOperation,
      selectedTargetWorkflow: prevSelectedTargetWorkflow,
    } = this.getProperties(
      'dump',
      'selectedOperation',
      'selectedTargetWorkflow',
    );
    const originalSchemaId = dump && get(dump, 'originalAtmWorkflowSchemaId');
    const targetWorkflows = originalSchemaId ?
      atmWorkflowSchemas.filterBy('originalAtmWorkflowSchemaId', originalSchemaId) : [];
    let selectedOperation = undefined;
    if (dump) {
      selectedOperation = targetWorkflows.length ? (prevSelectedOperation || 'merge') : 'create';
    }
    const selectedTargetWorkflow =
      targetWorkflows.includes(prevSelectedTargetWorkflow) ?
      prevSelectedTargetWorkflow : targetWorkflows.sortBy('name')[0];
    this.setProperties({
      targetWorkflows,
      selectedOperation,
      selectedTargetWorkflow,
    });
  },

  reinitializeNewWorkflowName() {
    const nameFromDump = this.get('dump.name');
    if (nameFromDump) {
      this.set('newWorkflowName', nameFromDump);
    }
  },

  actions: {
    targetAtmInventoryChanged(atmInventory) {
      this.set('selectedTargetAtmInventory', atmInventory);
    },
    operationValueChanged(fieldName, value) {
      if (
        ['selectedOperation', 'newWorkflowName', 'selectedTargetWorkflow']
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
