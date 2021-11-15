/**
 * Renders single revision.
 *
 * @module components/revisions-table/revision-entry
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { tag } from 'ember-awesome-macros';
import { scheduleOnce } from '@ember/runloop';
import isDirectlyClicked from 'onedata-gui-common/utils/is-directly-clicked';

export default Component.extend(I18n, {
  tagName: 'tr',
  classNames: ['revisions-table-revision-entry'],
  classNameBindings: ['hasDescription::no-description', 'onClick:clickable'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.revisionsTable.revisionEntry',

  /**
   * @virtual
   * @type {Array<RevisionsTableColumnSpec>}
   */
  customColumnSpecs: undefined,

  /**
   * @virtual
   * @type {Number}
   */
  revisionNumber: undefined,

  /**
   * @virtual
   * @type {Object}
   */
  revision: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.RevisionActionsFactory}
   */
  revisionActionsFactory: undefined,

  /**
   * @virtual
   * @type {(revisionNumber: Number) => void}
   */
  onClick: undefined,

  /**
   * @virtual
   * @type {(revisionNumber: Number, colName: string) => void}
   */
  onButtonClick: undefined,

  /**
   * Set by customColumnsSetter.
   * @type {ComputedProperty<Array<{ className: string, value: string }>>}
   */
  customColumns: undefined,

  /**
   * @type {Boolean}
   */
  areActionsOpened: false,

  /**
   * @type {ComputedProperty<Number|'?'>}
   */
  normalizedRevisionNumber: computed(
    'revisionNumber',
    function normalizedRevisionNumber() {
      const revisionNumber = this.get('revisionNumber');
      return Number.isSafeInteger(revisionNumber) ? revisionNumber : '?';
    }
  ),

  /**
   * @type {ComputedProperty<String>}
   */
  state: reads('revision.state'),

  /**
   * @type {ComputedProperty<String>}
   */
  actionsTriggerId: tag `actions-trigger-${'elementId'}`,

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  revisionActions: computed(
    'revisionNumber',
    'revisionActionsFactory',
    function revisionActions() {
      const {
        revisionNumber,
        revisionActionsFactory,
      } = this.getProperties('revisionNumber', 'revisionActionsFactory');
      return revisionActionsFactory ?
        revisionActionsFactory.createActionsForRevisionNumber(revisionNumber) : [];
    }
  ),

  customColumnsSetter: observer('customColumnSpecs', function customColumnsSetter() {
    const customColumnSpecs = this.get('customColumnSpecs') || [];
    const sourceFieldNames = customColumnSpecs.mapBy('content.sourceFieldName').compact();
    let customColumns;
    if (customColumnSpecs.length) {
      const observedProps =
        sourceFieldNames.length ? [`revision.{${sourceFieldNames.join(',')}}`] : [];
      customColumns = computed(...observedProps, function customColumns() {
        const revision = this.get('revision');
        return customColumnSpecs.map(({
          name,
          className: originalClassName,
          content: {
            type,
            sourceFieldName,
            fallbackValue,
            buttonLabel,
            buttonIcon,
          },
        }) => {
          const col = {
            name,
            type,
            className: name,
          };
          if (originalClassName) {
            col.className += ` ${originalClassName}`;
          }
          if (type === 'text') {
            let value = revision[sourceFieldName];
            if (!value) {
              value = fallbackValue;
              col.className += ' no-value';
            }
            col.value = value;
          } else {
            col.buttonLabel = buttonLabel;
            col.buttonIcon = buttonIcon;
          }
          return col;
        });
      });
    } else {
      customColumns = [];
    }
    this.set('customColumns', customColumns);
  }),

  init() {
    this._super(...arguments);
    this.customColumnsSetter();
  },

  click(event) {
    const {
      onClick,
      revisionNumber,
      element,
    } = this.getProperties('onClick', 'revisionNumber', 'element');

    if (!onClick || !isDirectlyClicked(event, element)) {
      return;
    }
    onClick(revisionNumber);
  },

  actions: {
    toggleActionsOpen(state) {
      scheduleOnce('afterRender', this, 'set', 'areActionsOpened', state);
    },
    buttonClick(colName) {
      const {
        onButtonClick,
        revisionNumber,
      } = this.getProperties('onButtonClick', 'revisionNumber');

      if (onButtonClick) {
        onButtonClick(revisionNumber, colName);
      }
    },
  },
});
