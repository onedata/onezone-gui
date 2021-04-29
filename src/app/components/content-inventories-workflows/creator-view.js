import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { getProperties, trySet } from '@ember/object';

export default Component.extend(I18n, {
  classNames: ['content-inventories-workflows-creator-view'],

  i18n: service(),
  workflowActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentInventoriesWorkflows.creatorView',

  /**
   * @virtual
   * @type {Models.AtmInventory}
   */
  atmInventory: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  onBackSlide: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   * @param {Models.AtmWorkflowSchema} createdAtmWorkflowSchema
   */
  onAtmWorkflowSchemaAdded: notImplementedIgnore,

  /**
   * @type {Object}
   */
  newWorkflowSchemaData: undefined,

  /**
   * @type {Boolean}
   */
  isNewWorkflowSchemaDataValid: false,

  /**
   * @type {Boolean}
   */
  isSubmitting: false,

  actions: {
    backSlide() {
      this.get('onBackSlide')();
    },
    detailsChanged({ data, isValid }) {
      this.setProperties({
        newWorkflowSchemaData: isValid ? data : undefined,
        isNewWorkflowSchemaDataValid: isValid,
      });
    },
    async submit() {
      this.set('isSubmitting', true);
      const {
        workflowActions,
        atmInventory,
        onAtmWorkflowSchemaAdded,
        newWorkflowSchemaData,
      } = this.getProperties(
        'workflowActions',
        'atmInventory',
        'onAtmWorkflowSchemaAdded',
        'newWorkflowSchemaData'
      );

      const action = workflowActions.createCreateAtmWorkflowSchemaAction({
        atmInventory,
        rawAtmWorkflowSchema: newWorkflowSchemaData,
      });
      const result = await action.execute();
      trySet(this, 'isSubmitting', false);

      const {
        status,
        result: record,
        error,
      } = getProperties(result, 'status', 'result', 'error');
      if (status === 'done') {
        onAtmWorkflowSchemaAdded(record);
      } else {
        throw error;
      }
    },
  },
});
