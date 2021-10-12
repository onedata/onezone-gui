import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import computedT from 'onedata-gui-common/utils/computed-t';
import { notEmpty, tag } from 'ember-awesome-macros';
import { scheduleOnce } from '@ember/runloop';

export default Component.extend(I18n, {
  tagName: 'tr',
  classNames: ['revisions-table-revision-entry'],
  classNameBindings: ['hasDescription::no-description'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.revisionsTable.revisionEntry',

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
  description: reads('revision.description'),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  fallbackDescription: computedT('fallbackDescription'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  hasDescription: notEmpty('description'),

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

  actions: {
    toggleActionsOpen(state) {
      scheduleOnce('afterRender', this, 'set', 'areActionsOpened', state);
    },
  },
});
