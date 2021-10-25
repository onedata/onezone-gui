import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { computed, observer, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { promise } from 'ember-awesome-macros';
import { scheduleOnce } from '@ember/runloop';

/**
 * @typedef {Object} AtmWorkflowSchemaUploadedFile
 * @property {String} name
 * @property {any} content
 */

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.uploadAtmWorkflowSchemaModal',

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
   * @type {AtmWorkflowSchemaUploadedFile}
   */
  uploadedFile: undefined,

  /**
   * @type {'merge'|'create'}
   */
  selectedOperation: undefined,

  /**
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
   * @type {ComputedProperty<Model.AtmInventory>}
   */
  atmInventory: reads('modalOptions.atmInventory'),

  /**
   * @type {ComputedProperty<Object>}
   */
  dump: reads('uploadedFile.content'),

  /**
   * @type {ComputedProperty<PromiseArray<Models.AtmWorkflowSchema>>}
   */
  atmWorkflowSchemasProxy: promise.array(
    computed('atmInventory', async function atmWorkflowSchemasProxy() {
      const atmInventory = this.get('atmInventory');
      if (!atmInventory) {
        throw { id: 'notFound' };
      }
      const atmWorkflowSchemaList = await get(atmInventory, 'atmWorkflowSchemaList');
      return await get(atmWorkflowSchemaList, 'list');
    })
  ),

  /**
   * @type {ComputedProperty<Object|null>}
   */
  dataToSubmit: computed(
    'dump',
    'selectedOperation',
    'selectedTargetWorkflow',
    'newWorkflowName',
    function dataToSubmit() {
      const {
        dump,
        selectedOperation,
        selectedTargetWorkflow,
        newWorkflowName,
      } = this.getProperties(
        'dump',
        'selectedOperation',
        'selectedTargetWorkflow',
        'newWorkflowName'
      );
      if (!dump) {
        return null;
      }

      const data = {
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

  async reinitializeTargetWorkflows() {
    let atmWorkflowSchemas;
    try {
      atmWorkflowSchemas = await this.get('atmWorkflowSchemasProxy');
    } catch (e) {
      atmWorkflowSchemas = [];
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
    uploadedFileChanged(uploadedFile) {
      this.set('uploadedFile', uploadedFile);
    },
    operationValueChanged(fieldName, value) {
      this.set(fieldName, value);
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
