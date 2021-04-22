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
  classNames: ['content-inventories-functions-list-view'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentInventoriesFunctions.listView',

  /**
   * @virtual
   * @type {Models.AtmInventory}
   */
  atmInventory: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  onAddFunction: notImplementedIgnore,

  /**
   * @type {ComputedProperty<PromiseArray<Models.LambdaFunction>>}
   */
  lambdaFunctionsProxy: promise.array(
    computed('atmInventory', function lambdaFunctions() {
      const atmInventory = this.get('atmInventory');
      if (!atmInventory) {
        return resolve([]);
      }
      return get(atmInventory, 'lambdaFunctionList')
        .then(lambdaFunctionList => get(lambdaFunctionList, 'list'));
    })
  ),

  addNewFunctionAction: computed(function addNewFunctionAction() {
    return {
      action: () => this.get('onAddFunction')(),
      title: this.t('addFunctionButton'),
      class: 'open-add-function-trigger',
      icon: 'add-filled',
    };
  }),

  /**
   * @override
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  globalActions: collect('addNewFunctionAction'),
});
