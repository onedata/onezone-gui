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
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import areWorkflowSchemaRevisionsEqual from 'onedata-gui-common/utils/workflow-visualiser/are-workflow-schema-revisions-equal';
import { not, tag } from 'ember-awesome-macros';

/**
 * @typedef {Object} WorkflowEditorViewModificationState
 * @property {Boolean} isModified
 * @property {Function} [executeSaveAction] available when `isModified` is `true`
 */

export default Component.extend(I18n, {
  classNames: ['content-atm-inventories-workflows-editor-view'],
  classNameBindings: ['activeTabClass'],

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
   * @type {'editor'|'details'}
   */
  activeTab: 'editor',

  /**
   * Data injected into the visualiser. Initialized by
   * `atmWorkflowSchemaRevisionObserver`, updated by modifications.
   * @type {Object}
   */
  visualiserData: undefined,

  /**
   * Contains data showed by details form. Initialized by
   * `atmWorkflowSchemaRevisionObserver`, updated by modifications.
   * @type {Object}
   */
  detailsData: undefined,

  /**
   * The same as `visualiserData`, but without modifications.
   * @type {Object}-flex
   */
  unchangedVisualiserData: undefined,

  /**
   * The same as `detailsData`, but without modifications.
   * @type {Object}-flex
   */
  unchangedDetailsData: undefined,

  /**
   * @override
   */
  globalActions: collect('dumpAction'),

  /**
   * @type {ComputedProperty<String>}
   */
  activeTabClass: tag `${'activeTab'}-tab-active`,

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isRevisionModified: computed(
    'visualiserData',
    'detailsData',
    'unchangedVisualiserData',
    'unchangedDetailsData',
    function isRevisionModified() {
      const {
        visualiserData,
        detailsData,
        unchangedVisualiserData,
        unchangedDetailsData,
      } = this.getProperties(
        'visualiserData',
        'detailsData',
        'unchangedVisualiserData',
        'unchangedDetailsData'
      );
      return !areWorkflowSchemaRevisionsEqual(
        Object.assign({}, visualiserData, detailsData),
        Object.assign({}, unchangedVisualiserData, unchangedDetailsData)
      );
    }
  ),

  /**
   * @type {ComputedProperty<WorkflowEditorViewModificationState>}
   */
  modificationState: computed(
    'isRevisionModified',
    function modificationState() {
      const isRevisionModified = this.get('isRevisionModified');
      const state = {
        isModified: isRevisionModified,
      };
      if (isRevisionModified) {
        state.executeSaveAction = async () => await this.save();
      }
      return state;
    }
  ),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isSaveBtnDisabled: not('isRevisionModified'),

  /**
   * @type {ComputedProperty<String|undefined>}
   */
  saveBtnTip: computed('isRevisionModified', function isSaveBtnDisabled() {
    if (!this.get('isRevisionModified')) {
      return this.t('noChangesToSave');
    }
  }),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  dumpAction: computed(
    'atmWorkflowSchema',
    'isRevisionModified',
    function dumpAction() {
      const {
        workflowActions,
        atmWorkflowSchema,
        revisionNumber,
        isRevisionModified,
      } = this.getProperties(
        'workflowActions',
        'atmWorkflowSchema',
        'revisionNumber',
        'isRevisionModified'
      );
      const action = workflowActions.createDumpAtmWorkflowSchemaRevisionAction({
        atmWorkflowSchema,
        revisionNumber,
      });
      setProperties(action, {
        disabled: isRevisionModified,
        tip: isRevisionModified ? this.t('cannotDumpModified') : undefined,
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
        state = 'draft',
          description = '',
          lanes = [],
          stores = [],
      } = getProperties(revision || {}, 'state', 'description', 'lanes', 'stores');
      const visualiserData = {
        lanes,
        stores,
      };
      const detailsData = {
        state,
        description,
      };
      this.setProperties({
        visualiserData,
        detailsData,
        unchangedVisualiserData: visualiserData,
        unchangedDetailsData: detailsData,
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
      detailsData,
    } = this.getProperties(
      'workflowActions',
      'atmWorkflowSchema',
      'revisionNumber',
      'visualiserData',
      'detailsData'
    );

    const action = workflowActions.createModifyAtmWorkflowSchemaRevisionAction({
      atmWorkflowSchema,
      revisionNumber,
      revisionDiff: Object.assign({}, visualiserData, detailsData),
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
    visualiserDataChange(newVisualiserData) {
      this.set('visualiserData', newVisualiserData);
    },
    detailsDataChange({ data }) {
      this.set('detailsData', data);
    },
    onTabChange(tabId) {
      this.set('activeTab', tabId);
    },
    async save() {
      return await this.save();
    },
  },
});
