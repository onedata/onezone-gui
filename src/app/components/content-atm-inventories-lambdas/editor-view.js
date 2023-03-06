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
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { getBy, tag } from 'ember-awesome-macros';
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
   * @type {(atmLambda: Models.AtmLambda, revisionNumber: RevisionNumber) => void}
   */
  onAtmLambdaRevisionSaved: notImplementedIgnore,

  /**
   * @type {Object<string,string>}
   */
  viewTypeToFormModeMap,

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
   * @type {AtmLambdaRevision|undefined}
   */
  activeRevision: getBy(
    'atmLambda',
    tag `revisionRegistry.${'activeRevisionNumber'}`
  ),

  /**
   * @type {ComputedProperty<AtmLambdaRevision|undefined>}
   */
  atmLambdaRevision: getBy(
    'atmLambda',
    tag `revisionRegistry.${'atmLambdaRevisionNumber'}`
  ),

  /**
   * @type {ComputedProperty<string>}
   */
  formMode: getBy('viewTypeToFormModeMap', 'viewType'),

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
    scheduleOnce('afterRender', this, 'updateActiveProps');
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
