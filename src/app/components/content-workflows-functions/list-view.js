import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed, get } from '@ember/object';
import { collect } from '@ember/object/computed';
import { promise } from 'ember-awesome-macros';
import { resolve } from 'rsvp';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend(I18n, GlobalActions, {
  classNames: ['content-workflows-functions-list-view'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentWorkflowsFunctions.listView',

  /**
   * @virtual
   * @type {Models.WorkflowDirectory}
   */
  workflowDirectory: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  onAddFunction: notImplementedIgnore,

  /**
   * @type {ComputedProperty<Models.LambdaFunction>}
   */
  lambdaFunctionsProxy: promise.array(
    computed('workflowDirectory', function lambdaFunctions() {
      const workflowDirectory = this.get('workflowDirectory');
      if (!workflowDirectory) {
        return resolve([]);
      }
      return get(workflowDirectory, 'lambdaFunctionList')
        .then(lambdaFunctionList => get(lambdaFunctionList, 'list'));
    })
  ),

  addNewFunctionAction: computed(function addNewFunctionAction() {
    return {
      action: () => this.get('onAddFunction')(),
      title: this.t('addFunctionButton'),
      class: 'open-add-function-trigger',
      icon: 'plus',
    };
  }),

  /**
   * @override
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  globalActions: collect('addNewFunctionAction'),
});
