/**
 * Allows to view and create workflow schemas.
 *
 * @module components/content-atm-inventories-workflows
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { promise } from 'ember-awesome-macros';
import EmberObject, { computed, observer, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import ActionsFactory from 'onedata-gui-common/utils/workflow-visualiser/actions-factory';
import { Promise } from 'rsvp';
import { scheduleOnce } from '@ember/runloop';
import preventPageUnload from 'onedata-gui-common/utils/prevent-page-unload';
import I18n from 'onedata-gui-common/mixins/components/i18n';

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
   * @type {String|undefined}
   */
  activeAtmWorkflowSchemaId: undefined,

  /**
   * One of: `'create'`, `'edit'`
   * @type {String}
   */
  taskDetailsProviderMode: 'create',

  /**
   * ```
   * {
   *   atmLambda: Models.AtmLambda,
   *   stores: Array<Object>
   *   task: Object,
   *   onSuccess: Function,
   *   onFailure: Function,
   * }
   * ```
   * @type {Object|undefined}
   */
  taskDetailsProviderData: undefined,

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
   * @type {String}
   */
  activeSlide: undefined,

  /**
   * @type {Boolean}
   */
  isCarouselVisible: true,

  /**
   * @type {WorkflowEditorViewModificationState}
   */
  editorModificationState: undefined,

  /**
   * @type {Window}
   */
  _window: window,

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
   * @type {ComputedProperty<String|undefined>}
   */
  activeSlideFromUrl: reads('navigationState.aspectOptions.view'),

  /**
   * @type {ComputedProperty<String|undefined>}
   */
  activeAtmWorkflowSchemaIdFromUrl: reads('navigationState.aspectOptions.workflowId'),

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
    'activeSlideFromUrl',
    async function urlParamsObserver() {
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
  },

  willDestroyElement() {
    try {
      this.unregisterRouteChangeHandler();
      this.unregisterPageUnloadHandler();
    } finally {
      this._super(...arguments);
    }
  },

  registerRouteChangeHandler() {
    const {
      routeChangeHandler,
      router,
    } = this.getProperties('routeChangeHandler', 'router');

    if (typeof router.on === 'function') {
      router.on('routeWillChange', routeChangeHandler);
    }
  },

  unregisterRouteChangeHandler() {
    const {
      routeChangeHandler,
      router,
    } = this.getProperties('routeChangeHandler', 'router');

    if (typeof router.off === 'function') {
      router.off('routeWillChange', routeChangeHandler);
    }
  },

  registerPageUnloadHandler() {
    const {
      pageUnloadHandler,
      _window,
    } = this.getProperties('pageUnloadHandler', '_window');

    _window.addEventListener('beforeunload', pageUnloadHandler);
  },

  unregisterPageUnloadHandler() {
    const {
      pageUnloadHandler,
      _window,
    } = this.getProperties('pageUnloadHandler', '_window');

    _window.removeEventListener('beforeunload', pageUnloadHandler);
  },

  async synchronizeStateWithUrl() {
    const {
      activeSlide,
      activeSlideFromUrl,
      activeAtmWorkflowSchemaId,
      activeAtmWorkflowSchemaIdFromUrl,
    } = this.getProperties(
      'activeSlide',
      'activeSlideFromUrl',
      'activeAtmWorkflowSchemaId',
      'activeAtmWorkflowSchemaIdFromUrl',
    );
    let nextActiveSlide = activeSlide;
    let nextActiveAtmWorkflowSchemaId = activeAtmWorkflowSchemaId || null;
    const isActiveAtmWorkflowSchemaIdChanged =
      () => nextActiveAtmWorkflowSchemaId !== activeAtmWorkflowSchemaId;
    const isActiveSlideChanged = () => nextActiveSlide !== activeSlide;

    // Detect change of `activeAtmWorkflowSchemaId`. `Boolean(...)` conditions
    // are to filter out inequalities like `null !== undefined`
    if (activeAtmWorkflowSchemaIdFromUrl !== activeAtmWorkflowSchemaId && (
        Boolean(activeAtmWorkflowSchemaIdFromUrl) ||
        Boolean(activeAtmWorkflowSchemaId)
      )) {
      nextActiveAtmWorkflowSchemaId = activeAtmWorkflowSchemaIdFromUrl || null;
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
        this.getNextSlideIdWhenActiveAtmWorkflowSchemaChanges(nextActiveSlide);
    }

    // Detect if some workflow schema changes are unsaved and take care of them.
    const editorGetsTurnedOff = this.isSlideIdUsedByEditor(activeSlide) &&
      !this.isSlideIdUsedByEditor(nextActiveSlide);
    const willUpdateClearUnsavedChanges = activeAtmWorkflowSchemaId &&
      (editorGetsTurnedOff || isActiveAtmWorkflowSchemaIdChanged());
    if (
      willUpdateClearUnsavedChanges &&
      this.shouldBlockTransitionBecauseOfUnsavedChanges()
    ) {
      const userDecision = await this.askUserAndProcessUnsavedChanges();
      if (userDecision === 'keepEditing') {
        // User wants to stay in current state.
        // Reset url params back to represent actual state of the component
        this.setUrlParams({
          view: activeSlide,
          workflowId: activeAtmWorkflowSchemaId,
        }, true);

        // Nothing more to do - user has chosen to abort the transiton.
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
    if (nextActiveSlide !== activeSlideFromUrl ||
      nextActiveAtmWorkflowSchemaId !== activeAtmWorkflowSchemaIdFromUrl) {
      this.setUrlParams({
        view: nextActiveSlide,
        workflowId: nextActiveAtmWorkflowSchemaId,
      }, true);
    }
  },

  async handleRouteChange(transition) {
    if (this.shouldBlockTransitionBecauseOfUnsavedChanges()) {
      transition.abort();
      if ((await this.askUserAndProcessUnsavedChanges()) !== 'keepEditing') {
        transition.retry();
      }
    }
  },

  handlePageUnload(event) {
    if (this.shouldBlockTransitionBecauseOfUnsavedChanges()) {
      return preventPageUnload(event, String(this.t('confirmPageClose')));
    }
  },

  shouldBlockTransitionBecauseOfUnsavedChanges() {
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
   * @returns {Promise<String>} one of: `'ignore'`, `'save'`, `'keepEditing'`
   */
  async askUserAndProcessUnsavedChanges() {
    const executeSaveAction =
      this.get('editorModificationState.executeSaveAction');

    let decision = 'keepEditing';
    await this.get('modalManager').show('unsaved-changes-question-modal', {
      onSubmit: async ({ shouldSaveChanges }) => {
        if (shouldSaveChanges && executeSaveAction) {
          const saveResult = await executeSaveAction();
          if (saveResult && get(saveResult, 'status') === 'failed') {
            return;
          }
          decision = 'save';
        } else {
          decision = 'ignore';
        }
      },
    }).hiddenPromise;
    if (decision !== 'keepEditing') {
      this.set('editorModificationState.isModified', false);
    }
    return decision;
  },

  setUrlParams(params, replaceHistory = false) {
    this.get('navigationState')
      .changeRouteAspectOptions(params, replaceHistory);
  },

  changeSlideViaUrl(newSlide, slideParams = {}) {
    const workflowId = this.get('activeAtmWorkflowSchemaIdFromUrl') || null;
    this.setUrlParams(Object.assign({ workflowId }, slideParams, {
      view: newSlide,
    }));
  },

  runTaskDetailsProvider(mode, { stores, task }) {
    const atmLambdaId = task && get(task, 'lambdaId');
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
        stores,
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

  getNextSlideIdWhenActiveAtmWorkflowSchemaChanges(activeSlideId) {
    return this.isSlideIdUsedByTaskDetailsProvider(activeSlideId) ?
      'editor' : activeSlideId;
  },

  scrollTop() {
    const scrollableParent = this.$() && this.$().parents('.ps')[0];
    if (scrollableParent) {
      scrollableParent.scroll({
        top: 0,
        behavior: 'smooth',
      });
    }
  },

  actions: {
    showCreatorView() {
      this.changeSlideViaUrl('editor', { workflowId: null });
    },
    showEditorView(atmWorkflowSchema) {
      const workflowId = get(atmWorkflowSchema || {}, 'entityId') || null;
      const schemaTheSameAsPrevOne = workflowId === this.get('activeAtmWorkflowSchemaId');
      this.changeSlideViaUrl('editor', { workflowId });

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
    showLambdaCreatorView() {
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
    taskProviderLambdaSelected(atmLambda) {
      this.set('taskDetailsProviderData.atmLambda', atmLambda);
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
        this.finishTaskDetailsProvider(
          Object.assign({ lambdaId: atmLambdaId }, taskData)
        );
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
