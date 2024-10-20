/**
 * Creates new lambda. It is a whole view component - may be used for
 * a full page carousel.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { getProperties, observer, computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/i18n';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { scheduleOnce } from '@ember/runloop';

const viewTypeToFormModeMap = {
  editor: 'edit',
  creator: 'create',
  preview: 'view',
};

export default Component.extend(I18n, {
  classNames: ['content-atm-inventories-lambdas-editor-view'],

  i18n: service(),
  workflowActions: service(),
  onedataConnection: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentAtmInventoriesLambdas.editorView',

  /**
   * @virtual
   * @type {Models.AtmInventory}
   */
  atmInventory: undefined,

  /**
   * @virtual
   * @type {Modals.AtmLambda}
   */
  atmLambda: undefined,

  /**
   * @virtual
   * @type {RevisionNumber}
   */
  atmLambdaRevisionNumber: undefined,

  /**
   * One of `'editor'`, `'creator'`, `'preview'`
   * @virtual
   * @type {String}
   */
  viewType: undefined,

  /**
   * @virtual
   * @type {Boolean}
   */
  visible: false,

  /**
   * @virtual
   * @type {Function}
   */
  onBackSlide: notImplementedIgnore,

  /**
   * @virtual
   * @type {(actions: Array<Action>) => void)}
   */
  onRegisterViewActions: notImplementedIgnore,

  /**
   * @type {(atmLambda: Models.AtmLambda, revisionNumber: RevisionNumber) => void}
   */
  onAtmLambdaRevisionSaved: notImplementedIgnore,

  /**
   * @type {String}
   */
  activeViewType: undefined,

  /**
   * @type {Models.AtmLambda|undefined}
   */
  activeAtmLambda: undefined,

  /**
   * @type {RevisionNumber|undefined}
   */
  activeRevisionNumber: undefined,

  /**
   * @type {Utils.Action | null}
   */
  dumpActionCache: null,

  /**
   * @type {AtmLambdaRevision|undefined}
   */
  activeRevision: computed(
    'atmLambda.revisionRegistry',
    'activeRevisionNumber',
    function activeRevision() {
      return this.atmLambda?.revisionRegistry?.[this.activeRevisionNumber];
    }
  ),

  /**
   * @type {ComputedProperty<AtmLambdaRevision|undefined>}
   */
  atmLambdaRevision: computed(
    'atmLambda.revisionRegistry',
    'atmLambdaRevisionNumber',
    function atmLambdaRevision() {
      return this.atmLambda?.revisionRegistry?.[this.atmLambdaRevisionNumber];
    }
  ),

  /**
   * @type {ComputedProperty<string>}
   */
  formMode: computed('viewType', function formMode() {
    return viewTypeToFormModeMap[this.viewType];
  }),

  /**
   * @type {ComputedProperty<string>}
   */
  headerText: computed('activeViewType', 'atmLambda', function headerText() {
    const {
      activeViewType,
      atmLambda,
    } = this.getProperties('activeViewType', 'atmLambda');

    const modeForHeader = activeViewType === 'creator' && atmLambda ?
      'revisionCreator' : activeViewType;
    return this.t(`header.${modeForHeader}`);
  }),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  dumpAction: computed(
    'atmLambda',
    'atmLambdaRevisionNumber',
    function dumpAction() {
      this.dumpActionCache?.destroy();
      return this.dumpActionCache =
        this.workflowActions.createDumpAtmLambdaRevisionAction({
          atmLambda: this.atmLambda,
          revisionNumber: this.atmLambdaRevisionNumber,
        });
    }
  ),

  /**
   * @override
   */
  globalActions: computed('dumpAction', 'activeViewType', function globalActions() {
    return this.activeViewType !== 'creator' ? [this.dumpAction] : [];
  }),

  globalActionsObserver: observer('globalActions.[]', function globalActionsObserver() {
    this.registerViewActions();
  }),

  activePropsUpdater: observer(
    'atmLambda',
    'atmLambdaRevisionNumber',
    'atmLambdaRevision',
    'viewType',
    function activePropsUpdater() {
      const {
        atmLambda,
        activeAtmLambda,
        atmLambdaRevisionNumber,
        activeAtmLambdaRevisionNumber,
        viewType,
        activeViewType,
      } = this.getProperties(
        'atmLambda',
        'activeAtmLambda',
        'atmLambdaRevisionNumber',
        'activeAtmLambdaRevisionNumber',
        'viewType',
        'activeViewType'
      );

      if (
        viewType !== activeViewType ||
        viewType === 'preview' ||
        atmLambda !== activeAtmLambda ||
        atmLambdaRevisionNumber !== activeAtmLambdaRevisionNumber
      ) {
        scheduleOnce('afterRender', this, 'updateActiveProps');
      }
    }
  ),

  visibleObserver: observer('visible', function visibleObserver() {
    if (this.get('visible')) {
      scheduleOnce('afterRender', this, 'updateActiveProps');
    }
  }),

  init() {
    this._super(...arguments);
    this.globalActionsObserver();
    scheduleOnce('afterRender', this, 'updateActiveProps');
  },

  willDestroyElement() {
    try {
      this.registerViewActions(true);
      this.cacheFor('dumpAction')?.destroy();
    } finally {
      this._super(...arguments);
    }
  },

  registerViewActions(clear = false) {
    this.onRegisterViewActions(clear ? [] : this.globalActions);
  },

  updateActiveProps() {
    const {
      viewType,
      atmLambda,
      atmLambdaRevisionNumber,
    } = this.getProperties('viewType', 'atmLambda', 'atmLambdaRevisionNumber');

    this.setProperties({
      activeViewType: viewType,
      activeAtmLambda: atmLambda,
      activeRevisionNumber: atmLambdaRevisionNumber,
    });
  },

  actions: {
    backSlide() {
      this.get('onBackSlide')();
    },
    async onFormSubmit(formData) {
      const {
        workflowActions,
        atmInventory,
        atmLambda,
        atmLambdaRevisionNumber,
        onAtmLambdaRevisionSaved,
        viewType,
      } = this.getProperties(
        'workflowActions',
        'atmInventory',
        'atmLambda',
        'atmLambdaRevisionNumber',
        'onAtmLambdaRevisionSaved',
        'viewType'
      );

      let action;
      switch (viewType) {
        case 'creator':
          if (atmLambda) {
            action = workflowActions.createCreateAtmLambdaRevisionAction({
              atmLambda,
              revisionContent: formData,
            });
          } else {
            action = workflowActions.createCreateAtmLambdaAction({
              atmInventory,
              initialRevision: formData,
            });
          }
          break;
        case 'editor':
          action = workflowActions.createModifyAtmLambdaRevisionAction({
            atmLambda,
            revisionNumber: atmLambdaRevisionNumber,
            revisionDiff: formData,
          });
          break;
        default:
          return;
      }
      const actionResult = await action.execute();
      action.destroy();

      const {
        status,
        result,
        error,
      } = getProperties(actionResult, 'status', 'result', 'error');
      let savedAtmLambda;
      let savedRevisionNumber;
      if (status === 'done') {
        if (viewType === 'creator') {
          if (!atmLambda) {
            savedAtmLambda = result;
            savedRevisionNumber = 1;
          } else {
            savedAtmLambda = atmLambda;
            savedRevisionNumber = result;
          }
        } else {
          savedAtmLambda = atmLambda;
          savedRevisionNumber = atmLambdaRevisionNumber;
        }
        onAtmLambdaRevisionSaved(savedAtmLambda, savedRevisionNumber);
      } else {
        throw error;
      }
    },
  },
});
