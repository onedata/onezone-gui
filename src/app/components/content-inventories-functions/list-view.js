/**
 * Lists lambda functions. It is a whole view component - may be used for
 * a full page carousel.
 *
 * @module components/content-inventories-functions/list-view
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed, get } from '@ember/object';
import { collect } from '@ember/object/computed';
import { promise } from 'ember-awesome-macros';
import { resolve } from 'rsvp';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend(I18n, {
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
   * @virtual
   * @type {Boolean}
   */
  onRegisterViewActions: notImplementedIgnore,

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

  init() {
    this._super(...arguments);
    this.registerViewActions();
  },

  registerViewActions() {
    const {
      onRegisterViewActions,
      globalActions,
    } = this.getProperties('onRegisterViewActions', 'globalActions');

    onRegisterViewActions(globalActions);
  },
});
