/**
 * Shows single lambda.
 *
 * @module components/content-atm-inventories-lambdas/atm-lambdas-list-entry
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { conditional } from 'ember-awesome-macros';
import computedT from 'onedata-gui-common/utils/computed-t';
import { inject as service } from '@ember/service';
import { computed, get } from '@ember/object';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { collect } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';

export default Component.extend(I18n, {
  tagName: 'li',
  classNames: ['atm-lambdas-list-entry', 'iconified-block'],

  i18n: service(),
  workflowActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentAtmInventoriesLambdas.atmLambdasListEntry',

  /**
   * @virtual
   * @type {Models.AtmLambda}
   */
  atmLambda: undefined,

  /**
   * @type {Boolean}
   */
  areActionsOpened: false,

  /**
   * @type {Boolean}
   */
  isExpanded: false,

  /**
   * @type {Boolean}
   */
  isEditing: false,

  /**
   * @type {ComputedProperty<SafeString>}
   */
  toggleDetailsText: conditional(
    'isExpanded',
    computedT('hideDetails'),
    computedT('showDetails'),
  ),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  modifyAction: computed('isEditing', function modifyAction() {
    return {
      action: () => this.startEdition(),
      title: this.t('modifyAction'),
      class: 'modify-action-trigger',
      icon: 'rename',
      disabled: this.get('isEditing'),
    };
  }),

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  atmLambdaActionsArray: collect('modifyAction'),

  startEdition() {
    this.set('isEditing', true);
  },

  stopEdition() {
    this.set('isEditing', false);
  },

  actions: {
    toggleActionsOpen(state) {
      scheduleOnce('afterRender', this, 'set', 'areActionsOpened', state);
    },
    toggleDetails() {
      this.toggleProperty('isExpanded');
    },
    async saveChanges(atmLambdaDiff) {
      const {
        workflowActions,
        atmLambda,
      } = this.getProperties('workflowActions', 'atmLambda');

      if (Object.keys(atmLambdaDiff).length) {
        const result = await workflowActions.createModifyAtmLambdaAction({
          atmLambda,
          atmLambdaDiff,
        }).execute();
        if (get(result, 'status') === 'done') {
          safeExec(this, 'stopEdition');
        }
      } else {
        this.stopEdition();
      }
    },
    cancelChanges() {
      this.stopEdition();
    },
  },
});
