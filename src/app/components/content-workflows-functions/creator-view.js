import Component from '@ember/component';
import { getProperties } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend(I18n, {
  classNames: ['content-workflows-functions-creator-view'],

  i18n: service(),
  workflowActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentWorkflowsFunctions.creatorView',

  /**
   * @virtual
   * @type {Models.WorkflowDirectory}
   */
  workflowDirectory: undefined,

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
        workflowDirectory,
        onFunctionAdded,
      } = this.getProperties(
        'workflowActions',
        'workflowDirectory',
        'onFunctionAdded'
      );

      const action = workflowActions.createCreateLambdaFunctionAction({
        workflowDirectory,
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
