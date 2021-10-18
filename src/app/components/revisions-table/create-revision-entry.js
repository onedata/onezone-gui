import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  tagName: 'tr',
  classNames: ['revisions-table-create-revision-entry'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.revisionsTable.createRevisionEntry',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.RevisionActionsFactory}
   */
  revisionActionsFactory: undefined,

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  createRevisionAction: computed(
    'revisionActionsFactory',
    function createRevisionAction() {
      return this.get('revisionActionsFactory').createCreateRevisionAction();
    }
  ),

  /**
   * @override
   */
  click() {
    this.get('createRevisionAction').execute();
  },
});
