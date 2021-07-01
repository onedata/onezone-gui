/**
 * Edits existing workflow schema. It is a whole view component - may be used for
 * a full page carousel.
 *
 * @module components/content-atm-inventories-workflows/editor-view
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { inject as service } from '@ember/service';
import { get, getProperties, observer, computed, setProperties } from '@ember/object';
import { collect } from '@ember/object/computed';
import { reject } from 'rsvp';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import areWorkflowSchemasEqual from 'onedata-gui-common/utils/workflow-visualiser/are-workflow-schemas-equal';
import { not } from 'ember-awesome-macros';

export default Component.extend(I18n, {
  classNames: ['content-atm-inventories-workflows-editor-view'],

  i18n: service(),
  workflowActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentAtmInventoriesWorkflows.editorView',

  /**
   * @virtual
   * @type {Models.AtmWorkflowSchema}
   */
  atmWorkflowSchema: undefined,

  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  onBackSlide: notImplementedIgnore,

  /**
   * @virtual
   * @type {Boolean}
   */
  onRegisterViewActions: notImplementedIgnore,

  /**
   * Data injected into the visualiser. Initialized by
   * `atmWorkflowSchemaObserver`, updated by modifications.
   * @type {Object}
   */
  visualiserData: undefined,

  /**
   * The same as `visualiserData`, but without modifications.
   * @type {Object}
   */
  unchangedVisualiserData: undefined,

  /**
   * @override
   */
  globalActions: collect('dumpAction'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isVisualiserDataModified: computed(
    'visualiserData',
    'unchangedVisualiserData',
    function isVisualiserDataModified() {
      const {
        visualiserData,
        unchangedVisualiserData,
      } = this.getProperties('visualiserData', 'unchangedVisualiserData');
      return !areWorkflowSchemasEqual(visualiserData, unchangedVisualiserData);
    }
  ),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isSaveBtnDisabled: not('isVisualiserDataModified'),

  /**
   * @type {ComputedProperty<String|undefined>}
   */
  saveBtnTip: computed('isVisualiserDataModified', function isSaveBtnDisabled() {
    if (!this.get('isVisualiserDataModified')) {
      return this.t('noChangesToSave');
    }
  }),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  dumpAction: computed(
    'atmWorkflowSchema',
    'isVisualiserDataModified',
    function dumpAction() {
      const {
        workflowActions,
        atmWorkflowSchema,
        isVisualiserDataModified,
      } = this.getProperties(
        'workflowActions',
        'atmWorkflowSchema',
        'isVisualiserDataModified'
      );
      const action = workflowActions.createDumpAtmWorkflowSchemaAction({
        atmWorkflowSchema,
      });
      setProperties(action, {
        disabled: isVisualiserDataModified,
        tip: isVisualiserDataModified ? this.t('cannotDumpModified') : undefined,
      });
      return action;
    }
  ),

  atmWorkflowSchemaObserver: observer(
    'atmWorkflowSchema',
    function atmWorkflowSchemaObserver() {
      const atmWorkflowSchema = this.get('atmWorkflowSchema');
      if (!atmWorkflowSchema) {
        return;
      }

      const {
        lanes = [],
          stores = [],
      } = getProperties(atmWorkflowSchema, 'lanes', 'stores');
      const data = {
        lanes,
        stores,
      };
      this.setProperties({
        visualiserData: data,
        unchangedVisualiserData: data,
      });
    }
  ),

  globalActionsObserver: observer('globalActions.[]', function globalActionsObserver() {
    this.registerViewActions();
  }),

  init() {
    this._super(...arguments);
    this.atmWorkflowSchemaObserver();
    this.globalActionsObserver();
  },

  registerViewActions() {
    const {
      onRegisterViewActions,
      globalActions,
    } = this.getProperties('onRegisterViewActions', 'globalActions');

    onRegisterViewActions(globalActions);
  },

  actions: {
    backSlide() {
      this.get('onBackSlide')();
    },
    async changeName(newName) {
      const {
        workflowActions,
        atmWorkflowSchema,
      } = this.getProperties('workflowActions', 'atmWorkflowSchema');

      if (!newName) {
        return reject();
      }
      if (!get(atmWorkflowSchema, 'name') === newName) {
        return;
      }

      const action = workflowActions.createModifyAtmWorkflowSchemaAction({
        atmWorkflowSchema,
        atmWorkflowSchemaDiff: {
          name: newName,
        },
      });
      const result = await action.execute();
      const {
        status,
        error,
      } = getProperties(result, 'status', 'error');
      if (status == 'failed') {
        throw error;
      }
    },
    visualiserDataChange(newVisualiserData) {
      this.set('visualiserData', newVisualiserData);
    },
    async save() {
      const {
        workflowActions,
        atmWorkflowSchema,
        visualiserData,
      } = this.getProperties(
        'workflowActions',
        'atmWorkflowSchema',
        'visualiserData'
      );

      const action = workflowActions.createModifyAtmWorkflowSchemaAction({
        atmWorkflowSchema,
        atmWorkflowSchemaDiff: visualiserData,
      });
      const result = await action.execute();
      const {
        status,
        error,
      } = getProperties(result, 'status', 'error');
      if (status === 'failed') {
        throw error;
      } else if (status === 'done') {
        // reload modification state
        safeExec(this, 'atmWorkflowSchemaObserver');
      }
    },
  },
});
