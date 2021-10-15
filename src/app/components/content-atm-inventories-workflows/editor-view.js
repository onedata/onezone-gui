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

/**
 * @typedef {Object} WorkflowEditorViewModificationState
 * @property {Boolean} isModified
 * @property {Function} [executeSaveAction] available when `isModified` is `true`
 */

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
   * @type {Number}
   */
  revisionNumber: undefined,

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
   * @type {Function}
   */
  onRegisterViewActions: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   * @param {Object}
   */
  onModificationStateChange: notImplementedIgnore,

  /**
   * Data injected into the visualiser. Initialized by
   * `atmWorkflowSchemaRevisionObserver`, updated by modifications.
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
   * @type {ComputedProperty<WorkflowEditorViewModificationState>}
   */
  modificationState: computed(
    'isVisualiserDataModified',
    function modificationState() {
      const isVisualiserDataModified = this.get('isVisualiserDataModified');
      const state = {
        isModified: isVisualiserDataModified,
      };
      if (isVisualiserDataModified) {
        state.executeSaveAction = async () => await this.save();
      }
      return state;
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
      const action = workflowActions.createDumpAtmWorkflowSchemaRevisionAction({
        atmWorkflowSchema,
        // TODO: VFS-8255 pass revision
        // revisionNumber: ...
      });
      setProperties(action, {
        disabled: isVisualiserDataModified,
        tip: isVisualiserDataModified ? this.t('cannotDumpModified') : undefined,
      });
      return action;
    }
  ),

  atmWorkflowSchemaRevisionObserver: observer(
    'atmWorkflowSchema',
    'revisionNumber',
    function atmWorkflowSchemaRevisionObserver() {
      const {
        atmWorkflowSchema,
        revisionNumber,
      } = this.getProperties('atmWorkflowSchema', 'revisionNumber');
      if (!atmWorkflowSchema || typeof revisionNumber !== 'number') {
        return;
      }

      const revision = get(atmWorkflowSchema, `revisionRegistry.${revisionNumber}`);
      const {
        lanes = [],
          stores = [],
      } = getProperties(revision || {}, 'lanes', 'stores');
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

  modificationStateNotifier: observer(
    'onModificationStateChange',
    'modificationState',
    function modificationStateNotifier() {
      const {
        onModificationStateChange,
        modificationState,
      } = this.getProperties('onModificationStateChange', 'modificationState');

      onModificationStateChange && onModificationStateChange(modificationState);
    }
  ),

  init() {
    this._super(...arguments);
    this.atmWorkflowSchemaRevisionObserver();
    this.globalActionsObserver();
    this.modificationStateNotifier();
  },

  willDestroyElement() {
    try {
      this.registerViewActions(true);
    } finally {
      this._super(...arguments);
    }
  },

  registerViewActions(clear = false) {
    const {
      onRegisterViewActions,
      globalActions,
    } = this.getProperties('onRegisterViewActions', 'globalActions');

    onRegisterViewActions(clear ? [] : globalActions);
  },

  async save() {
    const {
      workflowActions,
      atmWorkflowSchema,
      revisionNumber,
      visualiserData,
    } = this.getProperties(
      'workflowActions',
      'atmWorkflowSchema',
      'revisionNumber',
      'visualiserData'
    );

    const action = workflowActions.createModifyAtmWorkflowSchemaRevisionAction({
      atmWorkflowSchema,
      revisionNumber,
      revisionDiff: visualiserData,
    });
    action.addExecuteHook(result => {
      if (
        result &&
        get(result, 'status') === 'done' &&
        atmWorkflowSchema === this.get('atmWorkflowSchema') &&
        revisionNumber === this.get('revisionNumber')
      ) {
        // reload modification state
        safeExec(this, 'atmWorkflowSchemaRevisionObserver');
      }
    });

    return await action.execute();
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
      return await this.save();
    },
  },
});
