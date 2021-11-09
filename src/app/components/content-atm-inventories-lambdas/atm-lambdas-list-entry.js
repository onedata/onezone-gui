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
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { collect, reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import RevisionActionsFactory from 'onezone-gui/utils/atm-workflow/atm-lambda/revision-actions-factory';

export default Component.extend(I18n, {
  tagName: 'li',
  classNames: ['atm-lambdas-list-entry', 'iconified-block'],
  classNameBindings: ['modeClass'],

  i18n: service(),
  workflowActions: service(),
  clipboardActions: service(),

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
   * One of: `'presentation'`, `'selection'`
   * @virtual optional
   * @type {String}
   */
  mode: 'presentation',

  /**
   * Needed when `mode` is `'presentation'`.
   * @virtual optional
   * @type {Models.AtmInventory}
   */
  atmInventory: undefined,

  /**
   * Needed when `mode` is `'selection'`
   * @virtual optional
   * @type {Function}
   * @returns {any}
   */
  onAddToAtmWorkflowSchema: notImplementedIgnore,

  /**
   * @virtual
   * @type {(atmLambda: Models.AtmLambda, revisionNumber: Number) => void}
   */
  onRevisionClick: undefined,

  /**
   * @virtual
   * @type {(atmLambda: Models.AtmLambda, originRevisionNumber: Number) => void}
   */
  onRevisionCreate: undefined,

  /**
   * @type {Boolean}
   */
  areActionsOpened: false,

  /**
   * @type {ComputedProperty<Array<RevisionsTableColumnSpec>>}
   */
  revisionCustomColumnSpecs: computed(function revisionCustomColumnSpecs() {
    return [{
      name: 'name',
      title: this.t('columns.name.title'),
      sourceFieldName: 'name',
      fallbackValue: this.t('columns.name.fallback'),
      className: 'filling-column',
    }, {
      name: 'summary',
      title: this.t('columns.summary.title'),
      sourceFieldName: 'summary',
      fallbackValue: this.t('columns.summary.fallback'),
      className: 'filling-column',
    }];
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  latestRevisionName: reads('atmLambda.latestRevision.name'),

  /**
   * @type {ComputedProperty<String>}
   */
  latestRevisionSummary: reads('atmLambda.latestRevision.summary'),

  /**
   * @type {ComputedProperty<Utils.AtmWorkflow.AtmLambda.RevisionActionsFactory>}
   */
  revisionActionsFactory: computed(
    'atmLambda',
    'onRevisionCreate',
    function revisionActionsFactory() {
      const {
        atmLambda,
        onRevisionCreate,
      } = this.getProperties('atmLambda', 'onRevisionCreate');
      return RevisionActionsFactory.create({
        ownerSource: this,
        atmLambda,
        onRevisionCreate: onRevisionCreate ?
          (...args) => onRevisionCreate(atmLambda, ...args) : undefined,
      });
    }
  ),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  unlinkAction: computed('atmLambda', 'atmInventory', function unlinkAction() {
    const {
      atmLambda,
      atmInventory,
      workflowActions,
    } = this.getProperties('atmLambda', 'atmInventory', 'workflowActions');

    return workflowActions.createUnlinkAtmLambdaAction({
      atmLambda,
      atmInventory,
    });
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  copyIdAction: computed('atmLambda', function copyIdAction() {
    const {
      atmLambda,
      clipboardActions,
    } = this.getProperties('atmLambda', 'clipboardActions');

    return clipboardActions.createCopyRecordIdAction({ record: atmLambda });
  }),

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  atmLambdaActionsArray: collect('unlinkAction', 'copyIdAction'),

  actions: {
    clickRevision(revisionNumber) {
      const {
        onRevisionClick,
        atmLambda,
      } = this.getProperties('onRevisionClick', 'atmLambda');

      onRevisionClick && onRevisionClick(atmLambda, revisionNumber);
    },
    toggleActionsOpen(state) {
      scheduleOnce('afterRender', this, 'set', 'areActionsOpened', state);
    },
  },
});
