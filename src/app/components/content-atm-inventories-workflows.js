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
import { conditional, array, promise } from 'ember-awesome-macros';
import EmberObject, { computed, observer, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import ActionsFactory from 'onedata-gui-common/utils/workflow-visualiser/actions-factory';
import { Promise } from 'rsvp';
import { scheduleOnce } from '@ember/runloop';

export default Component.extend(GlobalActions, {
  classNames: ['content-atm-inventories-workflows'],

  navigationState: service(),
  recordManager: service(),
  workflowManager: service(),

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
   * @type {Boolean}
   */
  isCarouselVisible: true,

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
   * @type {ComputedProperty<String>}
   */
  activeSlide: conditional(
    array.includes('possibleSlideIds', 'activeSlideFromUrl'),
    'activeSlideFromUrl',
    'possibleSlideIds.firstObject'
  ),

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

  activeAtmWorkflowSchemaIdFromUrlObserver: observer(
    'activeAtmWorkflowSchemaIdFromUrl',
    function activeAtmWorkflowSchemaIdFromUrlObserver() {
      const {
        activeAtmWorkflowSchemaId,
        activeAtmWorkflowSchemaIdFromUrl,
        activeSlide,
      } = this.getProperties(
        'activeAtmWorkflowSchemaId',
        'activeAtmWorkflowSchemaIdFromUrl',
        'activeSlide'
      );

      if (activeAtmWorkflowSchemaId !== activeAtmWorkflowSchemaIdFromUrl) {
        this.set('activeAtmWorkflowSchemaId', activeAtmWorkflowSchemaIdFromUrl);
        if (['lambdaSelector', 'taskDetails'].includes(activeSlide)) {
          scheduleOnce('afterRender', this, 'changeSlideViaUrl', 'editor');
        }
      }
    }
  ),

  activeSlideObserver: observer('activeSlide', function activeSlideObserver() {
    const scrollableParent = this.$().parents('.ps')[0];
    if (scrollableParent) {
      scrollableParent.scroll({
        top: 0,
        behavior: 'smooth',
      });
    }
    const activeSlide = this.get('activeSlide');
    if (!['lambdaSelector', 'lambdaCreator', 'taskDetails'].includes(activeSlide)) {
      this.cancelTaskDetailsProvider();
    }
  }),

  atmInventoryObserver: observer('atmInventory', function atmInventoryObserver() {
    // rerender carousel from scratch to avoid animations of slide change
    this.set('isCarouselVisible', false);
    scheduleOnce('afterRender', this, 'set', 'isCarouselVisible', true);
  }),

  changeSlideViaUrl(newSlide, slideParams = {}) {
    const workflowId = this.get('activeAtmWorkflowSchemaIdFromUrl') || null;
    this.get('navigationState')
      .changeRouteAspectOptions(Object.assign({ workflowId }, slideParams, {
        view: newSlide,
      }));
  },

  init() {
    this._super(...arguments);
    const actionsFactory = ActionsFactory.create({ ownerSource: this });
    actionsFactory.registerTaskDetailsCreateProviderCallback(
      (...args) => this.runTaskDetailsProvider('create', ...args)
    );
    actionsFactory.registerTaskDetailsModifyProviderCallback(
      (...args) => this.runTaskDetailsProvider('edit', ...args)
    );
    this.setProperties({
      actionsPerSlide: {},
      actionsFactory,
    });
    this.activeAtmWorkflowSchemaIdFromUrlObserver();
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
      this.set('actionsPerSlide', Object.assign({}, this.get('actionsPerSlide'), {
        [slideId]: actions,
      }));
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
  },
});
