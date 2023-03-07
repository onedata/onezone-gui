/**
 * Shows single lambda.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { collect, reads } from '@ember/object/computed';
import { conditional, raw, eq } from 'ember-awesome-macros';
import { scheduleOnce } from '@ember/runloop';
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
   * @virtual
   * @type {(atmLambda: Models.AtmLambda, revisionNumber: RevisionNumber) => void}
   */
  onAddToAtmWorkflowSchema: undefined,

  /**
   * @virtual
   * @type {(atmLambda: Models.AtmLambda, revisionNumber: RevisionNumber) => void}
   */
  onRevisionClick: undefined,

  /**
   * @virtual
   * @type {(atmLambda: Models.AtmLambda, originRevisionNumber: RevisionNumber) => void}
   */
  onRevisionCreate: undefined,

  /**
   * @type {Boolean}
   */
  areActionsOpened: false,

  /**
   * @type {ComputedProperty<Array<RevisionsTableColumnSpec>>}
   */
  revisionCustomColumnSpecs: computed('mode', function revisionCustomColumnSpecs() {
    const cols = [{
      name: 'name',
      title: this.t('columns.name.title'),
      className: 'filling-column',
      content: {
        type: 'text',
        sourceFieldName: 'name',
        fallbackValue: this.t('columns.name.fallback'),
      },
    }, {
      name: 'summary',
      title: this.t('columns.summary.title'),
      className: 'filling-column',
      content: {
        type: 'text',
        sourceFieldName: 'summary',
        fallbackValue: this.t('columns.summary.fallback'),
      },
    }];
    if (this.get('mode') === 'selection') {
      cols.push({
        name: 'addToWorkflow',
        title: '',
        content: {
          type: 'button',
          buttonLabel: this.t('columns.addToWorkflow.buttonLabel'),
          buttonIcon: 'plus',
        },
      });
    }
    return cols;
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
  atmLambdaActionsArray: conditional(
    eq('mode', raw('selection')),
    collect('copyIdAction'),
    collect('unlinkAction', 'copyIdAction')
  ),

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
    addToWorkflowSchema(revisionNumber) {
      const {
        onAddToAtmWorkflowSchema,
        atmLambda,
      } = this.getProperties('onAddToAtmWorkflowSchema', 'atmLambda');
      if (onAddToAtmWorkflowSchema) {
        onAddToAtmWorkflowSchema(atmLambda, revisionNumber);
      }
    },
  },
});
