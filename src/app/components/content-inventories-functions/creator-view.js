import Component from '@ember/component';
import { getProperties } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend(I18n, {
  classNames: ['content-inventories-functions-creator-view'],

  i18n: service(),
  workflowActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentInventoriesFunctions.creatorView',

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
   * @type {Function}
   * @param {Models.LamndaFunction} createdFunction
   */
  onFunctionAdded: notImplementedIgnore,

  actions: {
    backSlide() {
      this.get('onBackSlide')();
    },
    async onFormSubmit(rawLambdaFunction) {
      const {
        workflowActions,
        atmInventory,
        onFunctionAdded,
      } = this.getProperties(
        'workflowActions',
        'atmInventory',
        'onFunctionAdded'
      );

      const action = workflowActions.createCreateLambdaFunctionAction({
        atmInventory,
        rawLambdaFunction,
      });
      const result = await action.execute();

      const {
        status,
        result: record,
        error,
      } = getProperties(result, 'status', 'result', 'error');
      if (status === 'done') {
        onFunctionAdded(record);
      } else {
        throw error;
      }
    },
  },
});
