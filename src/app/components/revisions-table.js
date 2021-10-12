import Component from '@ember/component';
import { computed } from '@ember/object';
import sortRevisionNumbers from 'onezone-gui/utils/atm-workflow/sort-revision-numbers';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  tagName: 'table',
  classNames: ['revisions-table', 'table', 'table-condensed'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.revisionsTable',

  /**
   * @virtual
   * @type {Object}
   */
  revisionRegistry: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.RevisionActionsFactory}
   */
  revisionActionsFactory: undefined,

  /**
   * @type {ComputedProperty<Array<Number>>}
   */
  sortedRevisionNumbers: computed(
    'revisionRegistry',
    function sortedRevisionNumbers() {
      const revisionRegistry = this.get('revisionRegistry') || {};
      return sortRevisionNumbers(Object.keys(revisionRegistry)).reverse();
    }
  ),
});
