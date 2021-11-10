/**
 * Allows to view and create lambdas for automation inventory.
 *
 * @module components/content-atm-inventories-lambdas
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { or, raw, promise } from 'ember-awesome-macros';
import { computed, observer, get } from '@ember/object';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import { scheduleOnce } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(GlobalActions, {
  classNames: ['content-atm-inventories-lambdas'],

  navigationState: service(),
  recordManager: service(),
  modalManager: service(),

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
  activeAtmLambdaId: null,

  /**
   * @type {Number|null}
   */
  activeRevisionNumber: null,

  /**
   * @type {String|null}
   */
  activeSlide: null,

  /**
   * @type {String|null}
   */
  activeEditorType: null,

  /**
   * @type {Boolean}
   */
  isCarouselVisible: false,

  /**
   * @type {LambdaEditorViewModificationState}
   */
  editorModificationState: undefined,

  /**
   * If true, then there is "unsaved changes" modal visible
   * @type {Boolean}
   */
  isAskingUserForUnsavedChanges: false,

  /**
   * @type {String}
   */
  defaultSlideId: 'list',

  /**
   * @type {Array<String>}
   */
  possibleSlideIds: Object.freeze(['list', 'creator', 'editor']),

  /**
   * @type {ComputedProperty<String>}
   */
  effectiveActiveSlide: computed('activeSlide', function effectiveActiveSlide() {
    switch (this.get('activeSlide')) {
      case 'editor':
      case 'creator':
      case 'preview':
        return 'editor';
      case 'list':
      default:
        return 'list';
    }
  }),

  /**
   * @type {ComputedProperty<String|null>}
   */
  activeSlideFromUrl: or('navigationState.aspectOptions.view', raw(null)),

  /**
   * @type {ComputedProperty<String|null>}
   */
  activeAtmLambdaIdFromUrl: or(
    'navigationState.aspectOptions.lambdaId',
    raw(null)
  ),

  /**
   * @type {ComputedProperty<String|null>}
   */
  activeRevisionNumberFromUrl: or('navigationState.aspectOptions.revision', raw(null)),

  /**
   * @type {ComputedProperty<PromiseObject<Model.AtmLambda>>}
   */
  activeAtmLambdaProxy: promise.object(computed(
    'activeAtmLambdaId',
    'atmInventory',
    async function activeAtmLambdaProxy() {
      const {
        activeAtmLambdaId,
        atmInventory,
        recordManager,
      } = this.getProperties(
        'activeAtmLambdaId',
        'atmInventory',
        'recordManager'
      );
      if (!activeAtmLambdaId) {
        return;
      }
      const atmLambda = await recordManager.getRecordById(
        'atmLambda',
        activeAtmLambdaId
      );
      const parentInventories = await get(
        await get(atmLambda, 'atmInventoryList'),
        'list'
      );
      if (!parentInventories.includes(atmInventory)) {
        throw { id: 'notFound' };
      }
      return atmLambda;
    }
  )),

  /**
   * @type {ComputedProperty<PromiseObject<AtmLambdaRevision>>}
   */
  activeAtmLambdaRevisionProxy: promise.object(computed(
    'activeAtmLambdaProxy',
    'activeRevisionNumber',
    async function activeAtmLambdaRevisionProxy() {
      const {
        activeAtmLambdaProxy,
        activeRevisionNumber,
      } = this.getProperties('activeAtmLambdaProxy', 'activeRevisionNumber');

      const activeAtmLambda = await activeAtmLambdaProxy;
      if (!activeAtmLambda) {
        return;
      }
      const activeRevision = activeRevisionNumber &&
        get(activeAtmLambda, `revisionRegistry.${activeRevisionNumber}`);
      if (!activeRevision) {
        throw { id: 'notFound' };
      }
      return activeRevision;
    }
  )),

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

  urlParamsObserver: observer(
    'activeAtmLambdaIdFromUrl',
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

  activeEditorTypeSetter: observer(
    'activeSlide',
    'effectiveActiveSlide',
    function activeEditorTypeSetter() {
      const {
        activeSlide,
        effectiveActiveSlide,
      } = this.getProperties('activeSlide', 'effectiveActiveSlide');
      if (effectiveActiveSlide === 'editor') {
        this.set('activeEditorType', activeSlide);
      }
    }
  ),

  init() {
    this._super(...arguments);
    this.setProperties({
      activeSlide: this.get('defaultSlideId'),
      actionsPerSlide: {},
    });
    this.urlParamsObserver();
    scheduleOnce('afterRender', this, () => this.set('isCarouselVisible', true));
  },

  async synchronizeStateWithUrl() {
    const {
      defaultSlideId,
      activeSlide,
      activeSlideFromUrl,
      activeAtmLambdaId,
      activeAtmLambdaIdFromUrl,
      activeRevisionNumber,
      activeRevisionNumberFromUrl,
    } = this.getProperties(
      'defaultSlideId',
      'activeSlide',
      'activeSlideFromUrl',
      'activeAtmLambdaId',
      'activeAtmLambdaIdFromUrl',
      'activeRevisionNumber',
      'activeRevisionNumberFromUrl'
    );

    let nextActiveSlide = activeSlide;
    let nextActiveAtmLambdaId = activeAtmLambdaId;
    let nextRevisionNumber = activeRevisionNumberFromUrl;
    const isActiveAtmLambdaIdChanged =
      () => nextActiveAtmLambdaId !== activeAtmLambdaId;
    const isActiveRevisionNumberChanged =
      () => nextRevisionNumber !== activeRevisionNumber;
    const isActiveSlideChanged = () => nextActiveSlide !== activeSlide;

    // Detect change of `activeAtm:LambdaId`. `||` condition
    // is to filter out inequalities like `null !== undefined`.
    if (activeAtmLambdaIdFromUrl !== activeAtmLambdaId && (
        activeAtmLambdaIdFromUrl || activeAtmLambdaId
      )) {
      nextActiveAtmLambdaId = activeAtmLambdaIdFromUrl;
    }

    // Convert revision number to integer
    if (typeof nextRevisionNumber === 'string') {
      nextRevisionNumber = Number.parseInt(nextRevisionNumber) || null;
    }

    // Detect change of `activeSlide`
    if (!this.isSlideIdValid(activeSlideFromUrl)) {
      nextActiveSlide = defaultSlideId;
    } else if (activeSlideFromUrl !== activeSlide) {
      nextActiveSlide = activeSlideFromUrl;
    }

    // Entering into editor view with no lambda specified is incorrect.
    // Redirect to default view.
    if (!nextActiveAtmLambdaId && nextActiveSlide === 'editor') {
      nextActiveSlide = defaultSlideId;
    }

    // Detect if some lambda changes are unsaved and take care of them.
    const editorGetsTurnedOff = activeSlide === 'editor' && nextActiveSlide !== 'editor';
    const willUpdateClearUnsavedChanges = activeAtmLambdaId &&
      (editorGetsTurnedOff || isActiveAtmLambdaIdChanged());
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
            lambdaId: activeAtmLambdaId,
            revision: activeRevisionNumber === null ?
              activeRevisionNumber : String(activeRevisionNumber),
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
    if (isActiveAtmLambdaIdChanged()) {
      propsToUpdate.activeAtmLambdaId = nextActiveAtmLambdaId;
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
    }

    // If url params values are different than used by the component,
    // then url params should be redefined to ensure values consistency.
    // Using this.get to retrieve the most recent values, as these could change
    // while asking user what to do with changes.
    if (
      nextActiveSlide !== this.get('activeSlideFromUrl') ||
      nextActiveAtmLambdaId !== this.get('activeAtmLambdaIdFromUrl') ||
      String(nextRevisionNumber) !== String(this.get('activeRevisionNumberFromUrl'))
    ) {
      this.setUrlParams({
        view: nextActiveSlide,
        lambdaId: nextActiveAtmLambdaId,
        revision: nextRevisionNumber === null ?
          nextRevisionNumber : String(nextRevisionNumber),
      }, true);
    }
  },

  shouldBlockTransitionDueToUnsavedChanges() {
    const isModified = this.get('editorModificationState.isModified');
    const isActiveAtmLambdaProxyFulfilled =
      this.cacheFor('isActiveAtmLambdaProxyFulfilled') &&
      this.get('isActiveAtmLambdaProxyFulfilled.isFulfilled');

    return isModified &&
      this.get('activeSlide') === 'editor' &&
      isActiveAtmLambdaProxyFulfilled;
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
    const lambdaId = this.get('activeAtmLambdaIdFromUrl') || null;
    const revision = this.get('activeRevisionNumberFromUrl') || null;
    this.setUrlParams(Object.assign({ lambdaId, revision }, slideParams, {
      view: newSlide,
    }));
  },

  isSlideIdValid(slideId) {
    return this.get('possibleSlideIds').includes(slideId);
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
    showListView() {
      this.changeSlideViaUrl('list');
    },
    showCreatorView() {
      this.changeSlideViaUrl('creator', {
        lambdaId: null,
        revision: null,
      });
    },
    showRevisionCreatorView(atmLambda, originRevisionNumber) {
      const lambdaId = atmLambda && get(atmLambda, 'entityId');
      this.changeSlideViaUrl('creator', {
        lambdaId,
        revision: String(originRevisionNumber),
      });
    },
    async showEditorView(atmLambda, revisionNumber) {
      const activeAtmLambdaId = this.get('activeAtmLambdaId');
      const atmLambdaId = get(atmLambda || {}, 'entityId') || null;

      const lambdaTheSameAsPrevOne = atmLambdaId === activeAtmLambdaId;
      this.changeSlideViaUrl('editor', {
        lambdaId: atmLambdaId,
        revision: String(revisionNumber),
      });

      if (lambdaTheSameAsPrevOne && this.cacheFor('activeAtmLambdaProxy')) {
        // Notify about change in case when selected lambda is the same
        // as previously selected. It should reset editor state by treating selected
        // schema as different one.
        scheduleOnce(
          'afterRender',
          this,
          'notifyPropertyChange',
          'activeAtmLambdaProxy'
        );
      }
    },
    registerViewActions(slideId, actions) {
      scheduleOnce('afterRender', this, () => {
        this.set('actionsPerSlide', Object.assign({}, this.get('actionsPerSlide'), {
          [slideId]: actions,
        }));
      });
    },
    editorModificationStateChange(editorModificationState) {
      this.set('editorModificationState', editorModificationState);
    },
  },
});
