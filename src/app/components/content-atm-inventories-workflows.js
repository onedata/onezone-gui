/**
 * Allows to view and create workflow schemas.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { promise, or, raw } from 'ember-awesome-macros';
import EmberObject, {
  computed,
  observer,
  get,
  getProperties,
  setProperties,
} from '@ember/object';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import ActionsFactory from 'onedata-gui-common/utils/workflow-visualiser/actions-factory';
import { Promise } from 'rsvp';
import { scheduleOnce } from '@ember/runloop';
import preventPageUnload from 'onedata-gui-common/utils/prevent-page-unload';
import I18n from 'onedata-gui-common/mixins/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { serializeAspectOptions, parseAspectOptions } from 'onedata-gui-common/services/navigation-state';
import _ from 'lodash';
import globals from 'onedata-gui-common/utils/globals';

export default Component.extend(GlobalActions, I18n, {
  classNames: ['content-atm-inventories-workflows'],

  navigationState: service(),
  recordManager: service(),
  workflowManager: service(),
  router: service(),
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentAtmInventoriesWorkflows',

  /**
   * @virtual
   * @type {Models.AtmInventory}
   */
  atmInventory: undefined,

  /**
   * Mapping:
   * string -> Array<Utils.Action>
   * @type {Object}
   */
  actionsPerSlide: undefined,

  /**
   * @type {String|null}
   */
  activeAtmWorkflowSchemaId: null,

  /**
   * @type {RevisionNumber|null}
   */
  activeRevisionNumber: null,

  /**
   * One of: `'create'`, `'edit'`
   * @type {String}
   */
  taskDetailsProviderMode: 'create',

  /**
   * ```
   * {
   *   atmLambda: Models.AtmLambda,
   *   revisionNumber: RevisionNumber,
   *   definedStores: Array<Object>
   *   task: Object,
   *   onSuccess: Function,
   *   onFailure: Function,
   * }
   * ```
   * @type {Object|undefined}
   */
  taskDetailsProviderData: undefined,

  /**
   * Data passed to editor in `lambdaCreator` slide. If `null`, then new lambda
   * will be created. Otherwise a new revision based on the specs from this object
   * will be added to the lambda.
   * @type {{ atmLambda: Model.AtmLambda, originRevisionNumber: RevisionNumber }}
   */
  lambdaCreatorData: null,

  /**
   * Set on init
   * @type {Utils.WorkflowVisualiser.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @type {Array<String>}
   */
  possibleSlideIds: Object.freeze([
    'list',
    'editor',
    'lambdaSelector',
    'lambdaCreator',
    'taskDetails',
  ]),

  /**
   * @type {String|null}
   */
  activeSlide: null,

  /**
   * @type {Boolean}
   */
  isCarouselVisible: false,

  /**
   * @type {WorkflowEditorViewModificationState}
   */
  editorModificationState: undefined,

  /**
   * If true, then there is "unsaved changes" modal visible
   * @type {Boolean}
   */
  isAskingUserForUnsavedChanges: false,

  /**
   * @override
   */
  globalActions: computed('actionsPerSlide', 'activeSlide', function globalActions() {
    const {
      actionsPerSlide,
      activeSlide,
    } = this.getProperties('actionsPerSlide', 'activeSlide');

    return actionsPerSlide[activeSlide] || [];
  }),

  /**
   * @type {ComputedProperty<String|null>}
   */
  activeSlideFromUrl: or('navigationState.aspectOptions.view', raw(null)),

  /**
   * @type {ComputedProperty<String|null>}
   */
  activeAtmWorkflowSchemaIdFromUrl: or(
    'navigationState.aspectOptions.workflowId',
    raw(null)
  ),

  /**
   * @type {ComputedProperty<String|null>}
   */
  activeRevisionNumberFromUrl: or('navigationState.aspectOptions.revision', raw(null)),

  /**
   * @type {ComputedProperty<PromiseObject<Model.AtmWorkflowSchema>>}
   */
  activeAtmWorkflowSchemaProxy: promise.object(computed(
    'activeAtmWorkflowSchemaId',
    'atmInventory',
    async function activeAtmWorkflowSchema() {
      const {
        activeAtmWorkflowSchemaId,
        atmInventory,
        recordManager,
      } = this.getProperties(
        'activeAtmWorkflowSchemaId',
        'atmInventory',
        'recordManager'
      );
      if (!activeAtmWorkflowSchemaId) {
        return;
      }

      const atmWorkflowSchema = await recordManager.getRecordById(
        'atmWorkflowSchema',
        activeAtmWorkflowSchemaId
      );
      const parentInventory = await get(atmWorkflowSchema, 'atmInventory');
      if (parentInventory !== atmInventory) {
        throw { id: 'notFound' };
      }
      await get(await get(atmWorkflowSchema, 'atmLambdaList'), 'list');
      return atmWorkflowSchema;
    }
  )),

  /**
   * @type {ComputedProperty<PromiseObject<AtmWorkflowSchemaRevision>>}
   */
  activeAtmWorkflowSchemaRevisionProxy: promise.object(computed(
    'activeAtmWorkflowSchemaProxy',
    'activeRevisionNumber',
    async function activeAtmWorkflowSchemaRevisionProxy() {
      const {
        activeAtmWorkflowSchemaProxy,
        activeRevisionNumber,
      } = this.getProperties('activeAtmWorkflowSchemaProxy', 'activeRevisionNumber');

      const activeAtmWorkflowSchema = await activeAtmWorkflowSchemaProxy;
      const activeRevision = activeRevisionNumber &&
        get(activeAtmWorkflowSchema, `revisionRegistry.${activeRevisionNumber}`);
      if (!activeRevision) {
        throw { id: 'notFound' };
      }
      return activeRevision;
    }
  )),

  /**
   * @type {ComputedProperty<Function>}
   */
  routeChangeHandler: computed(function routeChangeHandler() {
    return (transition) => this.handleRouteChange(transition);
  }),

  /**
   * @type {Ember.ComputedProperty<Function>}
   */
  pageUnloadHandler: computed(function pageUnloadHandler() {
    return (event) => this.handlePageUnload(event);
  }),

  urlParamsObserver: observer(
    'activeAtmWorkflowSchemaIdFromUrl',
    'activeRevisionNumberFromUrl',
    'activeSlideFromUrl',
    function urlParamsObserver() {
      scheduleOnce('actions', this, 'synchronizeStateWithUrl');
    }
  ),

  atmInventoryObserver: observer('atmInventory', function atmInventoryObserver() {
    // rerender carousel from scratch to avoid animations of slide change
    this.set('isCarouselVisible', false);
    scheduleOnce('afterRender', this, 'set', 'isCarouselVisible', true);
  }),

  init() {
    this._super(...arguments);
    const actionsFactory = ActionsFactory.create({ ownerSource: this });
    actionsFactory.setGetTaskCreationDataCallback(
      (...args) => this.runTaskDetailsProvider('create', ...args)
    );
    actionsFactory.setGetTaskModificationDataCallback(
      (...args) => this.runTaskDetailsProvider('edit', ...args)
    );
    this.setProperties({
      activeSlide: this.getDefaultSlideId(),
      actionsPerSlide: {},
      actionsFactory,
    });
    this.urlParamsObserver();
    this.registerRouteChangeHandler();
    this.registerPageUnloadHandler();
    scheduleOnce('afterRender', this, () => this.set('isCarouselVisible', true));
  },

  willDestroyElement() {
    try {
      this.cancelTaskDetailsProvider();
      this.unregisterRouteChangeHandler();
      this.unregisterPageUnloadHandler();
      this.actionsFactory.destroy();
    } finally {
      this._super(...arguments);
    }
  },

  registerRouteChangeHandler() {
    this.router.on('routeWillChange', this.routeChangeHandler);
  },

  unregisterRouteChangeHandler() {
    this.router.off('routeWillChange', this.routeChangeHandler);
  },

  registerPageUnloadHandler() {
    globals.window.addEventListener('beforeunload', this.pageUnloadHandler);
  },

  unregisterPageUnloadHandler() {
    globals.window.removeEventListener('beforeunload', this.pageUnloadHandler);
  },

  async synchronizeStateWithUrl() {
    const {
      activeSlide,
      activeSlideFromUrl,
      activeAtmWorkflowSchemaId,
      activeAtmWorkflowSchemaIdFromUrl,
      activeRevisionNumber,
      activeRevisionNumberFromUrl,
    } = this.getProperties(
      'activeSlide',
      'activeSlideFromUrl',
      'activeAtmWorkflowSchemaId',
      'activeAtmWorkflowSchemaIdFromUrl',
      'activeRevisionNumber',
      'activeRevisionNumberFromUrl'
    );

    let nextActiveSlide = activeSlide;
    let nextActiveAtmWorkflowSchemaId = activeAtmWorkflowSchemaId;
    let nextRevisionNumber = activeRevisionNumberFromUrl;
    const isActiveAtmWorkflowSchemaIdChanged =
      () => nextActiveAtmWorkflowSchemaId !== activeAtmWorkflowSchemaId;
    const isActiveRevisionNumberChanged =
      () => nextRevisionNumber !== activeRevisionNumber;
    const isActiveSlideChanged = () => nextActiveSlide !== activeSlide;

    // Detect change of `activeAtmWorkflowSchemaId`. `||` condition
    // is to filter out inequalities like `null !== undefined`.
    if (activeAtmWorkflowSchemaIdFromUrl !== activeAtmWorkflowSchemaId && (
        activeAtmWorkflowSchemaIdFromUrl || activeAtmWorkflowSchemaId
      )) {
      nextActiveAtmWorkflowSchemaId = activeAtmWorkflowSchemaIdFromUrl;
    }

    // Convert revision number to integer
    if (typeof nextRevisionNumber === 'string') {
      nextRevisionNumber = Number.parseInt(nextRevisionNumber) || null;
    }

    // Detect change of `activeSlide`
    if (!this.isSlideIdValid(activeSlideFromUrl)) {
      nextActiveSlide = this.getDefaultSlideId();
    } else if (activeSlideFromUrl !== activeSlide) {
      nextActiveSlide = activeSlideFromUrl;
    }

    // If `activeAtmWorkflowSchemaId` is going to change, then new `activeSlide`
    // value should be suitable for that change e.g. some editor-related slides
    // should not be available.
    if (isActiveAtmWorkflowSchemaIdChanged()) {
      nextActiveSlide =
        this.getNextSlideIdOnActiveSchemaChange(nextActiveSlide);
    }

    // Detect if some workflow schema changes are unsaved and take care of them.
    const editorGetsTurnedOff = this.isSlideIdUsedByEditor(activeSlide) &&
      !this.isSlideIdUsedByEditor(nextActiveSlide);
    const willUpdateClearUnsavedChanges = activeAtmWorkflowSchemaId &&
      (editorGetsTurnedOff || isActiveAtmWorkflowSchemaIdChanged());
    if (
      willUpdateClearUnsavedChanges &&
      this.shouldBlockTransitionDueToUnsavedChanges()
    ) {
      const userDecision = await this.askUserAndProcessUnsavedChanges();
      switch (userDecision) {
        case 'keepEditing':
          // User wants to stay in current state.
          // Reset url params back to represent actual state of the component
          this.setUrlParams({
            view: activeSlide,
            workflowId: activeAtmWorkflowSchemaId,
          }, true);

          // Nothing more to do - user has chosen to abort the transiton.
          return;
        case 'alreadyAsked':
          // User triggered next url change when the previous one has not been
          // commited yet. We have to wait for the first one and ignore current
          // change.
          return;
      }
    }

    // Perform update of component properties
    const propsToUpdate = {};
    if (isActiveSlideChanged()) {
      propsToUpdate.activeSlide = nextActiveSlide;
    }
    if (isActiveAtmWorkflowSchemaIdChanged()) {
      propsToUpdate.activeAtmWorkflowSchemaId = nextActiveAtmWorkflowSchemaId;
    }
    if (isActiveRevisionNumberChanged()) {
      propsToUpdate.activeRevisionNumber = nextRevisionNumber;
    }
    if (Object.keys(propsToUpdate).length) {
      this.setProperties(propsToUpdate);
    }

    // Introduce some post-update adjustments related to changes.
    if (isActiveSlideChanged()) {
      this.scrollTop();
      if (!this.isSlideIdUsedByTaskDetailsProvider(nextActiveSlide)) {
        this.cancelTaskDetailsProvider();
      }
    }

    // If url params values are different than used by the component,
    // then url params should be redefined to ensure values consistency.
    // Using this.get to retrieve the most recent values, as these could change
    // while asking user what to do with changes.
    if (
      nextActiveSlide !== this.get('activeSlideFromUrl') ||
      nextActiveAtmWorkflowSchemaId !== this.get('activeAtmWorkflowSchemaIdFromUrl') ||
      String(nextRevisionNumber) !== String(this.get('activeRevisionNumberFromUrl'))
    ) {
      this.setUrlParams({
        view: nextActiveSlide,
        workflowId: nextActiveAtmWorkflowSchemaId,
        revision: nextRevisionNumber === null ?
          nextRevisionNumber : String(nextRevisionNumber),
      }, true);
    }
  },

  async handleRouteChange(transition) {
    if (transition.isAborted || isTransitionWithinEditor(transition)) {
      return;
    }

    if (this.shouldBlockTransitionDueToUnsavedChanges()) {
      // Aborting transition doesn't work properly for query-params-only
      // transitions. This should be fixed in Ember 3.20.3.
      // TODO: VFS-10419 Check if Ember 3.20 fixed this issue.
      transition.abort();
      const userDecision = await this.askUserAndProcessUnsavedChanges();
      if (userDecision === 'save' || userDecision === 'ignore') {
        transition.retry();
      }
    }
  },

  handlePageUnload(event) {
    if (this.shouldBlockTransitionDueToUnsavedChanges()) {
      return preventPageUnload(event, String(this.t('confirmPageClose')));
    }
  },

  shouldBlockTransitionDueToUnsavedChanges() {
    const isActiveSlideUsedByEditor =
      this.isSlideIdUsedByEditor(this.get('activeSlide'));
    const isModified = this.get('editorModificationState.isModified');
    const isActiveAtmWorkflowSchemaProxyFulfilled =
      this.cacheFor('activeAtmWorkflowSchemaProxy') &&
      this.get('activeAtmWorkflowSchemaProxy.isFulfilled');

    return isModified &&
      isActiveSlideUsedByEditor &&
      isActiveAtmWorkflowSchemaProxyFulfilled;
  },

  /**
   * @returns {Promise<String>} one of: `'ignore'`, `'save'`, `'keepEditing'`,
   * `'alreadyAsked'`
   */
  async askUserAndProcessUnsavedChanges() {
    if (this.get('isAskingUserForUnsavedChanges')) {
      // User is already in the middle of choosing what to do. It means, that
      // there was some uncommited url/route change earlier, which needs to
      // be resolved at the first place.
      return 'alreadyAsked';
    }
    this.set('isAskingUserForUnsavedChanges', true);
    const executeSaveAction =
      this.get('editorModificationState.executeSaveAction');

    let decision = 'keepEditing';
    await this.get('modalManager').show('unsaved-changes-question-modal', {
      saveDisabledReason: this.editorModificationState.isValid ?
        undefined : this.t('cannotSaveDueToIssues'),
      onSubmit: async ({ shouldSaveChanges }) => {
        if (shouldSaveChanges && executeSaveAction) {
          const saveResult = await executeSaveAction();
          if (saveResult && get(saveResult, 'status') === 'failed') {
            // In case of failure `executeSaveAction` should show proper error
            // notification. After fail user should stay in editor view and
            // decide what to do next. Hence `decision` is `'keepEditing'`.
            return;
          }
          decision = 'save';
        } else {
          decision = 'ignore';
        }
      },
    }).hiddenPromise;
    safeExec(this, () => {
      this.set('isAskingUserForUnsavedChanges', false);
      if (decision !== 'keepEditing') {
        this.set('editorModificationState.isModified', false);
      }
    });

    return decision;
  },

  setUrlParams(params, replaceHistory = false) {
    this.get('navigationState')
      .changeRouteAspectOptions(params, replaceHistory);
  },

  changeSlideViaUrl(newSlide, slideParams = {}) {
    const workflowId = this.get('activeAtmWorkflowSchemaIdFromUrl') || null;
    const revision = this.get('activeRevisionNumberFromUrl') || null;
    this.setUrlParams(Object.assign({ workflowId, revision }, slideParams, {
      view: newSlide,
    }));
  },

  runTaskDetailsProvider(mode, { definedStores, task }) {
    const {
      lambdaId: atmLambdaId,
      lambdaRevisionNumber: revisionNumber,
    } = getProperties(task || {}, 'lambdaId', 'lambdaRevisionNumber');
    const atmLambda = atmLambdaId ?
      this.get('recordManager').getLoadedRecordById('atmLambda', atmLambdaId) :
      undefined;

    if (mode === 'edit' && !atmLambda) {
      console.error(
        'content-atm-inventories-workflows: cannot load lambda function associated to selected task'
      );
      return;
    }

    let resolvePromise;
    let rejectPromise;
    const detailsProviderPromise = new Promise((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });

    this.setProperties({
      taskDetailsProviderMode: mode,
      taskDetailsProviderData: EmberObject.create({
        atmLambda,
        revisionNumber,
        definedStores,
        task,
        onSuccess: resolvePromise,
        onFailure: rejectPromise,
      }),
    });

    this.changeSlideViaUrl(mode === 'create' ? 'lambdaSelector' : 'taskDetails');

    return detailsProviderPromise;
  },

  finishTaskDetailsProvider(taskData) {
    const onSuccessCallback = this.get('taskDetailsProviderData.onSuccess');
    onSuccessCallback && onSuccessCallback(taskData);
  },

  cancelTaskDetailsProvider() {
    const onFailureCallback = this.get('taskDetailsProviderData.onFailure');
    onFailureCallback && onFailureCallback();
  },

  getDefaultSlideId() {
    return 'list';
  },

  isSlideIdValid(slideId) {
    return this.get('possibleSlideIds').includes(slideId);
  },

  isSlideIdUsedByTaskDetailsProvider(slideId) {
    return [
      'lambdaSelector',
      'lambdaCreator',
      'taskDetails',
    ].includes(slideId);
  },

  isSlideIdUsedByEditor(slideId) {
    return slideId === 'editor' ||
      this.isSlideIdUsedByTaskDetailsProvider(slideId);
  },

  getNextSlideIdOnActiveSchemaChange(activeSlideId) {
    return this.isSlideIdUsedByTaskDetailsProvider(activeSlideId) ?
      'editor' : activeSlideId;
  },

  scrollTop() {
    const element = this.get('element');
    const scrollableParent = element && element.closest('.ps');
    if (scrollableParent) {
      scrollableParent.scroll({
        top: 0,
        behavior: 'smooth',
      });
    }
  },

  async showEditorView(atmWorkflowSchema, revisionNumber) {
    const {
      atmInventory,
      activeAtmWorkflowSchemaId,
      router,
    } = this.getProperties('atmInventory', 'activeAtmWorkflowSchemaId', 'router');
    const atmInventoryOfWorkflowSchema = await get(atmWorkflowSchema || {}, 'atmInventory');
    const workflowId = get(atmWorkflowSchema || {}, 'entityId') || null;
    if (
      atmInventoryOfWorkflowSchema &&
      atmInventoryOfWorkflowSchema !== atmInventory &&
      workflowId &&
      revisionNumber
    ) {
      // Some event from inside of this component triggered a change in model,
      // that needs showing editor for a workflow in another inventory.
      // Example of such an event is duplicating revision to a workflow in
      // other inventory.
      await router.transitionTo(
        'onedata.sidebar.content.aspect',
        'atm-inventories',
        get(atmInventoryOfWorkflowSchema, 'entityId'),
        'workflows', {
          queryParams: {
            options: serializeAspectOptions({
              view: 'editor',
              workflowId,
              revision: revisionNumber,
            }),
          },
        }
      );
      return;
    }

    const schemaTheSameAsPrevOne = workflowId === activeAtmWorkflowSchemaId;
    this.changeSlideViaUrl('editor', {
      workflowId,
      revision: String(revisionNumber),
    });

    if (schemaTheSameAsPrevOne) {
      // Notify about change in case when selected workflow schema is the same
      // as previously selected. It should reset editor state by treating selected
      // schema as different one.
      scheduleOnce(
        'afterRender',
        this,
        'notifyPropertyChange',
        'activeAtmWorkflowSchemaProxy'
      );
    }
  },

  actions: {
    showCreatorView() {
      this.changeSlideViaUrl('editor', { workflowId: null });
    },
    atmWorkflowSchemaAdded(atmWorkflowSchema) {
      this.showEditorView(atmWorkflowSchema, 1);
    },
    async showEditorView(atmWorkflowSchema, revisionNumber) {
      await this.showEditorView(atmWorkflowSchema, revisionNumber);
    },
    showLambdaCreatorView(atmLambda, originRevisionNumber) {
      let lambdaCreatorData = null;
      if (atmLambda && originRevisionNumber) {
        lambdaCreatorData = {
          atmLambda,
          originRevisionNumber,
        };
        this.set('lambdaCreatorData', lambdaCreatorData);
      }
      this.changeSlideViaUrl('lambdaCreator');
    },
    backSlide() {
      const {
        activeSlide,
        taskDetailsProviderMode,
      } = this.getProperties('activeSlide', 'taskDetailsProviderMode');
      switch (activeSlide) {
        case 'editor':
          this.changeSlideViaUrl('list');
          break;
        case 'lambdaSelector':
          this.changeSlideViaUrl('editor');
          this.cancelTaskDetailsProvider();
          break;
        case 'lambdaCreator':
          this.changeSlideViaUrl('lambdaSelector');
          break;
        case 'taskDetails':
          if (taskDetailsProviderMode === 'create') {
            this.changeSlideViaUrl('lambdaSelector');
          } else {
            this.changeSlideViaUrl('editor');
            this.cancelTaskDetailsProvider();
          }
          break;
      }
    },
    registerViewActions(slideId, actions) {
      scheduleOnce('afterRender', this, () => {
        this.set('actionsPerSlide', Object.assign({}, this.get('actionsPerSlide'), {
          [slideId]: actions,
        }));
      });
    },
    taskProviderLambdaSelected(atmLambda, revisionNumber) {
      setProperties(this.get('taskDetailsProviderData'), {
        atmLambda,
        revisionNumber,
      });
      this.changeSlideViaUrl('taskDetails');
    },
    async taskProviderDataAccepted(taskData) {
      try {
        const atmLambda = this.get('taskDetailsProviderData.atmLambda');
        const atmLambdaId = get(atmLambda, 'entityId');
        const atmInventory = this.get('atmInventory');
        const atmLambdasInInventory = await get(
          await get(atmInventory, 'atmLambdaList'),
          'list'
        );
        if (!atmLambdasInInventory.includes(atmLambda)) {
          await this.get('workflowManager').attachAtmLambdaToAtmInventory(
            atmLambdaId,
            get(atmInventory, 'entityId')
          );
        }
        this.finishTaskDetailsProvider(taskData);
      } catch (e) {
        this.cancelTaskDetailsProvider();
      }
      this.changeSlideViaUrl('editor');
    },
    taskProviderCancel() {
      this.cancelTaskDetailsProvider();
      this.changeSlideViaUrl('editor');
    },
    editorModificationStateChange(editorModificationState) {
      this.set('editorModificationState', editorModificationState);
    },
  },
});

/**
 * Compares `transition.from` and `transition.to` routes and returns information
 * whether or not user is still in the current workflow editor.
 * @param {Transition} transition
 * @returns {boolean}
 */
function isTransitionWithinEditor(transition) {
  let routesToCompare = [transition.from, transition.to];
  if (routesToCompare[0].name !== routesToCompare[1].name) {
    // Route changed.
    return false;
  }
  while (routesToCompare[0] && routesToCompare[1]) {
    if (!_.isEqual(routesToCompare[0].params, routesToCompare[1].params)) {
      // Route params changed.
      return false;
    }
    routesToCompare = [routesToCompare[0].parent, routesToCompare[1].parent];
  }
  if (routesToCompare[0] || routesToCompare[1]) {
    // Should be impossible. If there were inconsitencies between "from" and
    // "to" route parents sequence length, then we assume that route is changed.
    return false;
  }

  const fromAspectOptions = parseAspectOptions(transition.from.queryParams?.options);
  const toAspectOptions = parseAspectOptions(transition.to.queryParams?.options);

  if (!fromAspectOptions.workflowId || !fromAspectOptions.revision) {
    // No information about which workflow is being edited. We act as everything
    // is fine - it might be some incorrect URL and we don't know how to fix it here.
    return true;
  }

  return fromAspectOptions.workflowId === toAspectOptions.workflowId &&
    fromAspectOptions.revision === toAspectOptions.revision;
}
