/**
 * Edits existing workflow schema. It is a whole view component - may be used for
 * a full page carousel.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { inject as service } from '@ember/service';
import {
  get,
  getProperties,
  observer,
  computed,
  setProperties,
} from '@ember/object';
import { collect } from '@ember/object/computed';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import areWorkflowSchemaRevisionsEqual from 'onedata-gui-common/utils/workflow-visualiser/are-workflow-schema-revisions-equal';
import { not, tag, or, notEmpty } from 'ember-awesome-macros';

/**
 * @typedef {Object} WorkflowEditorViewModificationState
 * @property {boolean} isModified
 * @property {boolean} isValid
 * @property {function} [executeSaveAction] Available when both `isModified` and
 *   `isValid` are `true`
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
   * @type {RevisionNumber}
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
   * @type {Array<AtmWorkSchemaValidationError>|undefined}
   */
  visualiserDataValidationErrors: undefined,

  /**
   * Contains data showed by details form. Initialized by
   * `atmWorkflowSchemaRevisionObserver`, updated by modifications.
   * @type {Object}
   */
  detailsData: undefined,

  /**
   * The same as `visualiserData`, but without modifications.
   * @type {Object}
   */
  unchangedVisualiserData: undefined,

  /**
   * The same as `detailsData`, but without modifications.
   * @type {Object}
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
      const isValid = (this.visualiserDataValidationErrors?.length ?? 0) === 0;
      const state = {
        isModified: this.isRevisionModified,
        isValid,
      };
      if (this.isRevisionModified && isValid) {
        state.executeSaveAction = async () => await this.save();
      }
      return state;
    }
  ),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isSaveBtnDisabled: or(not('isRevisionModified'), notEmpty('visualiserDataValidationErrors')),

  /**
   * @type {ComputedProperty<String|undefined>}
   */
  saveBtnTip: computed('isRevisionModified', function isSaveBtnDisabled() {
    if (!this.isRevisionModified) {
      return this.t('noChangesToSave');
    } else if (this.visualiserDataValidationErrors?.length) {
      return this.t('schemaIsInvalid');
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
          dashboardSpec = null,
      } = getProperties(revision || {},
        'state',
        'description',
        'lanes',
        'stores',
        'dashboardSpec'
      );
      const visualiserData = {
        lanes,
        stores,
        dashboardSpec,
      };
      const detailsData = {
        state,
        description,
      };
      this.setProperties({
        visualiserData,
        visualiserDataValidationErrors: [],
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
    visualiserDataChange(visualiserData, visualiserDataValidationErrors) {
      this.setProperties({
        visualiserData,
        visualiserDataValidationErrors,
      });
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
